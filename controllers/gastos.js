const { Gastos, TipoGastos } = require('../models');

const allGastos = async (req, res) => {
  console.log('llego a gastos');
  try {
    const tipo = await Gastos.findAll({
      include: {
        model: TipoGastos,
        as: 'tipogasto',
        attributes: ['tipoGasto'], // Cambiar si el campo tiene otro nombre
      },
      order: [['fecha', 'ASC']],
    });
    console.log('tipo', tipo);
    res.status(200).json(tipo);
  } catch (error) {
    console.trace('Error al obtener gastos con include');
    console.log('Que error', error);
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

const addGastos = async (req, res) => {
  try {
    const { fecha, monto, observaciones, id_tipogasto } = req.body;

    console.log('body', req.body);

    const newGasto = await Gastos.create({
      fecha,
      monto,
      observaciones,
      id_tipogasto: parseInt(id_tipogasto),
    });
    res.status(201).json({
      message: 'Gasto creado exitosamente',
      newGasto,
    });
  } catch (error) {
    console.error('Error al agregar Gasto :', error);
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};

const updateGastos = async (req, res) => {
  console.log('proveedores ', req.body);
  const { id_gasto, fecha, monto, observaciones, id_tipogasto } = req.body;

  try {
    const gastoExistente = await Gastos.findByPk(id_gasto);

    if (!gastoExistente) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    await Gastos.update(
      { fecha, monto, observaciones, id_tipogasto },
      { where: { id_gasto } }
    );

    res.status(200).json({ message: 'Gasto actualizado correctamente' });
  } catch (error) {
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};

module.exports = { allGastos, addGastos, updateGastos };
