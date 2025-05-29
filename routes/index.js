const { Router } = require('express');
const { authMiddleware } = require('../controllers/authMiddleware');
const router = Router();
const {
  allUsers,
  User,
  addUser,
  login,
  resetPassword,
  getUser,
  logout,
} = require('../controllers/usuarios');
const {
  allVentas,
  addVentas,
  desdeHasta,
  deleteVenta,
} = require('../controllers/ventas');
const {
  addcompras,
  addCompra,
  comprasDesdeHasta,
  eliminarCompra,
} = require('../controllers/compras');

const {
  addProductos,
  allProductos,
  updateProductos,
  comprasProducto,
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

const { sequelize } = require('sequelize');
const {
  resumenVentas,
  ventasDesdeHasta,
  resumenDesdeHasta,
} = require('../controllers/listados');
const { allTipoVentas } = require('../controllers/tipoVentas');
const { verStokc, verStock } = require('../controllers/stock');

router.get('/user', allUsers);
router.get('/user/me', authMiddleware, getUser);
router.post('/user', addUser);
router.post('/user/login', login);
router.post('/user/logout', logout);
router.post('/user/reset', resetPassword);

router.get('/ventas', allVentas);
router.post('/ventas', addVentas);
router.post('/ventas/desdehasta', desdeHasta);
router.delete('/ventas/:id', deleteVenta);

router.post('/listados', resumenVentas);
router.get('/listados', verStock);
router.post('/listados/desdehasta', resumenDesdeHasta);

router.get('/productos', allProductos);
router.get('/productos/:id_producto', comprasProducto);
router.post('/productos', addProductos);
router.put('/productos/', updateProductos);

router.get('/proveedor', allProveedores);
router.post('/proveedor', addProveedor);
router.put('/proveedor', updateProveedor);

router.post('/detalles', addDetalles);
router.get('/detalles', allDetalles);
/* router.post('/detalles', addVentaConDetalles); */

router.post('/compra', addCompra);
router.post('/compra/desdehasta', comprasDesdeHasta);
router.delete('/compra/:id', eliminarCompra);

router.get('/tipoventa', allTipoVentas);

module.exports = router;
