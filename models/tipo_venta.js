'use strict';

const db = require('../db/conection');
const S = require('sequelize');

class TipoVenta extends S.Model {}

TipoVenta.init(
  {
    id_tipo: {
      type: S.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipoVenta: {
      type: S.STRING,
      allowNull: false,
    },
  },
  { sequelize: db, modelName: 'tipoventa' }
);

module.exports = TipoVenta;
