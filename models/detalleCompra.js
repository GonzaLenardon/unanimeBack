const { Model, DataTypes } = require('sequelize');
const db = require('../db/conection');

class DetalleCompra extends Model {}

DetalleCompra.init(
  {
    id_detalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    cantidad: {
      type: DataTypes.INTEGER,
      defaultValue: DataTypes.NOW,
    },
    costo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    vencimiento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    stock_disponible: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { sequelize: db, modelName: 'detallecompra' }
);

module.exports = DetalleCompra;
