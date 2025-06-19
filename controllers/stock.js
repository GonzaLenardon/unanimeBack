const { Sequelize, Op } = require('sequelize');
const { DetalleCompra, Productos, StockSucursal } = require('../models');
const sequelize = require('../db/conection');

const verStock = async (req, res) => {
  try {
    const [result] = await sequelize.query(`
      SELECT 
        p.id_producto,
        p.nombre,
        p.codigo, p.marca,p.modelo,p.talle,p.color,p.precio_venta,
       
        ss.id_sucursal,
        su.nombre AS nombre_sucursal,
        SUM(ss.stock) AS stock_total
      FROM productos p
      JOIN detallecompras dc ON p.id_producto = dc.producto_id
      JOIN stock_sucursal ss ON dc.id_detalle = ss.id_detalle_compra
      JOIN sucursales su ON su.id_sucursal = ss.id_sucursal
      GROUP BY p.id_producto, p.nombre, ss.id_sucursal, su.nombre
      ORDER BY p.nombre, su.nombre;
    `);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener el stock por sucursal:', error);
    res.status(500).json({ error: 'Error al obtener el stock por sucursal' });
  }
};

/* const verStock = async (req, res) => {
  console.log('paso x stock');
  try {
    const productosConStockBajo = await Productos.findAll({
      attributes: {},
      include: [
        {
          model: DetalleCompra,
          as: 'compras',
          attributes: [],
        },
      ],
      include: [
        {
          model: StockSucursal,
          as: 'stockSucursal',
          attributes: ['sucursal_id', 'stock'],
        },
      ],
      group: ['productos.id_producto'],
    });

    res.status(200).send(productosConStockBajo);
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener productos con stock bajo' });
  }
}; */

module.exports = { verStock };
