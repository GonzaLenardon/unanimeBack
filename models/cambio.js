const { Model, DataTypes } = require('sequelize');
const db = require('../db/conection');

class Cambios extends Model {}

Cambios.init(
  {
    id_cambio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    id_venta_original: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.STRING,
    },
  },
  { sequelize: db, modelName: 'cambios' }
);

module.exports = Cambios;
