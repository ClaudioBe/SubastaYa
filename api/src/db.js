require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const pg=require("pg")

const {
  DB_USER, DB_PASSWORD, DB_HOST,DB_NAME, DB_PORT, DATABASE_URL
} = process.env;

if (DATABASE_URL) {
  // Si existe DATABASE_URL (Producción en Vercel con Neon)
  sequelize = new Sequelize(DATABASE_URL, {
    logging: false, 
    native: false, 
    dialect:'postgres',
    dialectModule:pg,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Requerido por Neon para conexiones seguras en la nube
      }
    }
  });
} else {
  // Si no existe (Desarrollo local en tu computadora)
  sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
    logging: false, 
    native: false, 
  });
}
const basename = path.basename(__filename);
const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

//relaciones


module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};