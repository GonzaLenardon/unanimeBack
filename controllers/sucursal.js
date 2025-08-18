const { Sucursal, Usuarios } = require('../models');
const sequelize = require('../db/conection.js');

const allSucursal = async (req, res) => {
  try {
    const resp = await Sucursal.findAll();

    res.status(200).json(resp);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al obtener Sucursales' });
  }
};

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

const getSucursal = async (req, res) => {
  const { id_usuario } = req.params;
  console.log('Usuariosssssssss', id_usuario);
  console.log('adadfadsf', req.params);
  try {
    const usuario = await Usuarios.findOne({ where: { id_usuario } });
    /*   console.log('Usuario', usuario); */
    res.status(200).json({ sucursal: usuario.id_sucursal });
  } catch (error) {
    console.error('Error al agregar sucursal:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};

module.exports = { addSucursal, allSucursal, getSucursal };
