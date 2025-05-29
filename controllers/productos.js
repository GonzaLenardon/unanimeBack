const { Sequelize } = require('sequelize');
const { Productos, DetalleCompra, Compra, Proveedores } = require('../models');

const addProductos = async (req, res) => {
  try {
    let { codigo, nombre, marca, capacidad, costo, porcentaje, precio_venta } =
      req.body;
    console.log('eeeeeee', req.body);

    // Asegurarse de que los valores tengan 2 decimales
    costo = parseFloat(costo).toFixed(2);
    porcentaje = parseFloat(porcentaje).toFixed(2);
    precio_venta = parseFloat(precio_venta).toFixed(2);
    capacidad = parseFloat(capacidad).toFixed(2);

    console.log('capacidad', capacidad);
    const newProd = await Productos.create({
      codigo,
      nombre,
      marca,
      capacidad,
      costo,
      porcentaje,
      precio_venta,
    });

    console.log(newProd);

    res.status(201).send(newProd);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al crear producto', details: error.message });
  }
};

const allProductos = async (req, res) => {
  try {
    const productosConStock = await Productos.findAll({
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
      order: [['nombre', 'ASC']],
    });

    // Mover este console.log aquí si querés ver los datos

    res.status(200).send(productosConStock);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const updateProductos = async (req, res) => {
  const {
    id_producto,
    codigo,
    nombre,
    marca,
    capacidad,
    costo,
    porcentaje,
    precio_venta,
  } = req.body;

  console.log('que llega', req.body);

  try {
    const productoExistente = await Productos.findByPk(id_producto);

    if (!productoExistente) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    await Productos.update(
      { nombre, codigo, marca, capacidad, costo, porcentaje, precio_venta },
      { where: { id_producto } }
    );

    res.status(200).json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};

/* const comprasProducto = async (req, res) => {
  const id_producto = req.params.id_producto;
  try {
    const comprasDeProducto = await DetalleCompra.findAll({
      include: [
        {
          model: Productos,
          as: 'producto',
          attributes: [],
        },
      ],
      where: {
        producto_id: id_producto,
      },

      order: [['id_detalle', 'ASC']],
    });

    // Mover este console.log aquí si querés ver los datos

    res.status(200).send(comprasDeProducto);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}; */

const comprasProducto = async (req, res) => {
  const id_producto = req.params.id_producto;
  try {
    const comprasDeProducto = await DetalleCompra.findAll({
      include: [
        {
          model: Productos,
          as: 'producto',
          attributes: ['nombre', 'marca', 'capacidad'], // 👈 Mostramos el nombre del producto
        },
        {
          model: Compra,
          as: 'compra',
          include: [
            {
              model: Proveedores,
              as: 'proveedor',
              attributes: ['nombre'], // 👈 Nombre del proveedor
            },
          ],
          attributes: ['fecha'], // 👈 Podés traer más si querés (como total, id_compra, etc.)
        },
      ],
      where: {
        producto_id: id_producto,
      },
      order: [['id_detalle', 'ASC']],
    });

    res.status(200).send(comprasDeProducto);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

module.exports = {
  addProductos,
  allProductos,
  updateProductos,
  comprasProducto,
};
