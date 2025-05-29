const {
  Ventas,
  DetalleVentas,
  Productos,
  Usuarios,
  DetalleCompra,
} = require('../models');
const db = require('../db/conection');
const { fn, col, where, Op } = require('sequelize');

const allVentas = async (req, res) => {
  /*  const { fecha } = req.query;
  console.log('fehca en all ventas', fecha); */

  const hoy = new Date();
  const tresHorasEnMs = 3 * 60 * 60 * 1000;
  const fecha = new Date(hoy.getTime() - tresHorasEnMs);

  try {
    const ventas = await Ventas.findAll({
      include: [
        {
          model: DetalleVentas,
          as: 'detalles',
        },
      ],
      where: where(fn('DATE', col('ventas.fecha')), fecha), // <-- bien escrito
    });

    res.status(200).json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener ventas', details: error.message });
  }
};

const desdeHasta = async (req, res) => {
  /*  const { fecha } = req.query;
  console.log('fehca en all ventas', fecha); */

  try {
    const { desde, hasta } = req.body;

    const desdeFecha = `${desde}T00:00:00.00Z`;
    const hastaFecha = `${hasta}T23:59:59.00Z`;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Faltan fechas desde o hasta' });
    }

    console.log('Listado ventas desde:', desdeFecha, 'hasta:', hastaFecha);

    const ventas = await Ventas.findAll({
      include: [
        {
          model: DetalleVentas,
          as: 'detalles',
          include: [
            {
              model: Productos, // 👈
              as: 'producto', // 👈 debe coincidir con el alias definido en la relación
              attributes: ['nombre'], // Traemos solo el nombre
            },
          ],
        },
      ],
      where: {
        fecha: {
          [Op.between]: [desdeFecha, hastaFecha], // 👈 Filtrado entre fechas
        },
      },
    });

    res.status(200).json(ventas);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener ventas', details: error.message });
  }
};

const addVentas = async (req, res) => {
  const { id_usuario, id_tipo_venta, total, detalles } = req.body;

  try {
    const hoy = new Date();
    const tresHorasEnMs = 3 * 60 * 60 * 1000;
    const fecha = new Date(hoy.getTime() - tresHorasEnMs);

    const t = await db.transaction();

    const nuevaVenta = await Ventas.create(
      { fecha, id_usuario, id_tipo_venta, total },
      { transaction: t }
    );

    let detalleVta = [];

    for (const d of detalles) {
      let cantidadRestante = d.cantidad;

      const lotes = await DetalleCompra.findAll({
        where: {
          producto_id: d.id_producto,
          stock_disponible: { [Op.gt]: 0 },
        },
        order: [['vencimiento', 'ASC']],
        transaction: t,
      });

      console.log('lotesssssssssssssssssssssssssssssssssssssss ... ', lotes);
      for (const lote of lotes) {
        if (cantidadRestante <= 0) break;

        const cantidadAConsumir = Math.min(
          lote.stock_disponible,
          cantidadRestante
        );

        await lote.decrement('stock_disponible', {
          by: cantidadAConsumir,
          transaction: t,
        });

        detalleVta.push({
          id_venta: nuevaVenta.id_venta,
          id_producto: d.id_producto,
          fecha: fecha,
          cantidad: cantidadAConsumir,
          total: d.precio_venta * cantidadAConsumir,
          id_detalle_compra: lote.id_detalle,
        });

        cantidadRestante -= cantidadAConsumir;
      }
      console.log('Detallless ventasssssssssssssssssss', detalleVta);

      if (cantidadRestante > 0) {
        throw new Error(
          `No hay suficiente stock para el producto ID ${d.id_producto}`
        );
      }
    }

    await DetalleVentas.bulkCreate(detalleVta, { transaction: t });

    await t.commit();
    res.status(201).json({ venta: nuevaVenta, detalles: detalleVta });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: 'Error al registrar una venta', details: error.message });
  }
};

const deleteVenta = async (req, res) => {
  const { id } = req.params; // ID de la venta a eliminar
  console.log('REQ.Params', req.params);

  const t = await db.transaction();

  try {
    // Buscar la venta
    const venta = await Ventas.findByPk(id, {
      include: [
        {
          model: DetalleVentas,
          as: 'detalles',
        },
      ],
      transaction: t,
    });

    if (!venta) {
      await t.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    // Restaurar stock en los lotes originales
    for (const detalle of venta.detalles) {
      const lote = await DetalleCompra.findByPk(detalle.id_detalle_compra, {
        transaction: t,
      });

      if (lote) {
        await lote.increment('stock_disponible', {
          by: detalle.cantidad,
          transaction: t,
        });
      }
    }

    // Eliminar detalles de la venta
    await DetalleVentas.destroy({
      where: { id_venta: id },
      transaction: t,
    });

    // Eliminar la venta
    await Ventas.destroy({
      where: { id_venta: id },
      transaction: t,
    });

    await t.commit();
    res.status(200).json({ message: 'Venta eliminada y stock restaurado' });
  } catch (error) {
    await t.rollback();
    console.error('Error al eliminar venta:', error);
    res.status(500).json({
      error: 'Error al eliminar la venta',
      details: error.message,
    });
  }
};

module.exports = { allVentas, addVentas, desdeHasta, deleteVenta };
