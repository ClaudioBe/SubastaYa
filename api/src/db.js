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
fs.readdirSync(path.join(__dirname, '../models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '../models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

//relaciones
const { User, Category, Auction, Wallet, Transaction_ledger, Bid, Audit_log } = sequelize.models;

// Categoria (1) -- (N) Auction [clasifica]
Category.hasMany(Auction, { foreignKey: 'category_id'});
Auction.belongsTo(Category, { foreignKey: 'category_id' });

// User (1) -- (N) Auction [publica, como vendedor]
User.hasMany(Auction, { foreignKey: 'seller_id' });
Auction.belongsTo(User, { foreignKey: 'seller_id'});

// User (1) -- (1) Wallet [posee]
User.hasOne(Wallet, { foreignKey: 'user_id' });
Wallet.belongsTo(User, { foreignKey: 'user_id' });

// User (1) -- (N) audit_Log [gatilla accion, opcional]
User.hasMany(Audit_log, { foreignKey: 'user_id'});
Audit_log.belongsTo(User, { foreignKey: 'user_id' });

// User (1) -- (N) Bid [realiza, como buyer]
User.hasMany(Bid, { foreignKey: 'buyer_id' });
Bid.belongsTo(User, { foreignKey: 'buyer_id'});

// Auction (1) -- (N) Bid [recibe]
Auction.hasMany(Bid, { foreignKey: 'auction_id'});
Bid.belongsTo(Auction, { foreignKey: 'auction_id' });

// Wallet (1) -- (N) Transaction_Ledger [registra movimientos]
Wallet.hasMany(Transaction_ledger, { foreignKey: 'wallet_id' });
Transaction_ledger.belongsTo(Wallet, { foreignKey: 'wallet_id'});

// Auction (1) -- (N) Transaction_Ledger [justifica, opcional]
Auction.hasMany(Transaction_ledger, { foreignKey: 'auction_id'});
Transaction_ledger.belongsTo(Auction, { foreignKey: 'auction_id' });

module.exports = {
  ...sequelize.models,
  conn: sequelize,     
}