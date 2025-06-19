const { Model, DataTypes } = require('sequelize');
const db = require('../db/conection');

class DetalleVentas extends Model {}

DetalleVentas.init(
  {
    id_detalleventa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombreProducto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    id_sucursal: {
      // 👈 AGREGAR ESTO
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false, // ← Desactiva createdAt y updatedAt
    sequelize: db,
    modelName: 'detalleventas',
  }
);

module.exports = DetalleVentas;
