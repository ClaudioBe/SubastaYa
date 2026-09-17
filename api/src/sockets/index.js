let ioInstance = null;

const initSocket = (io) => {
    ioInstance = io;

    io.on('connection', (socket) => {
        const { userId } = socket.handshake.auth || {};
        if (userId) socket.join(`user:${userId}`);

        socket.on('auction:join', (auctionId) => socket.join(`auction:${auctionId}`));
        socket.on('auction:leave', (auctionId) => socket.leave(`auction:${auctionId}`));
    });
};

const emitToAuction = (auctionId, event, payload) => {
    ioInstance?.to(`auction:${auctionId}`).emit(event, payload);
};

const emitToUser = (userId, event, payload) => {
    ioInstance?.to(`user:${userId}`).emit(event, payload);
};

module.exports = { initSocket, emitToAuction, emitToUser };
