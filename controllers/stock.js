const { Sequelize, Op } = require('sequelize');
const { DetalleCompra, Productos } = require('../models');

const verStock = async (req, res) => {
  console.log('paso x stock');
  try {
    const productosConStockBajo = await Productos.findAll({
      attributes: {
        include: [
          [
            Sequelize.fn('SUM', Sequelize.col('compras.stock_disponible')),
            'stock_total',
          ],
        ],
      },
      include: [
        {
          model: DetalleCompra,
          as: 'compras',
          attributes: [],
        },
      ],
      group: ['productos.id_producto'],
      having: Sequelize.literal('SUM(compras.stock_disponible) < 10'),
      order: [['stock_total', 'ASC']],
    });

    res.status(200).send(productosConStockBajo);
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res
      .status(500)
      .json({ error: 'Error al obtener productos con stock bajo' });
  }
};

module.exports = { verStock };
