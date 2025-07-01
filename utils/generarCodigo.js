const generarCodigo = async (producto) => {
  console.log('que llega a generar ', producto);
  const { id_producto, nombre, marca, modelo, talle, color } = producto;

  const inicial = nombre?.substring(0, 3)?.toUpperCase() || '';
  const marcaCod = marca?.substring(0, 3)?.toUpperCase() || '';
  const modeloCod = modelo?.substring(0, 2)?.toUpperCase() || '';
  const colorCod = color?.substring(0, 2)?.toUpperCase() || '';
  const talleCod = talle?.toString().toUpperCase();

  return `${id_producto
    .toString()
    .padStart(4, '0')}${inicial}${marcaCod}${modeloCod}${colorCod}${talleCod}`;
};

module.exports = { generarCodigo };
