const test = require('node:test');
const assert = require('node:assert/strict');
const { createFakeDb, loadWithFakeDb } = require('./helpers/fakeDb');

const setup = ({ bids, wallets, auction } = {}) => {
    const fake = createFakeDb({
        auctions: [{ id: 1, seller_id: 10, state: 'ACTIVA', end_date: new Date(Date.now() - 1000), ...auction }],
        bids: bids || [{ id: 1, auction_id: 1, buyer_id: 20, amount: 1500 }],
        wallets: wallets || [
            { id: 1, user_id: 20, total_balance: 5000, available_balance: 3500, withheld_balance: 1500 },
            { id: 2, user_id: 10, total_balance: 0, available_balance: 0, withheld_balance: 0 }
        ]
    });
    const { settleAuction } = loadWithFakeDb(fake, 'workers/auctionSettlementWorker.js');
    return { fake, settleAuction };
};

const walletOf = (fake, userId) => fake.state.wallets.find((w) => w.user_id === userId);

test('con ganador: transfiere al vendedor, descuenta la retención y deja los saldos sin negativos', async () => {
    const { fake, settleAuction } = setup();

    await settleAuction(1);

    const buyer = walletOf(fake, 20);
    const seller = walletOf(fake, 10);
    assert.equal(buyer.total_balance, 3500);
    assert.equal(buyer.withheld_balance, 0);
    assert.equal(buyer.available_balance, 3500);
    assert.equal(seller.total_balance, 1500);
    assert.equal(seller.available_balance, 1500);
    for (const wallet of fake.state.wallets) {
        assert.ok(wallet.withheld_balance >= 0 && wallet.available_balance >= 0 && wallet.total_balance >= 0);
    }
    assert.equal(fake.state.auctions[0].state, 'FINALIZADA');
    assert.deepEqual(fake.state.ledger.map((l) => l.type), ['DEBITO', 'VENTA']);
});

test('con ganador: notifica el cierre y actualiza la billetera de ambos', async () => {
    const { fake, settleAuction } = setup();

    await settleAuction(1);

    const events = fake.state.events.map((e) => `${e.to}:${e.event}`);
    assert.ok(events.includes('auction:auction:closed'));
    assert.equal(events.filter((e) => e === 'user:wallet:update').length, 2);
});

test('saldo retenido menor a la puja ganadora: no liquida y no deja saldos negativos', async () => {
    const { fake, settleAuction } = setup({
        wallets: [
            { id: 1, user_id: 20, total_balance: 5000, available_balance: 5000, withheld_balance: 500 },
            { id: 2, user_id: 10, total_balance: 0, available_balance: 0, withheld_balance: 0 }
        ]
    });

    await assert.rejects(settleAuction(1), /Fondos retenidos insuficientes/);

    assert.equal(walletOf(fake, 20).withheld_balance, 500);
    assert.equal(walletOf(fake, 20).total_balance, 5000);
    assert.equal(walletOf(fake, 10).total_balance, 0);
    assert.equal(fake.state.auctions[0].state, 'ACTIVA');
    assert.equal(fake.state.ledger.length, 0);
});

test('saldo total menor a la puja ganadora: no liquida', async () => {
    const { fake, settleAuction } = setup({
        wallets: [
            { id: 1, user_id: 20, total_balance: 1000, available_balance: 0, withheld_balance: 1500 },
            { id: 2, user_id: 10, total_balance: 0, available_balance: 0, withheld_balance: 0 }
        ]
    });

    await assert.rejects(settleAuction(1), /Saldo total insuficiente/);

    assert.equal(walletOf(fake, 10).total_balance, 0);
    assert.equal(fake.state.auctions[0].state, 'ACTIVA');
});

test('sin pujas: queda DESIERTA y no mueve saldos', async () => {
    const { fake, settleAuction } = setup({ bids: [] });

    await settleAuction(1);

    assert.equal(fake.state.auctions[0].state, 'DESIERTA');
    assert.equal(fake.state.ledger.length, 0);
    assert.deepEqual(fake.state.audit.map((a) => a.action), ['AUCTION_DESIERTA']);
});

test('una subasta ya procesada no se liquida dos veces', async () => {
    const { fake, settleAuction } = setup();

    await settleAuction(1);
    await settleAuction(1);

    assert.equal(walletOf(fake, 10).total_balance, 1500);
    assert.equal(fake.state.ledger.length, 2);
});
