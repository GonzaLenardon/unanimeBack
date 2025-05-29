'use strict';

const db = require('../db/conection');
const S = require('sequelize');

class Productos extends S.Model {}

Productos.init(
  {
    id_producto: {
      type: S.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigo: {
      type: S.STRING,
    },

    nombre: {
      type: S.STRING,
      allowNull: false,
    },
    marca: {
      type: S.STRING,
      allowNull: false,
      defaultValue: 'propio',
    },
    capacidad: {
      type: S.FLOAT,
      allowNull: false,
    },

    costo: {
      type: S.FLOAT,
      allowNull: false,
    },
    porcentaje: {
      type: S.FLOAT,
      allowNull: false,
    },
    precio_venta: {
      type: S.FLOAT,
      allowNull: false,
    },
  },
  { sequelize: db, modelName: 'productos' }
);

module.exports = Productos;
