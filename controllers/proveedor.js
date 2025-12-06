const { Proveedores } = require('../models');

const addProveedor = async (req, res) => {
  try {
    const id_sucursal = req.user.sucursal_id;
    const { nombre, direccion, telefono, email, contacto } = req.body;

    const proveedor = await Proveedores.findOne({ where: { nombre } });

    if (proveedor) {
      return res.status(400).json({ message: '¡Usuario ya existente!' });
    }

    const newProveedor = await Proveedores.create({
      nombre,
      direccion,
      telefono,
      email,
      contacto,
      id_sucursal,
    });
    res
      .status(201)
      .json({ message: 'Proveedor creado exitosamente', newProveedor });
  } catch (error) {
    console.error('Error al agregar proveedor:', error);
    res
      .status(500)
      .json({ error: 'Error en el servidor', details: error.message });
  }
};

const allProveedores = async (req, res) => {
  try {
    const id_sucursal = req.user.sucursal_id;

    const allProv = await Proveedores.findAll({ where: { id_sucursal } });
    res.status(200).json(allProv);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error en el servidor', details: error.message });
  }
};

const updateProveedor = async (req, res) => {
  try {
    const { id_proveedor, nombre, direccion, telefono, email, contacto } =
      req.body;

    const productoExistente = await Proveedores.findByPk(id_proveedor);

    if (!productoExistente) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    await Proveedores.update(
      { nombre, direccion, telefono, email, contacto },
      { where: { id_proveedor } }
    );

    res.status(200).json({ message: 'Proveedor actualizado correctamente' });
  } catch (error) {
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};

module.exports = { addProveedor, allProveedores, updateProveedor };
