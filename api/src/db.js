require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

const {DB_USER, DB_PASSWORD, DB_HOST,DB_NAME, DB_PORT} = process.env;

// Si no existe (Desarrollo local en tu computadora)
sequelize = new Sequelize(`postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`, {
  logging: false, 
  native: false, 
});

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
const { Usuario: usuario, Categoria: categoria, Subasta: subasta, Billetera: billetera, Transaccion_ledger: transaccion_ledger, Puja: puja, Auditoria_log: auditoria_log } = sequelize.models;

// Categoria (1) -- (N) Subasta [clasifica]
categoria.hasMany(subasta, { foreignKey: 'categoria_id', as: 'subastas' });
subasta.belongsTo(categoria, { foreignKey: 'categoria_id', as: 'categoria' });

// Usuario (1) -- (N) Subasta [publica, como vendedor]
usuario.hasMany(subasta, { foreignKey: 'vendedor_id', as: 'subastasPublicadas' });
subasta.belongsTo(usuario, { foreignKey: 'vendedor_id', as: 'vendedor' });

// Usuario (1) -- (1) Billetera [posee]
usuario.hasOne(billetera, { foreignKey: 'usuario_id', as: 'billetera' });
billetera.belongsTo(usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Usuario (1) -- (N) Auditoria_Log [gatilla accion, opcional]
usuario.hasMany(auditoria_log, { foreignKey: 'usuario_id', as: 'auditorias' });
auditoria_log.belongsTo(usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Usuario (1) -- (N) Puja [realiza, como comprador]
usuario.hasMany(puja, { foreignKey: 'comprador_id', as: 'pujas' });
puja.belongsTo(usuario, { foreignKey: 'comprador_id', as: 'comprador' });

// Subasta (1) -- (N) Puja [recibe]
subasta.hasMany(puja, { foreignKey: 'subasta_id', as: 'pujas' });
puja.belongsTo(subasta, { foreignKey: 'subasta_id', as: 'subasta' });

// Billetera (1) -- (N) Transaccion_Ledger [registra movimientos]
billetera.hasMany(transaccion_ledger, { foreignKey: 'billetera_id', as: 'movimientos' });
transaccion_ledger.belongsTo(billetera, { foreignKey: 'billetera_id', as: 'billetera' });

// Subasta (1) -- (N) Transaccion_Ledger [justifica, opcional]
subasta.hasMany(transaccion_ledger, { foreignKey: 'subasta_id', as: 'transacciones' });
transaccion_ledger.belongsTo(subasta, { foreignKey: 'subasta_id', as: 'subasta' });

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
}