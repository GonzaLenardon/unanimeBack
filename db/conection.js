const { Sequelize } = require('sequelize');
require('dotenv').config(); // Para leer las variables de entorno

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false }, // Necesario para Render
  },
  logging: false, // Para evitar logs innecesarios
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL exitosa.');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
})();

module.exports = sequelize;
