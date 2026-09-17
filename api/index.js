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

// Syncing all the models at once.
conn.sync({alter:true}).then(() => {
   httpServer.listen(PORT, () => {
        console.log(`Server listening at ${PORT}`);
   });
   startAuctionSettlementWorker();
});

module.exports=httpServer;