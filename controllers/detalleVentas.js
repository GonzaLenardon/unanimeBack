const { Ventas, DetalleVentas, Productos, Usuarios } = require('../models');

const addDetalles = async (req, res) => {
  const { cantidad, total, producto_id, venta_id } = req.body;
  console.log(req.body);

  try {
    const newDetalles = await DetalleVentas.create({
      cantidad,
      total,
      producto_id,
      venta_id,
    });
    res.status(201).json(newDetalles);
  } catch (error) {
    res.status(501).json({
      error: 'Error al registrar detalleves ',
      details: error.message,
    });
  }
};

const allDetalles = async (req, res) => {
  const allDetalles = await DetalleVentas.findAll();
  res.status(200).json(allDetalles);
};

module.exports = { addDetalles, allDetalles };
