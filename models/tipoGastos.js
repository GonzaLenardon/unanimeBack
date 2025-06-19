'use strict';

const db = require('../db/conection');
const S = require('sequelize');

class TipoGastos extends S.Model {}

TipoGastos.init(
  {
    id_tipo: {
      type: S.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tipoGasto: {
      type: S.STRING,
      allowNull: false,
    },
  },
  { sequelize: db, modelName: 'tipoGastos' }
);

module.exports = TipoGastos;
