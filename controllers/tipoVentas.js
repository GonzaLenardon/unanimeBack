const { TipoVenta } = require('../models');

const allTipoVentas = async (req, res) => {
  try {
    const tipo = await TipoVenta.findAll();
    res.status(200).json(tipo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tipos ventas' });
  }
};

const addTipoVenta = async (req, res) => {
  try {
    const { tipoVenta, porcentajeVenta, habilitado } = req.body;

    console.log('body', req.body);

    const tipoV = await TipoVenta.findOne({ where: { tipoVenta } });

    if (tipoV) {
      return res.status(400).json({ message: '¡Tipo de Venta ya existente!' });
    }

    const newTipoVenta = await TipoVenta.create({
      tipoVenta,
      porcentajeVenta,
      habilitado,
    });

    res.status(201).json({
      message: 'Tipo venta creada exitosamente',
      newTipoVenta,
    });
  } catch (error) {
    console.error('Error al agregar sucursal:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};

const updateTipoVenta = async (req, res) => {
  console.log('proveedores ', req.body);
  const { id_tipo, tipoVenta, porcentajeVenta, habilitado } = req.body;

  try {
    const tipoExistente = await TipoVenta.findByPk(id_tipo);

    if (!tipoExistente) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    await TipoVenta.update(
      { tipoVenta, porcentajeVenta, habilitado },
      { where: { id_tipo } }
    );

    res.status(200).json({ message: 'Tipo Venta actualizado correctamente' });
  } catch (error) {
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};

module.exports = { allTipoVentas, addTipoVenta, updateTipoVenta };
