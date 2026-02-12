const {
  Productos,
  DetalleCompra,
  Compra,
  Ventas,
  Proveedores,
  DetalleVentas,
  StockSucursal,
} = require('../models');
const sequelize = require('../db/conection.js');

const { generarCodigo } = require('../utils/generarCodigo.js');

const addProductos = async (req, res) => {
  try {
    let {
      codigo,
      nombre,
      marca,
      modelo,
      talle,
      color,
      costo,
      porcentaje,
      precio_venta,
      observaciones,
    } = req.body;

    const id_sucursal = req.user.sucursal_id;

    // Asegurarse de que los valores tengan 2 decimales
    costo = parseFloat(costo).toFixed(2);
    porcentaje = parseFloat(porcentaje).toFixed(2);
    precio_venta = parseFloat(precio_venta).toFixed(2);
    /*  capacidad = parseFloat(capacidad).toFixed(2); */

    const hoy = new Date();
    const tresHorasEnMs = 3 * 60 * 60 * 1000;
    const fecha = new Date(hoy.getTime() - tresHorasEnMs);

    console.log('Esta es la hora local ', fecha);

    const newProd = await Productos.create({
      codigo,
      nombre,
      marca,
      modelo,
      talle,
      color,
      costo,
      porcentaje,
      precio_venta,
      observaciones,
      createdAt: fecha,
      updatedAt: fecha,
      id_sucursal,
    });

    console.log('uno');
    const id = newProd.id_producto;

    const prodPlano = newProd.get({ plain: true });
    console.log('dos');

    // Paso 2: Generar código
    const codigoGenerado = await generarCodigo(prodPlano); // ahora ya tenés todos los datos

    // Paso 3: Actualizar con código
    console.log('Hasta aca venimoms bien ', prodPlano);
    console.log('Hasta aca venimoms bien ', codigoGenerado, id);

    const prodUp = await Productos.update(
      { codigo: codigoGenerado },
      { where: { id_producto: id } },
    );

    console.log('Esto mando al front', prodUp);

    res.status(201).send(newProd);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al crear producto', details: error.message });
  }
};

const allProductos = async (req, res) => {
  const id_sucursal = req.user.sucursal_id;

  try {
    const productos = await Productos.findAll({
      where: { id_sucursal }, // ✅ AHORA sí se aplica correctamente

      attributes: [
        'id_producto',
        'codigo',
        'nombre',
        'marca',
        'modelo',
        'talle',
        'color',
        'costo',
        'porcentaje',
        'precio_venta',
        'observaciones',
        [
          sequelize.fn(
            'COALESCE',
            sequelize.fn(
              'SUM',
              sequelize.col('compras.detalleCompraToSucursal.stock'),
            ),
            0,
          ),
          'stock_total',
        ],
      ],

      include: [
        {
          model: DetalleCompra,
          as: 'compras',
          attributes: [],
          include: [
            {
              model: StockSucursal,
              as: 'detalleCompraToSucursal',
              attributes: [],
              required: false,
            },
          ],
        },
      ],

      group: ['productos.id_producto'],
      order: [['nombre', 'ASC']],
    });

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const { Op } = require('sequelize');

const productosStock = async (req, res) => {
  const id_sucursal = req.user.sucursal_id;

  try {
    const productos = await Productos.findAll({
      where: { id_sucursal },

      attributes: [
        'id_producto',
        'codigo',
        'nombre',
        'marca',
        'modelo',
        'talle',
        'color',
        'costo',
        'porcentaje',
        'precio_venta',
        'observaciones',
        [
          sequelize.fn(
            'COALESCE',
            sequelize.fn(
              'SUM',
              sequelize.col('compras.detalleCompraToSucursal.stock'),
            ),
            0,
          ),
          'stock_total',
        ],
      ],

      include: [
        {
          model: DetalleCompra,
          as: 'compras',
          attributes: [],
          include: [
            {
              model: StockSucursal,
              as: 'detalleCompraToSucursal',
              attributes: [],
              required: false,
            },
          ],
        },
      ],

      group: ['productos.id_producto'],

      // ✅ ALTERNATIVA SEGURA: Usar sequelize.where con la función completa
      having: sequelize.where(
        sequelize.fn(
          'COALESCE',
          sequelize.fn(
            'SUM',
            sequelize.col('compras.detalleCompraToSucursal.stock'),
          ),
          0,
        ),
        { [Op.gt]: 0 },
      ),

      order: [['nombre', 'ASC']],
    });

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

module.exports = { productosStock };

/* const productosStock = async (req, res) => {
  try {
    const [result] = await sequelize.query(`
  SELECT 
  p.id_producto,
  p.nombre,
  p.codigo, 
  p.marca,
  p.modelo,
  p.talle,
  p.color,
  p.porcentaje,
  p.observaciones,
  p.costo,
  p.precio_venta,  

  -- ✅ Suma total de stock por producto
  COALESCE(suma_stock.total_stock, 0) AS stock_total_producto,

  -- 🧩 Stock por sucursal
  json_agg(
    json_build_object(
      'id_sucursal', s.id_sucursal,
      'nombre_sucursal', s.nombre,
      'stock_total', COALESCE(stock_total, 0)
    ) ORDER BY s.id_sucursal
  ) AS stock_por_sucursal

FROM productos p

-- Agrupación por producto y sucursal (stock)
LEFT JOIN (
  SELECT 
    dc.producto_id,
    ss.id_sucursal,
    su.nombre,
    SUM(ss.stock) AS stock_total
  FROM detallecompras dc
  JOIN stock_sucursal ss ON dc.id_detalle = ss.id_detalle_compra
  JOIN sucursales su ON su.id_sucursal = ss.id_sucursal
  GROUP BY dc.producto_id, ss.id_sucursal, su.nombre
) AS s ON s.producto_id = p.id_producto

-- 👇 Subconsulta para stock total por producto
LEFT JOIN (
  SELECT 
    dc.producto_id,
    SUM(ss.stock) AS total_stock
  FROM detallecompras dc
  JOIN stock_sucursal ss ON dc.id_detalle = ss.id_detalle_compra
  GROUP BY dc.producto_id
) AS suma_stock ON suma_stock.producto_id = p.id_producto

GROUP BY 
  p.id_producto, p.nombre, p.codigo, p.marca, p.modelo, 
  p.talle, p.color, p.porcentaje, p.observaciones, p.precio_venta, 
  p.costo, suma_stock.total_stock

ORDER BY p.nombre;


    `);

    res.json(result);
  } catch (error) {
    console.error('Error al obtener productos con stock:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
}; */

const updateProductos = async (req, res) => {
  const {
    id_producto,
    codigo,
    nombre,
    marca,
    modelo,
    talle,
    color,
    costo,
    porcentaje,
    precio_venta,
    observaciones,
  } = req.body;

  const codGenerado = codigo || (await generarCodigo(req.body));

  try {
    const productoExistente = await Productos.findByPk(id_producto);

    if (!productoExistente) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    const hoy = new Date();
    const tresHorasEnMs = 3 * 60 * 60 * 1000;
    const fecha = new Date(hoy.getTime() - tresHorasEnMs);

    console.log('Esta es la hora local ', fecha);

    await Productos.update(
      {
        codigo: codGenerado,
        nombre,
        marca,
        modelo,
        talle,
        color,
        costo,
        porcentaje,
        precio_venta,
        observaciones,
        updatedAt: fecha,
      },
      { where: { id_producto } },
    );

    res.status(200).json({ message: 'Producto actualizado correctamente' });
  } catch (error) {
    res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};

const actualizarCodigosBarras = async (req, res) => {
  try {
    // 1. Obtener todos los productos
    const productos = await Productos.findAll();

    // 2. Recorrer y actualizar cada uno
    for (const prod of productos) {
      const nuevoCodigo = await generarCodigo(prod.get({ plain: true }));
      await prod.update({ codigo: nuevoCodigo });
      console.log(`Producto ID ${prod.id_producto} → ${nuevoCodigo}`);
    }

    console.log('✅ Códigos de barra actualizados correctamente.');
    return res.status(200).json({
      message: 'Códigos de barra actualizados correctamente',
      total: productos.length,
    });
  } catch (error) {
    console.error('❌ Error al actualizar códigos de barra:', error);
    return res.status(500).json({
      error: 'Error en el servidor',
      details: error.message,
    });
  }
};
const comprasProducto = async (req, res) => {
  const id_producto = req.params.id_producto;
  try {
    const comprasDeProducto = await DetalleCompra.findAll({
      include: [
        {
          model: Productos,
          as: 'producto',
          attributes: ['nombre', 'marca', 'modelo', 'talle'], // 👈 Mostramos el nombre del producto
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

const ventasProducto = async (req, res) => {
  const id_producto = req.params.id_producto;

  try {
    const ventasDeProducto = await DetalleVentas.findAll({
      include: [
        {
          model: Productos,
          as: 'producto',
          attributes: ['nombre', 'marca', 'modelo', 'talle'], // Info del producto
        },
        {
          model: Ventas,
          as: 'venta',
          attributes: ['fecha', 'total', 'id_venta'], // Datos relevantes de la venta
        },
      ],
      where: {
        id_producto: id_producto,
      },
      order: [['id_detalleventa', 'ASC']],
    });

    res.status(200).send(ventasDeProducto);
  } catch (error) {
    console.error('Error al obtener ventas del producto:', error);
    res.status(500).json({ error: 'Error al obtener ventas del producto' });
  }
};
module.exports = {
  addProductos,
  allProductos,
  updateProductos,
  comprasProducto,
  ventasProducto,
  productosStock,
  actualizarCodigosBarras,
};
