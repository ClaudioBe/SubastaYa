const http = require('http');
const { Server } = require('socket.io');
const server = require('./src/app.js');
const { conn } = require('./src/db.js');
const { initSocket } = require('./src/sockets');
const { startAuctionSettlementWorker } = require('./src/workers/auctionSettlementWorker');
const { PORT } = process.env

const httpServer = http.createServer(server);
const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:3000', credentials: true }
});
initSocket(io);

conn.authenticate()
    .then(() => {
        console.log('Conexión con la base de datos establecida.');
        httpServer.listen(PORT, () => {
            console.log(`Server listening at ${PORT}`);
        });
        startAuctionSettlementWorker();
    })
    .catch((error) => {
        console.error(`Falló el arranque del servidor: ${error.message}`);
    });

module.exports=httpServer;