const { Sucursal } = require('../models');
const sequelize = require('../db/conection.js');

const addSucursal = async (req, res) => {
  try {
    const { nombre, domicilio, localidad, provincia, contacto, celular } =
      req.body;

    console.log('body', req.body);

    const sucursalExistente = await Sucursal.findOne({ where: { nombre } });

    if (sucursalExistente) {
      return res.status(400).json({ message: '¡Sucursal ya existente!' });
    }

    const newSucursal = await Sucursal.create({
      nombre,
      domicilio,
      localidad,
      provincia,
      contacto,
      celular,
    });

    res.status(201).json({
      message: 'Sucursal creada exitosamente',
      newSucursal,
    });
  } catch (error) {
    console.error('Error al agregar sucursal:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};

module.exports = { addSucursal };
