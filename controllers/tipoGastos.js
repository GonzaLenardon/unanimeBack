const { TipoGastos } = require('../models');

const allTipoGastos = async (req, res) => {
  console.log('Paso por acas ... ');
  try {
    const tipo = await TipoGastos.findAll();
    res.status(200).json(tipo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error al obtener tipos ventas' });
  }
};

const addTipoGastos = async (req, res) => {
  try {
    const { tipoGasto } = req.body;

    console.log('body', req.body);
    tipoGasto =
      tipoGasto.charAt(0).toUpperCase() + tipoGasto.slice(1).toLowerCase();

    const tipoV = await TipoGastos.findOne({ where: { tipoGasto } });

    if (tipoV) {
      return res.status(400).json({ message: '¡Tipo de Gasto ya existente!' });
    }

    const newTipoVenta = await TipoGastos.create({
      tipoGasto,
    });

    res.status(201).json({
      message: 'Tipo Gasto creada exitosamente',
      newTipoVenta,
    });
  } catch (error) {
    console.error('Error al agregar Gasto :', error);
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};

const updateTipoGasto = async (req, res) => {
  const { id_tipogasto, tipoGasto } = req.body;

  /*   tipoGasto =
    tipoGasto.charAt(0).toUpperCase() + tipoGasto.slice(1).toLowerCase();
 */
  try {
    const tipoExistente = await TipoGastos.findByPk(id_tipogasto);

    if (!tipoExistente) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    await TipoGastos.update({ tipoGasto }, { where: { id_tipogasto } });

    res.status(200).json({ message: 'Tipo Gasto actualizado correctamente' });
  } catch (error) {
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};

module.exports = { allTipoGastos, addTipoGastos, updateTipoGasto };
