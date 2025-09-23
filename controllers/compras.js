const {
  Compra,
  DetalleCompra,
  Productos,
  Proveedores,
  DetalleVentas,
  StockSucursal,
} = require('../models');
const db = require('../db/conection');
const { Op } = require('sequelize');

/* const addCompra = async (req, res) => {
  const { monto, proveedor_id, numero, detalles } = req.body;

  const t = await db.transaction(); // Iniciar transacción
  try {
    const hoy = new Date();
    const tresHorasEnMs = 3 * 60 * 60 * 1000;
    const fecha = new Date(hoy.getTime() - tresHorasEnMs);
    // Crear la compra
    const nuevaCompra = await Compra.create(
      { fecha, monto, numero, proveedor_id },
      { transaction: t }
    );

    // Agregar el id_compra a cada detalle
    const detallesConCompra = detalles.map((detalle) => ({
      ...detalle,
      compra_id: nuevaCompra.id_compra,
    }));

    // Crear los detalles
    await DetalleCompra.bulkCreate(detallesConCompra, { transaction: t });

    await t.commit(); // Confirmar todo
    res.status(201).json({ message: 'Compra registrada con éxito' });
  } catch (error) {
    await t.rollback(); // Revertir si hay error
    console.error('Error al registrar compra:', error);
    res.status(500).json({ error: 'Error al registrar la compra' });
  }
}; */

/* const addCompra = async (req, res) => {
  const { monto, proveedor_id, id_usuario, numero, detalles } =
    req.body;

  const t = await db.transaction(); // Iniciar transacción
  try {
    const hoy = new Date();
    const tresHorasEnMs = 3 * 60 * 60 * 1000;
    const fecha = new Date(hoy.getTime() - tresHorasEnMs);

    // Crear la compra
    const nuevaCompra = await Compra.create(
      { fecha, monto, numero, id_usuario, proveedor_id },
      { transaction: t }
    );

    // Agregar el id_compra a cada detalle
    const detallesConCompra = detalles.map((detalle) => ({
      ...detalle,
      compra_id: nuevaCompra.id_compra,
    }));

    // Crear los detalles y obtener los insertados con sus ids
    const detallesInsertados = await DetalleCompra.bulkCreate(
      detallesConCompra,
      {
        transaction: t,
        returning: true,
      }
    );

    // Insertar stock por sucursal
    const stockData = [];
    console.log('stokc Suc ... ', stockSuc);

    for (const [productoId, stocks] of Object.entries(stockSuc)) {
      stocks.forEach(({ sucursal, stock }) => {
        const detalle = detallesInsertados.find(
          (d) => d.producto_id == productoId
        );
        if (detalle) {
          stockData.push({
            stock,
            productoId: productoId,
            id_sucursal: sucursal,
            id_detalle_compra: detalle.id_detalle,
          });
        }
      });
    }

    console.log('stockData', stockData);

    await StockSucursal.bulkCreate(stockData, { transaction: t });

    await t.commit(); // Confirmar transacción
    res.status(201).json({ message: 'Compra registrada con éxito' });
  } catch (error) {
    await t.rollback(); // Revertir si hay error
    console.error('Error al registrar compra:', error);
    res.status(500).json({ error: 'Error al registrar la compra' });
  }
}; */

const addCompra = async (req, res) => {
  const { monto, proveedor_id, id_usuario, numero, detalles } = req.body;

  const t = await db.transaction();
  try {
    const hoy = new Date();
    const tresHorasEnMs = 3 * 60 * 60 * 1000;
    const fecha = new Date(hoy.getTime() - tresHorasEnMs);

    // Crear la compra
    const nuevaCompra = await Compra.create(
      { fecha, monto, numero, id_usuario, proveedor_id },
      { transaction: t }
    );

    // Agregar el id_compra a cada detalle
    const detallesConCompra = detalles.map((detalle) => ({
      producto_id: detalle.producto_id,
      cantidad: detalle.cantidad,
      costo: detalle.costo,
      nombreProducto: detalle.nombreProducto,
      /*   vencimiento: detalle.vencimiento, */
      vencimiento: fecha,
      compra_id: nuevaCompra.id_compra,
    }));

    // Insertar los detalles de la compra
    const detallesInsertados = await DetalleCompra.bulkCreate(
      detallesConCompra,
      {
        transaction: t,
        returning: true,
      }
    );

    // Armar los registros de stock por sucursal
    const stockData = [];

    for (const detalle of detalles) {
      const detalleInsertado = detallesInsertados.find(
        (d) => d.producto_id === detalle.producto_id
      );

      if (!detalleInsertado) continue;

      for (const { sucursal, stock } of detalle.stock_por_sucursal) {
        stockData.push({
          stock,
          productoId: detalle.producto_id,
          id_sucursal: sucursal,
          id_detalle_compra: detalleInsertado.id_detalle,
        });
      }
    }

    // Insertar stock en StockSucursal
    await StockSucursal.bulkCreate(stockData, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Compra registrada con éxito' });
  } catch (error) {
    await t.rollback();
    console.error('Error al registrar compra:', error);
    res.status(500).json({ error: 'Error al registrar la compra' });
  }
};

const comprasDesdeHasta = async (req, res) => {
  /*  const { fecha } = req.query;
  console.log('fehca en all ventas', fecha); */

  try {
    const { desde, hasta } = req.body;

    const desdeFecha = `${desde}T00:00:00.00Z`;
    const hastaFecha = `${hasta}T23:59:59.00Z`;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Faltan fechas desde o hasta' });
    }

    console.log('Listado Comprassss desde:', desdeFecha, 'hasta:', hastaFecha);

    const ventas = await Compra.findAll({
      include: [
        {
          model: DetalleCompra,
          as: 'detalles',
          include: [
            {
              model: Productos, // 👈
              as: 'producto', // 👈 debe coincidir con el alias definido en la relación
              /* attributes: ['nombre'],  */
            },
          ],
        },

        {
          model: Proveedores, // 👈
          as: 'proveedor', // 👈 debe coincidir con el alias definido en la relación
          attributes: ['nombre'], // Traemos solo el nombre
        },
      ],

      where: {
        fecha: {
          [Op.between]: [desdeFecha, hastaFecha], // 👈 Filtrado entre fechas
        },
      },
      order: [['id_compra', 'ASC']],
    });

    res.status(200).json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener ventas', details: error.message });
  }
};

const eliminarCompra = async (req, res) => {
  const id_compra = req.params.id;
  console.log('id_compra', id_compra);

  try {
    // 1. Obtener todos los lotes (detalles de compra) de esta compra
    const lotes = await DetalleCompra.findAll({
      where: { compra_id: id_compra },
    });

    const loteIds = lotes.map((l) => l.id_detalle);

    if (loteIds.length === 0) {
      return res
        .status(404)
        .json({ error: 'No se encontraron lotes para esta compra.' });
    }

    // 2. Verificar si alguno de estos lotes fue usado en una venta
    const usosEnVentas = await DetalleVentas.findOne({
      where: {
        id_detalle_compra: loteIds, // Asegurate de tener lote_id en tus DetalleVenta
      },
    });

    if (usosEnVentas) {
      return res.status(400).json({
        error:
          'No se puede eliminar la compra: algunos lotes fueron utilizados en ventas.',
      });
    }

    // 3. Si no fueron usados, eliminar detalles y la compra
    await DetalleCompra.destroy({ where: { compra_id: id_compra } });
    await Compra.destroy({ where: { id_compra: id_compra } });

    return res.status(200).json({ mensaje: 'Compra eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar compra:', error);
    res.status(500).json({ error: 'Error al intentar eliminar la compra.' });
  }
};

const detalleCompra = async (req, res) => {
  const id_compra = req.params.id_compra;

  try {
    const compra = await Compra.findOne({
      where: { id_compra },
      include: [
        {
          model: Proveedores,
          as: 'proveedor',
          attributes: ['nombre'],
        },
        {
          model: DetalleCompra,
          as: 'detalles',
          include: [
            {
              model: Productos,
              as: 'producto',
              attributes: ['nombre'],
            },
          ],
        },
      ],
    });

    if (!compra) {
      return res.status(404).json({ error: 'Compra no encontrada' });
    }

    res.status(200).json(compra);
  } catch (error) {
    console.error('Error al obtener los detalles de la compra:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  addCompra,
  comprasDesdeHasta,
  eliminarCompra,
  detalleCompra,
};
