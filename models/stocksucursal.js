'use strict';

const db = require('../db/conection');
const S = require('sequelize');

class StockSucursal extends S.Model {}

StockSucursal.init(
  {
    id_stock: {
      type: S.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    stock: {
      type: S.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: 'stockSucursal',
    tableName: 'stock_sucursal', // 👈 importante
    timestamps: false,
  }
);

module.exports = StockSucursal;
