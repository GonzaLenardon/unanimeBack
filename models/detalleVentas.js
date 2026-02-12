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

    // 🔹 NUEVO: pertenece a una venta
    id_venta: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // 🔹 NUEVO: referencia al producto
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // 🔹 NUEVO: lote utilizado (FIFO)
    id_detalle_compra: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    sequelize: db,
    modelName: 'detalleventas',
  }
);

module.exports = DetalleVentas;
