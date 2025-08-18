const {
  Cambio,
  DetalleCambio,
  StockSucursal,
  DetalleCompra,
  Ventas,
  DetalleVentas,
} = require('../models');
const db = require('../db/conection');

/* const registrarCambioProducto = async (req, res) => {
  console.log('dfafad', req.body);
  const {
    id_venta_original,
    observaciones,
    tventaSeleccionada,
    sucursal_id,
    devuelto = [],
    recibido = [],
  } = req.body;

  const t = await db.transaction();

  const hoy = new Date();
  const tresHorasEnMs = 3 * 60 * 60 * 1000;
  const fecha = new Date(hoy.getTime() - tresHorasEnMs);

  const id_tipo_venta = parseInt(tventaSeleccionada);

  try {
    // 1. Insertar encabezado del cambio
    const nuevoCambio = await Cambio.create(
      {
        id_venta_original,
        id_tipo_venta,
        observaciones,
        fecha,
      },
      { transaction: t }
    );

    // 2. Insertar productos devueltos y aumentar stock
    for (const item of devuelto) {
      await DetalleCambio.create(
        {
          id_cambio: nuevoCambio.id_cambio,
          tipo: 'devuelve',
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        },
        { transaction: t }
      );

      const stock = await StockSucursal.findOne({
        where: {
          id_detalle_compra: item.id_detalle_compra,
          id_sucursal: sucursal_id,
        },
        transaction: t,
      });

      if (stock) {
        stock.stock += item.cantidad;
        await stock.save({ transaction: t });
      } else {
        await StockSucursal.create(
          {
            id_detalle_compra: item.id_detalle_compra,
            id_sucursal: sucursal_id,
            stock: item.cantidad,
          },
          { transaction: t }
        );
      }
    }

    // 3. Insertar productos recibidos y descontar stock (FIFO)
    for (const item of recibido) {
      let cantidadRestante = item.cantidad;

      const lotes = await StockSucursal.findAll({
        where: { id_sucursal: sucursal_id },
        include: {
          model: DetalleCompra,
          as: 'sucursalDetalleToCompra',
          where: { producto_id: item.producto_id },
        },
        order: [
          [
            { model: DetalleCompra, as: 'sucursalDetalleToCompra' },
            'createdAt',
            'ASC',
          ],
        ],
        transaction: t,
      });

      for (const lote of lotes) {
        if (cantidadRestante <= 0) break;

        const disponible = lote.stock;

        if (disponible > 0) {
          const aDescontar = Math.min(disponible, cantidadRestante);

          await DetalleCambio.create(
            {
              id_cambio: nuevoCambio.id_cambio,
              tipo: 'recibe',
              producto_id: item.producto_id,
              cantidad: aDescontar,
              precio_unitario: item.precio_unitario,
            },
            { transaction: t }
          );

          lote.stock -= aDescontar;
          await lote.save({ transaction: t });

          cantidadRestante -= aDescontar;
        }
      }

      if (cantidadRestante > 0) {
        throw new Error(
          `Stock insuficiente para el producto ID ${item.producto_id} en la sucursal ${sucursal_id}`
        );
      }
    }

    await t.commit();

    return res.status(201).json({
      message: 'Cambio registrado correctamente',
      id_cambio: nuevoCambio.id_cambio,
    });
  } catch (error) {
    await t.rollback();
    console.error('Error en el cambio de producto:', error);
    return res.status(500).json({
      message: error.message || 'Error al registrar el cambio',
    });
  }
}; */

const registrarCambioProducto = async (req, res) => {
  const {
    id_venta_original,
    observaciones,
    tventaSeleccionada,
    sucursal_id,
    id_usuario,
    devuelto = [],
    recibido = [],
    diferencia,
  } = req.body;

  const t = await db.transaction();
  const hoy = new Date();
  const tresHorasEnMs = 3 * 60 * 60 * 1000;
  const fecha = new Date(hoy.getTime() - tresHorasEnMs);

  try {
    let id_venta_diferencia = null;

    // Si hay diferencia positiva, registrar nueva venta
    if (diferencia > 0) {
      console.log(
        ' ??????????????????????????????????????????????????????????? ',
        id_venta_original,
        observaciones,
        tventaSeleccionada,
        sucursal_id,
        id_usuario,
        diferencia
      );

      const nuevaVenta = await Ventas.create(
        {
          id_tipo_venta: parseInt(tventaSeleccionada),
          fecha,
          total: diferencia,
          id_sucursal: sucursal_id,
          id_usuario,
          porcentaje_aplicado: 0,
          monto_descuento: 0,

          // Podés poner un flag tipo 'venta_por_cambio' si querés
        },
        { transaction: t }
      );

      // Agregar un detalle "genérico" para registrar el pago de la diferencia
      await DetalleVentas.create(
        {
          id_venta: nuevaVenta.id_venta,
          id_producto: null, // o el id de un producto ficticio "Diferencia por cambio"
          nombreProducto: 'Diferencia por cambio',
          cantidad: 1,
          precio_unitario: diferencia,
          total: diferencia,
          fecha,
          id_sucursal: sucursal_id,
          id_detalle_compra: null, // porque no viene de un lote de compra
        },
        { transaction: t }
      );

      id_venta_diferencia = nuevaVenta.id_venta;
    }

    // Registrar encabezado del cambio
    const nuevoCambio = await Cambio.create(
      {
        id_venta_original,
        id_venta_diferencia, // puede ser null si no hay diferencia
        fecha,
        observaciones,
      },
      { transaction: t }
    );

    // Procesar productos devueltos
    for (const item of devuelto) {
      await DetalleCambio.create(
        {
          id_cambio: nuevoCambio.id_cambio,
          tipo: 'devuelve',
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
        },
        { transaction: t }
      );

      const stock = await StockSucursal.findOne({
        where: {
          id_detalle_compra: item.id_detalle_compra,
          id_sucursal: sucursal_id,
        },
        transaction: t,
      });

      if (stock) {
        stock.stock += item.cantidad;
        await stock.save({ transaction: t });
      } else {
        await StockSucursal.create(
          {
            id_detalle_compra: item.id_detalle_compra,
            id_sucursal: sucursal_id,
            stock: item.cantidad,
          },
          { transaction: t }
        );
      }
    }

    // Procesar productos recibidos (FIFO)
    for (const item of recibido) {
      let cantidadRestante = item.cantidad;

      const lotes = await StockSucursal.findAll({
        where: { id_sucursal: sucursal_id },
        include: {
          model: DetalleCompra,
          as: 'sucursalDetalleToCompra',
          where: { producto_id: item.producto_id },
        },
        order: [
          [
            { model: DetalleCompra, as: 'sucursalDetalleToCompra' },
            'createdAt',
            'ASC',
          ],
        ],
        transaction: t,
      });

      for (const lote of lotes) {
        if (cantidadRestante <= 0) break;

        const disponible = lote.stock;

        if (disponible > 0) {
          const aDescontar = Math.min(disponible, cantidadRestante);

          await DetalleCambio.create(
            {
              id_cambio: nuevoCambio.id_cambio,
              tipo: 'recibe',
              producto_id: item.producto_id,
              cantidad: aDescontar,
              precio_unitario: item.precio_unitario,
            },
            { transaction: t }
          );

          lote.stock -= aDescontar;
          await lote.save({ transaction: t });

          cantidadRestante -= aDescontar;
        }
      }

      if (cantidadRestante > 0) {
        throw new Error(
          `Stock insuficiente para el producto ID ${item.producto_id} en la sucursal ${sucursal_id}`
        );
      }
    }

    await t.commit();

    return res.status(201).json({
      message: 'Cambio registrado correctamente',
      id_cambio: nuevoCambio.id_cambio,
      id_venta_diferencia,
    });
  } catch (error) {
    await t.rollback();
    console.error('Error en el cambio de producto:', error);
    return res.status(500).json({
      message: error.message || 'Error al registrar el cambio',
    });
  }
};

module.exports = { registrarCambioProducto };
