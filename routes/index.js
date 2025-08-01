const { Router } = require('express');
const { authMiddleware } = require('../controllers/authMiddleware');
const router = Router();

const {
  addSucursal,
  allSucursal,
  getSucursal,
} = require('../controllers/sucursal');

const {
  allUsers,
  User,
  addUser,
  login,
  resetPassword,
  getUser,
  logout,
  upUser,
} = require('../controllers/usuarios');
const {
  allVentas,
  addVentas,
  desdeHasta,
  deleteVenta,
  registrarVenta,
  ventaDetalles,
  ventasPorSucursal,
} = require('../controllers/ventas');
const {
  addcompras,
  addCompra,
  comprasDesdeHasta,
  eliminarCompra,
  detalleCompra,
} = require('../controllers/compras');

const {
  addProductos,
  /*   allProductos, */
  updateProductos,
  comprasProducto,
  productosStock,
  ventasProducto,
  actualizarCodigosBarras,
} = require('../controllers/productos');
const {
  addProveedor,
  allProveedores,
  updateProveedor,
} = require('../controllers/proveedor');
const {
  addDetalles,
  allDetalles,
  addVentaConDetalles,
} = require('../controllers/detalleVentas');

const {
  allTipoVentas,
  addTipoVenta,
  updateTipoVenta,
} = require('../controllers/tipoVentas');

const { sequelize } = require('sequelize');
const {
  resumenVentas,
  ventasDesdeHasta,
  resumenDesdeHasta,
  resumenVentasDesdeHasta,
  ventasPorSucursales,
} = require('../controllers/listados');
const { verStock, transferirStock } = require('../controllers/stock');
const {
  allTipoGastos,
  addTipoGastos,
  updateTipoGasto,
} = require('../controllers/tipoGastos');

const {
  addGastos,
  allGastos,
  updateGastos,
  resumenGastos,
} = require('../controllers/gastos');

const { registrarCambioProducto } = require('../controllers/cambios');

router.get('/user', allUsers);
router.get('/user/me', authMiddleware, getUser);
router.post('/user', addUser);
router.put('/user', upUser);
router.post('/user/login', login);
router.post('/user/logout', logout);
router.post('/user/reset', resetPassword);

router.get('/ventas', allVentas);
router.post('/ventas', registrarVenta);
router.post('/ventas/desdehasta', desdeHasta);

router.post('/ventas/sucursal/:sucursal', ventasPorSucursal);

router.delete('/ventas/:id', deleteVenta);

router.get('/ventas/:id_producto', ventasProducto);
router.get('/ventas/detalles/:id_venta', ventaDetalles);

router.post('/listados/:sucursal', resumenVentas);
router.get('/listados/stock/sucursal/:sucursal', verStock);
router.post('/listados/ventas/resumen', resumenVentasDesdeHasta);
router.post('/listados/ventas/sucursales', ventasPorSucursales);

router.get('/productos', productosStock);
/* router.get('/productos/:id_producto', comprasProducto); */
router.post('/productos', addProductos);
router.put('/productos/', updateProductos);
router.put('/productos/upcodigobarra', actualizarCodigosBarras);

router.get('/proveedor', allProveedores);
router.post('/proveedor', addProveedor);
router.put('/proveedor', updateProveedor);

router.post('/detalles', addDetalles);
router.get('/detalles', allDetalles);
/* router.post('/detalles', addVentaConDetalles); */

router.post('/compra', addCompra);
router.post('/compra/desdehasta', comprasDesdeHasta);
router.delete('/compra/:id', eliminarCompra);
router.get('/compra/:id_producto', comprasProducto);
router.get('/compra/detalles/:id_compra', detalleCompra);

router.get('/tipoventa', allTipoVentas);
router.post('/tipoventa', addTipoVenta);
router.put('/tipoventa', updateTipoVenta);

router.get('/gastos', allGastos);
router.post('/gastos', addGastos);
router.put('/gastos', updateGastos);
router.post('/gastos/desdehasta', resumenGastos);

router.get('/tipogasto', allTipoGastos);
router.post('/tipogasto', addTipoGastos);
router.put('/tipogasto', updateTipoGasto);

router.post('/stock/transferir', transferirStock);

router.post('/sucursal', addSucursal);
router.get('/sucursal', allSucursal);
router.get('/sucursal/usuario/:id_usuario', getSucursal);

router.post('/cambio', registrarCambioProducto);

module.exports = router;
