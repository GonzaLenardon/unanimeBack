'use strict';

const S = require('sequelize'); // ✅ Mejor forma de importar
const db = require('../db/conection');

class Proveedores extends S.Model {}

Proveedores.init(
  {
    id_proveedor: {
      type: S.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: S.STRING,
      allowNull: false,
    },
    direccion: {
      type: S.STRING,
      allowNull: true,
    },
    telefono: {
      type: S.STRING,
      allowNull: true,
    },
    contacto: {
      type: S.STRING,
      allowNull: true,
    },
    email: { type: S.STRING, allowNull: true },

    id_sucursal: {
      type: S.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
  },

  {
    sequelize: db,
    modelName: 'proveedores',
  }
);

module.exports = Proveedores;
