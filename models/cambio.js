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
    id_venta_original: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    id_venta_diferencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    observaciones: {
      type: DataTypes.STRING,
    },
  },
  { sequelize: db, modelName: 'cambios' }
);

module.exports = Cambios;
