const { Model, DataTypes } = require('sequelize');
const db = require('../db/conection');

class Ventas extends Model {}

Ventas.init(
  {
    id_venta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    porcentaje_aplicado: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    monto_descuento: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    /* usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id_usuario',
      },
    }, */
  },

  {
    timestamps: false, // ← Desactiva createdAt y updatedAt
    sequelize: db,
    modelName: 'ventas',
  }
);

module.exports = Ventas;
