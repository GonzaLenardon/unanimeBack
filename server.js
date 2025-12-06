const express = require('express');
const sequelize = require('./db/conection');
const cookieParser = require('cookie-parser');

const cors = require('cors');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const ventas = require('./models/ventas');
const DetalleVentas = require('./models/detalleVentas');

/* Al leer ./routes se cargan todos los modelos definidos aca. De lo contrario hay que instanciarlos aca */
const router = require('./routes');

app.use(
  cors({
    origin: process.env.URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Authorization, Content-Type, X-Requested-With',
    credentials: true,
  })
);
app.use(cookieParser());

//cors para desarrollo
/* app.use(cors({
  origin: '*'
})); */

app.use('/', router);

const startServer = async () => {
  try {
    await sequelize.sync({ force: true }); // ⚠️ Sincroniza la base de datos (sin borrar datos)
    console.log('📦 Base de datos sincronizada.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
  }
};

startServer();
