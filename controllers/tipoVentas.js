const { TipoVenta } = require('../models');

const allTipoVentas = async (req, res) => {
  try {
    const tipo = await TipoVenta.findAll();
    res.status(200).json(tipo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tipos ventas' });
  }
};

module.exports = { allTipoVentas };
