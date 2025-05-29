const { Ventas, Compras } = require('../models');
const { fn, col, where: sqWhere, Op } = require('sequelize');

const resumenVentas = async (req, res) => {
  try {
    const hoy = new Date();
    const tresHorasEnMs = 3 * 60 * 60 * 1000;
    const fecha = new Date(hoy.getTime() - tresHorasEnMs);

    if (!fecha) {
      return res.status(400).json({ error: 'Falta fecha' });
    }
    console.log('DESDE LISTADOS ... ', fecha);

    // Aquí usas `sqWhere` y `fn('DATE', col('fecha'))` para comparar solo la fecha, sin hora
    const resultados = await Ventas.findAll({
      attributes: [
        'id_tipo_venta',
        [fn('SUM', col('total')), 'suma_total'],
        [fn('COUNT', col('total')), 'transacciones'],
      ],
      where: sqWhere(fn('DATE', col('fecha')), fecha),
      group: ['id_tipo_venta'],
    });

    const data = resultados.map((r) => ({
      id_tipo_venta: r.get('id_tipo_venta'),
      transacciones: r.get('transacciones'),
      suma_total: parseFloat(r.get('suma_total')),
    }));

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en resumenVentas:', error);
    return res.status(500).json({ error: error.message });
  }
};

const resumenDesdeHasta = async (req, res) => {
  console.log('llego ...');
  try {
    const { desde, hasta } = req.body;

    const desdeFecha = `${desde}T00:00:00.00Z`;
    const hastaFecha = `${hasta}T23:59:59.00Z`;

    console.log(desdeFecha, hastaFecha);

    if (!desde || !hasta) {
      return res.status(400).json({ error: 'Faltan fechas desde o hasta' });
    }

    console.log('Listado ventas desde:', desde, 'hasta:', hasta);

    const resultados = await Ventas.findAll({
      attributes: [
        'id_tipo_venta',
        [fn('SUM', col('total')), 'suma_total'],
        [fn('COUNT', col('total')), 'transacciones'],
      ],
      where: {
        fecha: {
          [Op.between]: [desdeFecha, hastaFecha], // 👈 Filtrado entre fechas
        },
      },
      group: ['id_tipo_venta'],
    });

    const data = resultados.map((r) => ({
      id_tipo_venta: r.get('id_tipo_venta'),
      transacciones: r.get('transacciones'),
      suma_total: parseFloat(r.get('suma_total')),
    }));

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en resumenVentas:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { resumenVentas, resumenDesdeHasta };
