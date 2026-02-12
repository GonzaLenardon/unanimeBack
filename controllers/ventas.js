const {
  Ventas,
  DetalleVentas,
  Productos,
  Usuarios,
  DetalleCompra,
  StockSucursal,
  Cambio,
  DetalleCambio,
  TipoVenta,
  Sucursal,
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

/* Funciona perfecto pero ahora agregamos include Cambios 
const desdeHasta = async (req, res) => {


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
}; */

const desdeHasta = async (req, res) => {
  try {
    const { desde, hasta } = req.body;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Faltan fechas desde o hasta' });
    }

    const desdeFecha = `${desde}T00:00:00.000Z`;
    const hastaFecha = `${hasta}T23:59:59.999Z`;

    const ventas = await Ventas.findAll({
      where: {
        fecha: {
          [Op.between]: [desdeFecha, hastaFecha],
        },
      },
      order: [['id_venta', 'ASC']],
      include: [
        {
          model: DetalleVentas,
          as: 'detalles',
          include: [
            { model: Productos, as: 'producto' /* attributes: ['nombre'] */ },
          ],
        },
        {
          model: Cambio,
          as: 'ventacambio',
          include: [
            {
              model: DetalleCambio,
              as: 'cambiodetalles',
              include: [
                {
                  model: Productos,
                  as: 'detallecambioproducto',
                  attributes: ['nombre'],
                },
              ],
            },
          ],
        },
        { model: Sucursal, as: 'sucursal', attributes: ['nombre'] },
        {
          model: TipoVenta,
          as: 'tipoVenta',
          attributes: ['tipoVenta'],
        },
      ],
    });

    // Ahora agregamos el campo calculado
    const ventasConTotalFinal = ventas.map((venta) => {
      /*  const totalVentaOriginal = venta.detalles.reduce(
        (total, item) => total + Number(item.total) * item.cantidad,
        0
      ); */

      let totalDevuelve = 0;
      let totalRecibe = 0;

      if (venta.ventacambio) {
        for (const detalle of venta.ventacambio.cambiodetalles) {
          const subtotal = Number(detalle.precio_unitario) * detalle.cantidad;
          if (detalle.tipo === 'devuelve') {
            totalDevuelve += subtotal;
          } else if (detalle.tipo === 'recibe') {
            totalRecibe += subtotal;
          }
        }
      }

      const diferenciaCambio = totalRecibe - totalDevuelve;
      const totalFinal = venta.total + diferenciaCambio;

      return {
        ...venta.toJSON(),
        /*  totalVentaOriginal, */
        totalDevuelve,
        totalRecibe,
        diferenciaCambio,
        totalFinal,
      };
    });

    res.status(200).json(ventasConTotalFinal);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener ventas', details: error.message });
  }
};

const ventasPorSucursal = async (req, res) => {
  try {
    const id_sucursal = req.params.sucursal;
    console.log('idSucursal', id_sucursal);

    const { desde, hasta } = req.body;

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Faltan fechas desde o hasta' });
    }

    const desdeFecha = `${desde}T00:00:00.000Z`;
    const hastaFecha = `${hasta}T23:59:59.999Z`;

    const ventas = await Ventas.findAll({
      where: {
        fecha: {
          [Op.between]: [desdeFecha, hastaFecha],
        },
        id_sucursal,
      },
      include: [
        {
          model: DetalleVentas,
          as: 'detalles',
          include: [
            {
              model: Productos,
              as: 'producto',
              // attributes opcional
            },
          ],
        },
        { model: Sucursal, as: 'sucursal', attributes: ['nombre'] },
        {
          model: TipoVenta,
          as: 'tipoVenta',
          attributes: ['tipoVenta'],
        },
        {
          model: Cambio,
          as: 'ventacambio',
          include: [
            {
              model: DetalleCambio,
              as: 'cambiodetalles',
              include: [
                {
                  model: Productos,
                  as: 'detallecambioproducto',
                  attributes: ['nombre'],
                },
              ],
            },
          ],
        },
      ],
      order: ['id_venta'],
    });

    // Calcular totales ajustados por cambios
    const ventasConTotalFinal = ventas.map((venta) => {
      let totalDevuelve = 0;
      let totalRecibe = 0;

      if (venta.ventacambio) {
        for (const detalle of venta.ventacambio.cambiodetalles) {
          const subtotal = Number(detalle.precio_unitario) * detalle.cantidad;
          if (detalle.tipo === 'devuelve') {
            totalDevuelve += subtotal;
          } else if (detalle.tipo === 'recibe') {
            totalRecibe += subtotal;
          }
        }
      }

      const diferenciaCambio = totalRecibe - totalDevuelve;
      const totalFinal = venta.total + diferenciaCambio;

      return {
        ...venta.toJSON(),
        totalDevuelve,
        totalRecibe,
        diferenciaCambio,
        totalFinal,
      };
    });

    res.status(200).json(ventasConTotalFinal);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener ventas', details: error.message });
  }
};

/* const addVentas = async (req, res) => {
  console.log('haber que llega', req.body);

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
}; */

/* const registrarVenta = async (req, res) => {
  const t = await db.transaction();
  console.log('haber que recibo che .. ', req.body);
  try {
    const { id_usuario, id_sucursal, tipo_venta, detalles } = req.body;
    const fecha = new Date();
    let totalVenta = 0;

    // Crear venta
    const venta = await Ventas.create(
      {
        fecha,
        total: 0, // se actualiza después
        id_usuario,
        id_tipo_venta: tipo_venta,
        id_sucursal,
      },
      { transaction: t }
    );

    // Iterar detalles
    for (const item of detalles) {
      let cantidadRestante = item.cantidad;

      // Buscar lotes disponibles en la sucursal (FIFO: primero el más viejo)
      const lotes = await StockSucursal.findAll({
        where: {
          id_sucursal,
        },
        include: {
          model: DetalleCompra,
          as: 'sucursalDetalleToCompra', // Alias correcto
          where: { producto_id: item.id_producto },
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

          // Crear detalle de venta
          const producto = await Productos.findByPk(item.id_producto);
          const total = producto.precio_venta * aDescontar;

          await DetalleVentas.create(
            {
              id_venta: venta.id_venta,
              id_producto: producto.id_producto,
              nombreProducto: producto.nombre,
              cantidad: aDescontar,
              total,
              fecha,
              id_sucursal,
              id_detalle_compra: lote.id_detalle_compra,
            },
            { transaction: t }
          );

          // Descontar stock
          lote.stock -= aDescontar;
          await lote.save({ transaction: t });

          // Acumular total de la venta
          totalVenta += total;
          cantidadRestante -= aDescontar;
        }
      }

      if (cantidadRestante > 0) {
        throw new Error(
          `Stock insuficiente para el producto ${item.id_producto} en la sucursal ${id_sucursal}`
        );
      }
    }

    // Actualizar total de la venta
    venta.total = totalVenta;
    await venta.save({ transaction: t });

    await t.commit();
    console.log('✅ Venta registrada correctamente');
  } catch (error) {
    await t.rollback();
    console.error('❌ Error al registrar la venta:', error.message);
  }
}; */

const registrarVenta = async (req, res) => {
  const t = await db.transaction();
  try {
    const { id_tipo_venta, porcentaje_aplicado, detalles } = req.body;

    console.log('mmmm ', req.body);

    const id_usuario = req.user.id;
    const id_sucursal = req.user.sucursal_id;

    const hoy = new Date();
    const tresHorasEnMs = 3 * 60 * 60 * 1000;
    const fecha = new Date(hoy.getTime() - tresHorasEnMs);

    // Calcular total bruto
    const totalBruto = detalles.reduce(
      (acc, item) => acc + item.precio_venta * item.cantidad,
      0
    );

    const montoDescuento = (totalBruto * porcentaje_aplicado) / 100;
    const totalFinal = totalBruto - montoDescuento;

    // Crear venta con descuento aplicado
    const venta = await Ventas.create(
      {
        fecha,
        total: totalFinal,
        porcentaje_aplicado: porcentaje_aplicado,
        monto_descuento: montoDescuento,
        id_usuario,
        id_sucursal,
        id_tipo_venta: id_tipo_venta, // ⚠️ Asegurate que el campo sea correcto según tu modelo
      },
      { transaction: t }
    );

    // Iterar detalles
    for (const item of detalles) {
      let cantidadRestante = item.cantidad;

      // Buscar lotes FIFO
      const lotes = await StockSucursal.findAll({
        where: { id_sucursal },
        include: {
          model: DetalleCompra,
          as: 'sucursalDetalleToCompra',
          where: { producto_id: item.id_producto },
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

          const producto = await Productos.findByPk(item.id_producto);

          const precioFinalUnitario =
            producto.precio_venta -
            (producto.precio_venta * porcentaje_aplicado) / 100;

          const total = precioFinalUnitario * aDescontar;

          await DetalleVentas.create(
            {
              id_venta: venta.id_venta,
              id_producto: producto.id_producto,
              nombreProducto: producto.nombre,
              cantidad: aDescontar,
              total,
              fecha,
              id_sucursal,
              id_detalle_compra: lote.id_detalle_compra,
            },
            { transaction: t }
          );

          // Descontar del lote
          lote.stock -= aDescontar;
          await lote.save({ transaction: t });

          cantidadRestante -= aDescontar;
        }
      }

      if (cantidadRestante > 0) {
        throw new Error(
          `Stock insuficiente para el producto ${item.id_producto} en la sucursal ${id_sucursal}`
        );
      }
    }

    await t.commit();
    res.status(200).json({ ok: true, venta });
  } catch (error) {
    await t.rollback();
    console.error('❌ Error al registrar venta:', error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
};

/* const deleteVenta = async (req, res) => {
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

    console.log('hasta aca llego ', venta);
    console.log('detalles compras', venta.detalles);

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
}; */

const deleteVenta = async (req, res) => {
  const { id } = req.params;

  const t = await db.transaction();
  try {
    const venta = await Ventas.findByPk(id, { transaction: t });
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const detalles = await DetalleVentas.findAll({
      where: { id_venta: id },
      transaction: t,
    });

    console.log('Detalles sssss ..... ', detalles);
    for (const detalle of detalles) {
      // Verificar que exista el id_detalle_compra
      if (!detalle.id_detalle_compra) {
        throw new Error(
          `Detalle sin id_detalle_compra, no se puede restaurar stock`
        );
      }

      const stock = await StockSucursal.findOne({
        where: {
          id_sucursal: detalle.id_sucursal,
          id_detalle_compra: detalle.id_detalle_compra,
        },
        transaction: t,
      });

      if (stock) {
        stock.stock += detalle.cantidad;
        await stock.save({ transaction: t });
      } else {
        // Si no existía, lo creamos
        await StockSucursal.create(
          {
            id_sucursal: detalle.id_sucursal,
            id_detalle_compra: detalle.id_detalle_compra,
            stock: detalle.cantidad,
          },
          { transaction: t }
        );
      }

      await detalle.destroy({ transaction: t });
    }

    await venta.destroy({ transaction: t });
    await t.commit();

    return res
      .status(200)
      .json({ ok: true, mensaje: 'Venta eliminada y stock restaurado' });
  } catch (error) {
    await t.rollback();
    console.error('❌ Error al eliminar venta:', error.message);
    return res.status(500).json({ ok: false, error: error.message });
  }
};

/* const ventaDetalles = async (req, res) => {
  const id_venta = req.params.id_venta;

  try {
    const ventasDeProducto = await Ventas.findOne({
      include: [
        {
          model: DetalleVentas,
          as: 'detalles',
          include: [
            {
              model: Productos,
              as: 'producto', // 👈 debe coincidir con el alias definido en la relación
              attributes: ['nombre', 'precio_venta'], // Traemos solo el nombre
            },
          ],
        },
      ],
      where: {
        id_venta: id_venta,
      },
     
    });

    res.status(200).send(ventasDeProducto);
  } catch (error) {
    console.error('Error al obtener ventas del producto:', error);
    res.status(500).json({ error: 'Error al obtener ventas del producto' });
  }
}; */

/* const obtenerVentaConHistorialYVigentes = async (req, res) => {
  const id_venta_inicial = parseInt(req.params.id_venta, 10);

  try {
    // 1) OBTENER LA VENTA ORIGINAL
    const ventaOriginal = await Ventas.findOne({
      where: { id_venta: id_venta_inicial },
      attributes: ['id_venta', 'total', 'fecha', 'id_sucursal'],
      include: [
        {
          model: DetalleVentas,
          as: 'detalles',
          attributes: [
            'id_detalleventa',
            'cantidad',
            'total',
            'id_detalle_compra',
            'id_producto',
          ],
          include: [
            {
              model: Productos,
              as: 'producto',
              attributes: ['id_producto', 'nombre', 'precio_venta'],
            },
          ],
        },
      ],
    });

    if (!ventaOriginal) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    // 2) OBTENER TODOS LOS CAMBIOS DE ESTA VENTA
    const cambios = await Cambio.findAll({
      where: { id_venta_original: id_venta_inicial },
      attributes: [
        'id_cambio',
        'fecha',
        'observaciones',
        'id_venta_diferencia',
      ],
      include: [
        {
          model: DetalleCambio,
          as: 'cambiodetalles',
          attributes: [
            'id_detalle_cambio',
            'producto_id',
            'cantidad',
            'precio_unitario',
            'tipo',
            'reemplazado',
            'id_detalle_compra',
          ],
          include: [
            {
              model: Productos,
              as: 'detallecambioproducto',
              attributes: ['id_producto', 'nombre', 'precio_venta'],
            },
          ],
        },
      ],
      order: [['fecha', 'ASC']], // Ordenar por fecha ascendente
    });

    // 3) FORMATEAR VENTA ORIGINAL
    const ventaOriginalFormateada = {
      id_venta: ventaOriginal.id_venta,
      fecha: ventaOriginal.fecha,
      total: ventaOriginal.total,
      id_sucursal: ventaOriginal.id_sucursal,
      productos: ventaOriginal.detalles.map((d) => ({
        id_producto: d.producto?.id_producto || d.id_producto,
        nombre: d.producto?.nombre || null,
        cantidad: d.cantidad,
        precio_unitario: Number(d.total),
        id_detalle_compra: d.id_detalle_compra,
        id_detalle_venta: d.id_detalleventa,
      })),
    };

    // 4) FORMATEAR CAMBIOS
    const cambiosFormateados = cambios.map((cambio, index) => {
      const devueltos = cambio.cambiodetalles
        .filter((dc) => dc.tipo === 'devuelve')
        .map((dc) => ({
          id_detalle_cambio: dc.id_detalle_cambio,
          id_producto: dc.detallecambioproducto?.id_producto || dc.producto_id,
          nombre: dc.detallecambioproducto?.nombre || null,
          cantidad: dc.cantidad,
          precio_unitario: Number(dc.precio_unitario),
          id_detalle_compra: dc.id_detalle_compra,
          reemplazado: dc.reemplazado,
        }));

      const recibidos = cambio.cambiodetalles
        .filter((dc) => dc.tipo === 'recibe')
        .map((dc) => ({
          id_detalle_cambio: dc.id_detalle_cambio,
          id_producto: dc.detallecambioproducto?.id_producto || dc.producto_id,
          nombre: dc.detallecambioproducto?.nombre || null,
          cantidad: dc.cantidad,
          precio_unitario: Number(dc.precio_unitario),
          id_detalle_compra: dc.id_detalle_compra,
          reemplazado: dc.reemplazado,
        }));

      return {
        numero: index + 1,
        id_cambio: cambio.id_cambio,
        fecha: cambio.fecha,
        observaciones: cambio.observaciones,
        id_venta_diferencia: cambio.id_venta_diferencia,
        devueltos,
        recibidos,
      };
    });

    // 5) CALCULAR PRODUCTOS VIGENTES
    let vigentes = [];

    if (cambios.length > 0) {
      // Si hay cambios, los vigentes son los productos "recibidos"
      // en el último cambio que NO han sido reemplazados
      const ultimoCambio = cambios[cambios.length - 1];

      vigentes = ultimoCambio.cambiodetalles
        .filter((dc) => dc.tipo === 'recibe' && dc.reemplazado === false)
        .map((dc) => ({
          id_producto: dc.detallecambioproducto?.id_producto || dc.producto_id,
          nombre: dc.detallecambioproducto?.nombre || null,
          cantidad: dc.cantidad,
          precio_unitario: Number(dc.precio_unitario),
          id_detalle_compra: dc.id_detalle_compra,
          id_detalle_cambio: dc.id_detalle_cambio,
        }));
    } else {
      // Si no hay cambios, los vigentes son los de la venta original
      vigentes = ventaOriginal.detalles.map((d) => ({
        id_producto: d.producto?.id_producto || d.id_producto,
        nombre: d.producto?.nombre || null,
        cantidad: d.cantidad,
        precio_unitario: Number(d.total),
        id_detalle_compra: d.id_detalle_compra,
        id_detalle_venta: d.id_detalleventa,
      }));
    }

    // 6) RESPUESTA FINAL
    return res.status(200).json({
      ventaOriginal: ventaOriginalFormateada,
      cambios: cambiosFormateados,
      vigentes: vigentes,
    });
  } catch (error) {
    console.error('❌ Error al obtener historial y productos vigentes:', error);
    return res.status(500).json({
      error: 'Error al obtener historial y productos vigentes',
      detail: error.message,
    });
  }
}; */

const obtenerVentaConHistorialYVigentes = async (req, res) => {
  const id_venta_inicial = parseInt(req.params.id_venta, 10);

  try {
    // 1) OBTENER LA VENTA ORIGINAL
    const ventaOriginal = await Ventas.findOne({
      where: { id_venta: id_venta_inicial },
      attributes: ['id_venta', 'total', 'fecha', 'id_sucursal'],
      include: [
        {
          model: DetalleVentas,
          as: 'detalles',
          attributes: [
            'id_detalleventa',
            'cantidad',
            'total',
            'id_detalle_compra',
            'id_producto',
          ],
          include: [
            {
              model: Productos,
              as: 'producto',
              attributes: ['id_producto', 'nombre', 'precio_venta'],
            },
          ],
        },
      ],
    });

    if (!ventaOriginal) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    // 2) OBTENER TODOS LOS CAMBIOS DE ESTA VENTA
    const cambios = await Cambio.findAll({
      where: { id_venta_original: id_venta_inicial },
      attributes: [
        'id_cambio',
        'fecha',
        'observaciones',
        'id_venta_diferencia',
      ],
      include: [
        {
          model: DetalleCambio,
          as: 'cambiodetalles',
          attributes: [
            'id_detalle_cambio',
            'producto_id',
            'cantidad',
            'precio_unitario',
            'tipo',
            'reemplazado',
            'id_detalle_compra',
          ],
          include: [
            {
              model: Productos,
              as: 'detallecambioproducto',
              attributes: ['id_producto', 'nombre', 'precio_venta'],
            },
          ],
        },
      ],
      order: [['fecha', 'ASC']], // Ordenar por fecha ascendente
    });

    // 3) FORMATEAR VENTA ORIGINAL
    const ventaOriginalFormateada = {
      id_venta: ventaOriginal.id_venta,
      fecha: ventaOriginal.fecha,
      total: ventaOriginal.total,
      id_sucursal: ventaOriginal.id_sucursal,
      productos: ventaOriginal.detalles.map((d) => ({
        id_producto: d.producto?.id_producto || d.id_producto,
        nombre: d.producto?.nombre || null,
        cantidad: d.cantidad,
        precio_unitario: Number(d.total),
        id_detalle_compra: d.id_detalle_compra,
        id_detalle_venta: d.id_detalleventa,
      })),
    };

    // 4) FORMATEAR CAMBIOS
    const cambiosFormateados = cambios.map((cambio, index) => {
      const devueltos = cambio.cambiodetalles
        .filter((dc) => dc.tipo === 'devuelve')
        .map((dc) => ({
          id_detalle_cambio: dc.id_detalle_cambio,
          id_producto: dc.detallecambioproducto?.id_producto || dc.producto_id,
          nombre: dc.detallecambioproducto?.nombre || null,
          cantidad: dc.cantidad,
          precio_unitario: Number(dc.precio_unitario),
          id_detalle_compra: dc.id_detalle_compra,
          reemplazado: dc.reemplazado,
        }));

      const recibidos = cambio.cambiodetalles
        .filter((dc) => dc.tipo === 'recibe')
        .map((dc) => ({
          id_detalle_cambio: dc.id_detalle_cambio,
          id_producto: dc.detallecambioproducto?.id_producto || dc.producto_id,
          nombre: dc.detallecambioproducto?.nombre || null,
          cantidad: dc.cantidad,
          precio_unitario: Number(dc.precio_unitario),
          id_detalle_compra: dc.id_detalle_compra,
          reemplazado: dc.reemplazado,
        }));

      return {
        numero: index + 1,
        id_cambio: cambio.id_cambio,
        fecha: cambio.fecha,
        observaciones: cambio.observaciones,
        id_venta_diferencia: cambio.id_venta_diferencia,
        devueltos,
        recibidos,
      };
    });

    // 5) CALCULAR PRODUCTOS VIGENTES CORRECTAMENTE
    let vigentes = [];

    if (cambios.length > 0) {
      // ============================================================
      // LÓGICA CORREGIDA: Calcular vigentes considerando TODO
      // ============================================================

      // Paso 1: Crear un mapa con los productos originales
      const mapaVigentes = new Map();

      ventaOriginal.detalles.forEach((d) => {
        const key = `${d.id_producto}_${d.id_detalle_compra}`;
        mapaVigentes.set(key, {
          id_producto: d.producto?.id_producto || d.id_producto,
          nombre: d.producto?.nombre || null,
          cantidad: d.cantidad,
          precio_unitario: Number(d.total),
          id_detalle_compra: d.id_detalle_compra,
          id_detalle_venta: d.id_detalleventa,
          origen: 'original',
        });
      });

      // Paso 2: Procesar TODOS los cambios en orden cronológico
      cambios.forEach((cambio) => {
        cambio.cambiodetalles.forEach((dc) => {
          const key = `${dc.producto_id}_${dc.id_detalle_compra}`;

          if (dc.tipo === 'devuelve') {
            // Restar cantidad devuelta del producto original
            if (mapaVigentes.has(key)) {
              const producto = mapaVigentes.get(key);
              producto.cantidad -= dc.cantidad;

              // Si la cantidad llega a 0 o menos, eliminar del mapa
              if (producto.cantidad <= 0) {
                mapaVigentes.delete(key);
              }
            }
          } else if (dc.tipo === 'recibe') {
            // Agregar o sumar cantidad recibida
            if (mapaVigentes.has(key)) {
              // Si ya existe (mismo producto y lote), sumar cantidad
              const producto = mapaVigentes.get(key);
              producto.cantidad += dc.cantidad;
            } else {
              // Si es un producto nuevo, agregarlo
              mapaVigentes.set(key, {
                id_producto:
                  dc.detallecambioproducto?.id_producto || dc.producto_id,
                nombre: dc.detallecambioproducto?.nombre || null,
                cantidad: dc.cantidad,
                precio_unitario: Number(dc.precio_unitario),
                id_detalle_compra: dc.id_detalle_compra,
                id_detalle_cambio: dc.id_detalle_cambio,
                origen: 'cambio',
              });
            }
          }
        });
      });

      // Paso 3: Convertir el mapa a array
      vigentes = Array.from(mapaVigentes.values());
    } else {
      // Si no hay cambios, los vigentes son los de la venta original
      vigentes = ventaOriginal.detalles.map((d) => ({
        id_producto: d.producto?.id_producto || d.id_producto,
        nombre: d.producto?.nombre || null,
        cantidad: d.cantidad,
        precio_unitario: Number(d.total),
        id_detalle_compra: d.id_detalle_compra,
        id_detalle_venta: d.id_detalleventa,
        origen: 'original',
      }));
    }

    // 6) RESPUESTA FINAL
    return res.status(200).json({
      ventaOriginal: ventaOriginalFormateada,
      cambios: cambiosFormateados,
      vigentes: vigentes,
    });
  } catch (error) {
    console.error('❌ Error al obtener historial y productos vigentes:', error);
    return res.status(500).json({
      error: 'Error al obtener historial y productos vigentes',
      detail: error.message,
    });
  }
};

module.exports = {
  allVentas,
  /*  addVentas, */
  desdeHasta,
  deleteVenta,
  registrarVenta,

  ventasPorSucursal,
  obtenerVentaConHistorialYVigentes,
};
