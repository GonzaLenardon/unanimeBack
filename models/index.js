const Productos = require('../models/productos');
const Ventas = require('../models/ventas');
const DetalleVentas = require('../models/detalleVentas');
const Proveedores = require('../models/proveedores');
const Usuarios = require('../models/usuarios');
const Compra = require('../models/compra');
const DetalleCompra = require('../models/detalleCompra');
const TipoVenta = require('../models/tipo_venta');
const Sucursal = require('../models/sucursal');
const Transferencia = require('../models/transferencia');
const TransferenciaDetalle = require('../models/detalleTransferencia');
const Gastos = require('../models/gastos');
const TipoGastos = require('../models/tipoGastos');
const StockSucursal = require('./stocksucursal');

// Relación: Una venta tiene muchos detalles de venta

Usuarios.hasMany(Ventas, { foreignKey: 'id_usuario', as: 'ventas' });
Ventas.belongsTo(Usuarios, { foreignKey: 'id_usuario', as: 'usuario' });

Ventas.belongsTo(Sucursal, { foreignKey: 'id_sucursal', as: 'sucursal' });
Sucursal.hasMany(Ventas, { foreignKey: 'id_sucursal', as: 'ventas' });

TipoVenta.hasMany(Ventas, { foreignKey: 'id_tipo_venta', as: 'ventas' });
Ventas.belongsTo(TipoVenta, { foreignKey: 'id_tipo_venta', as: 'tipoVenta' });

Ventas.hasMany(DetalleVentas, { foreignKey: 'id_venta', as: 'detalles' });
DetalleVentas.belongsTo(Ventas, { foreignKey: 'id_venta', as: 'venta' });

Productos.hasMany(DetalleVentas, { foreignKey: 'id_producto', as: 'ventas' });
DetalleVentas.belongsTo(Productos, {
  foreignKey: 'id_producto',
  as: 'producto',
});

/* DetalleCompra.hasMany(DetalleVentas, { foreignKey: 'id_detalle_compra', as: 'ventas'});
DetalleVentas.belongsTo(DetalleCompra, { foreignKey: 'id_detalle_compra', as: 'detalleCompra'}); */

DetalleCompra.hasMany(DetalleVentas, {
  foreignKey: 'id_detalle_compra',
  as: 'detalle_ventas',
});
DetalleVentas.belongsTo(DetalleCompra, {
  foreignKey: 'id_detalle_compra',
  as: 'detalle_compra',
});

Proveedores.hasMany(Compra, { foreignKey: 'proveedor_id', as: 'compras' });
Compra.belongsTo(Proveedores, { foreignKey: 'proveedor_id', as: 'proveedor' });

Compra.hasMany(DetalleCompra, { foreignKey: 'compra_id', as: 'detalles' });
DetalleCompra.belongsTo(Compra, { foreignKey: 'compra_id', as: 'compra' });

Productos.hasMany(DetalleCompra, { foreignKey: 'producto_id', as: 'compras' });
DetalleCompra.belongsTo(Productos, {
  foreignKey: 'producto_id',
  as: 'producto',
});

// Transferencia tiene muchos detalles
Transferencia.hasMany(TransferenciaDetalle, {
  foreignKey: 'transferencia_id',
  as: 'detalles',
});
TransferenciaDetalle.belongsTo(Transferencia, {
  foreignKey: 'transferencia_id',
  as: 'transferencia',
});

// Cada detalle transferencia pertenece a un producto
Productos.hasMany(TransferenciaDetalle, {
  foreignKey: 'producto_id',
  as: 'transferencias',
});
TransferenciaDetalle.belongsTo(Productos, {
  foreignKey: 'producto_id',
  as: 'producto',
});

TipoGastos.hasMany(Gastos, { foreignKey: 'id_tipogasto', as: 'gastos' });
Gastos.belongsTo(TipoGastos, { foreignKey: 'id_tipogasto', as: 'tipogasto' });

DetalleCompra.hasMany(StockSucursal, {
  foreignKey: 'id_detalle_compra',
  as: 'detalleCompraToSucursal',
});
StockSucursal.belongsTo(DetalleCompra, {
  foreignKey: 'id_detalle_compra',
  as: 'sucursalDetalleToCompra',
});

Sucursal.hasMany(StockSucursal, {
  foreignKey: 'id_sucursal',
  as: 'sucursalToStockSucursal',
});
StockSucursal.belongsTo(Sucursal, {
  foreignKey: 'id_sucursal',
  as: 'stockSucursalToSucursal',
});

Usuarios.hasMany(Compra, { foreignKey: 'id_usuario', as: 'usuarioToCompras' });
Compra.belongsTo(Usuarios, { foreignKey: 'id_usuario', as: 'compraToUsuario' });

Usuarios.hasMany(Transferencia, {
  foreignKey: 'id_usuario',
  as: 'usuarioToTransferencia',
});
Transferencia.belongsTo(Usuarios, {
  foreignKey: 'id_usuario',
  as: 'transferenciaToUsuario',
});

Usuarios.belongsTo(Sucursal, { foreignKey: 'id_sucursal', as: 'sucursal' });
Sucursal.hasMany(Usuarios, { foreignKey: 'id_sucursal', as: 'usuarios' });

Sucursal.hasMany(DetalleVentas, {
  foreignKey: 'id_sucursal',
  as: 'sucursalToDetalleVentas',
});

DetalleVentas.belongsTo(Sucursal, {
  foreignKey: 'id_sucursal',
  as: 'detalleVentasToSucursal',
});

Gastos.belongsTo(Sucursal, {
  foreignKey: 'id_sucursal',
  as: 'sucursal',
});

Sucursal.hasMany(Gastos, {
  foreignKey: 'id_sucursal',
  as: 'gastos',
});

module.exports = {
  Usuarios,
  Ventas,
  DetalleVentas,
  Compra,
  DetalleCompra,
  Productos,
  Proveedores,
  TipoVenta,
  Sucursal,
  Transferencia,
  TransferenciaDetalle,
  Gastos,
  TipoGastos,
  StockSucursal,
};
