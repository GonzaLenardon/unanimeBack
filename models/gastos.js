const { Model, DataTypes } = require('sequelize');
const db = require('../db/conection');

class Gastos extends Model {}

Gastos.init(
  {
    id_tipo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    monto: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize: db, modelName: 'gastos' }
);

module.exports = Gastos;
