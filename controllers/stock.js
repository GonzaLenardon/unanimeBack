const { Sequelize, Op } = require('sequelize');
const {
  DetalleCompra,
  Productos,
  StockSucursal,
  Transferencia,
  TransferenciaDetalle,
} = require('../models');
const db = require('../db/conection');

const verStock = async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT 
        p.id_producto,
        p.nombre,
        p.codigo, p.marca,p.modelo,p.talle,p.color,p.precio_venta,
       
        ss.id_sucursal,
        su.nombre AS nombre_sucursal,
        SUM(ss.stock) AS stock_total
      FROM productos p
      JOIN detallecompras dc ON p.id_producto = dc.producto_id
      JOIN stock_sucursal ss ON dc.id_detalle = ss.id_detalle_compra
      JOIN sucursales su ON su.id_sucursal = ss.id_sucursal
      GROUP BY p.id_producto, p.nombre, ss.id_sucursal, su.nombre
      ORDER BY p.nombre, su.nombre;
    `);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener el stock por sucursal:', error);
    res.status(500).json({ error: 'Error al obtener el stock por sucursal' });
  }
};

const transferirStock = async (req, res) => {
  console.log('Datos recibidos para transferir stock:', req.body);
  const {
    origenId,
    destinoId,
    productoId,
    cantidad,
    nombreProducto,
    id_usuario,
  } = req.body;

  const t = await db.transaction();

  const hoy = new Date();
  const tresHorasEnMs = 3 * 60 * 60 * 1000;
  const fecha = new Date(hoy.getTime() - tresHorasEnMs);

  try {
    // Validaciones básicas
    if (!origenId || !destinoId || !productoId || !cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    // Buscar en StockSucursal por sucursal origen, trayendo lotes del producto usando DetalleCompra
    const stockOrigen = await StockSucursal.findAll({
      where: { id_sucursal: origenId },
      include: [
        {
          model: DetalleCompra,
          as: 'sucursalDetalleToCompra',
          where: { producto_id: productoId },
        },
      ],
      order: [
        [
          { model: DetalleCompra, as: 'sucursalDetalleToCompra' },
          'id_detalle',
          'ASC',
        ],
      ], // FIFO
      transaction: t,
    });

    if (!stockOrigen.length) {
      await t.rollback();
      return res.status(404).json({
        error: 'No hay stock disponible del producto en la sucursal origen',
      });
    }

    let cantidadRestante = cantidad;
    const detallesTransferencia = [];

    for (const registro of stockOrigen) {
      const disponible = registro.stock;
      if (disponible <= 0) continue;

      const aTransferir = Math.min(disponible, cantidadRestante);
      cantidadRestante -= aTransferir;

      // Descontar del origen
      registro.stock -= aTransferir;
      await registro.save({ transaction: t });

      // Agregar al destino
      await StockSucursal.create(
        {
          stock: aTransferir,
          id_sucursal: destinoId,
          id_detalle_compra: registro.id_detalle_compra,
        },
        { transaction: t }
      );

      detallesTransferencia.push({
        producto_id: productoId,
        nombreProducto: registro.sucursalDetalleToCompra.nombreProducto,
        cantidad: aTransferir,
        lote: registro.sucursalDetalleToCompra?.id_detalle?.toString() || '0',
        vencimiento:
          registro.sucursalDetalleToCompra?.vencimiento || new Date(),
      });

      if (cantidadRestante <= 0) break;
    }

    if (cantidadRestante > 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: 'Stock insuficiente en la sucursal origen' });
    }

    // Crear registro de Transferencia
    const transferencia = await Transferencia.create(
      {
        sucursal_origen_id: origenId,
        sucursal_destino_id: destinoId,
        fecha: fecha,
        id_usuario: id_usuario, // Solo si lo agregás al modelo
      },
      { transaction: t }
    );

    // Insertar detalles
    const detallesConFk = detallesTransferencia.map((d) => ({
      ...d,
      transferencia_id: transferencia.id,
    }));

    await TransferenciaDetalle.bulkCreate(detallesConFk, { transaction: t });

    await t.commit();
    return res
      .status(201)
      .json({ message: 'Transferencia realizada con éxito' });
  } catch (error) {
    await t.rollback();
    console.error('Error en transferencia:', error);
    return res
      .status(500)
      .json({ error: 'Error al realizar la transferencia' });
  }
};

module.exports = { verStock, transferirStock };
