const Productos = require('../models/productos');
const Ventas = require('../models/ventas');
const DetalleVentas = require('../models/detalleVentas');
const Proveedores = require('../models/proveedores');
const Usuarios = require('../models/usuarios');
const Compra = require('../models/compra');
const DetalleCompra = require('../models/detalleCompra');
const TipoVenta = require('../models/tipo_venta');

// Relación: Una venta tiene muchos detalles de venta

Usuarios.hasMany(Ventas, { foreignKey: 'id_usuario', as: 'ventas' });
Ventas.belongsTo(Usuarios, { foreignKey: 'id_usuario', as: 'usuario' });

TipoVenta.hasMany(Ventas, { foreignKey: 'id_tipo_venta', as: 'ventas' });
Ventas.belongsTo(TipoVenta, { foreignKey: 'id_tipo_venta', as: 'tipoVenta' });

Ventas.hasMany(DetalleVentas, { foreignKey: 'id_venta', as: 'detalles' });
DetalleVentas.belongsTo(Ventas, { foreignKey: 'id_venta', as: 'venta' });

Productos.hasMany(DetalleVentas, { foreignKey: 'id_producto', as: 'ventas' });
DetalleVentas.belongsTo(Productos, {
  foreignKey: 'id_producto',
  as: 'producto',
});

DetalleCompra.hasMany(DetalleVentas, {
  foreignKey: 'id_detalle_compra',
  as: 'ventas',
});
DetalleVentas.belongsTo(DetalleCompra, {
  foreignKey: 'id_detalle_compra',
  as: 'detalleCompra',
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

module.exports = {
  Usuarios,
  Ventas,
  DetalleVentas,
  Compra,
  DetalleCompra,
  Productos,
  Proveedores,
  TipoVenta,
};
