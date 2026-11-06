//Base en memoria para probar los controllers sin PostgreSQL: reemplaza src/db.js y src/sockets en la cache de require.
const path = require('path');

const srcPath = (...parts) => path.join(__dirname, '..', '..', 'src', ...parts);

const record = (data) => {
    const rec = { ...data };
    Object.defineProperty(rec, 'update', {
        enumerable: false,
        value: async (changes) => Object.assign(rec, changes)
    });
    Object.defineProperty(rec, 'toJSON', { enumerable: false, value: () => ({ ...rec }) });
    return rec;
};

const matches = (rec, where = {}) => Object.entries(where).every(([key, value]) => rec[key] === value);

const createFakeDb = ({ auctions = [], bids = [], wallets = [] } = {}) => {
    const state = {
        auctions: auctions.map(record),
        bids: bids.map(record),
        wallets: wallets.map(record),
        ledger: [],
        audit: [],
        events: []
    };

    const highestFirst = (list) => [...list].sort((a, b) => Number(b.amount) - Number(a.amount));

    const db = {
        conn: { transaction: async (callback) => callback({ LOCK: { UPDATE: 'UPDATE' } }) },
        Auction: {
            findByPk: async (id) => state.auctions.find((a) => a.id === id) || null,
            findOne: async ({ where }) => state.auctions.find((a) => matches(a, where)) || null
        },
        Bid: {
            findOne: async ({ where }) => highestFirst(state.bids.filter((b) => matches(b, where)))[0] || null,
            create: async (data) => {
                const bid = record({ id: state.bids.length + 1, ...data });
                state.bids.push(bid);
                return bid;
            }
        },
        Wallet: { findOne: async ({ where }) => state.wallets.find((w) => matches(w, where)) || null },
        Transaction_ledger: { create: async (data) => { state.ledger.push(data); return data; } },
        Audit_log: { create: async (data) => { state.audit.push(data); return data; } }
    };

    const sockets = {
        emitToAuction: (auctionId, event, payload) => state.events.push({ to: 'auction', auctionId, event, payload }),
        emitToUser: (userId, event) => state.events.push({ to: 'user', userId, event })
    };

    return { state, db, sockets };
};

//Instala los fakes y devuelve el módulo pedido, recargado para que tome la base en memoria
const loadWithFakeDb = (fake, modulePath) => {
    const inject = (resolved, exports) => {
        require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports };
    };
    inject(require.resolve(srcPath('db.js')), fake.db);
    inject(require.resolve(srcPath('sockets', 'index.js')), fake.sockets);

    const target = require.resolve(srcPath(modulePath));
    delete require.cache[target];
    return require(target);
};

module.exports = { createFakeDb, loadWithFakeDb };
