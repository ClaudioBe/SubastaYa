const test = require('node:test');
const assert = require('node:assert/strict');
const { createFakeDb, loadWithFakeDb } = require('./helpers/fakeDb');

const HOUR = 60 * 60 * 1000;

const setup = (overrides = {}) => {
    const fake = createFakeDb({
        auctions: [{
            id: 1, seller_id: 10, state: 'ACTIVA', base_price: 1000, min_increase: 100,
            end_date: new Date(Date.now() + HOUR), ...overrides.auction
        }],
        bids: overrides.bids || [],
        wallets: overrides.wallets || [
            { id: 1, user_id: 20, total_balance: 5000, available_balance: 5000, withheld_balance: 0 }
        ]
    });
    const { createBid } = loadWithFakeDb(fake, 'services/bidsService.js');
    return { fake, createBid };
};

test('puja válida: crea la puja, retiene el saldo y registra la retención en el ledger', async () => {
    const { fake, createBid } = setup();

    const bid = await createBid(1, 20, 1500);

    assert.equal(bid.amount, 1500);
    assert.equal(fake.state.bids.length, 1);
    const wallet = fake.state.wallets[0];
    assert.equal(wallet.available_balance, 3500);
    assert.equal(wallet.withheld_balance, 1500);
    assert.deepEqual(fake.state.ledger.map((l) => l.type), ['RETENCION']);
    assert.ok(fake.state.events.some((e) => e.event === 'bid:new'));
});

test('puja válida sobre otra: libera la retención del postor anterior', async () => {
    const { fake, createBid } = setup({
        bids: [{ id: 1, auction_id: 1, buyer_id: 30, amount: 1200 }],
        wallets: [
            { id: 1, user_id: 20, total_balance: 5000, available_balance: 5000, withheld_balance: 0 },
            { id: 2, user_id: 30, total_balance: 2000, available_balance: 800, withheld_balance: 1200 }
        ]
    });

    await createBid(1, 20, 1300);

    const previous = fake.state.wallets.find((w) => w.user_id === 30);
    assert.equal(previous.available_balance, 2000);
    assert.equal(previous.withheld_balance, 0);
    assert.deepEqual(fake.state.ledger.map((l) => l.type), ['RETENCION', 'LIBERACION']);
});

test('monto bajo: rechaza con BID_TOO_LOW (422) y no toca saldos ni crea la puja', async () => {
    const { fake, createBid } = setup({ bids: [{ id: 1, auction_id: 1, buyer_id: 30, amount: 1200 }] });

    await assert.rejects(createBid(1, 20, 1250), (err) => {
        assert.equal(err.code, 'BID_TOO_LOW');
        assert.equal(err.status, 422);
        return true;
    });

    assert.equal(fake.state.bids.length, 1);
    assert.equal(fake.state.wallets[0].available_balance, 5000);
    assert.equal(fake.state.ledger.length, 0);
});

test('monto bajo: sin pujas previas el mínimo es precio base + incremento', async () => {
    const { createBid } = setup();

    await assert.rejects(createBid(1, 20, 1099), { code: 'BID_TOO_LOW' });
    await assert.doesNotReject(createBid(1, 20, 1100));
});

test('saldo insuficiente: rechaza con INSUFFICIENT_FUNDS (422) y no retiene nada', async () => {
    const { fake, createBid } = setup({
        wallets: [{ id: 1, user_id: 20, total_balance: 1000, available_balance: 1000, withheld_balance: 0 }]
    });

    await assert.rejects(createBid(1, 20, 1500), (err) => {
        assert.equal(err.code, 'INSUFFICIENT_FUNDS');
        assert.equal(err.status, 422);
        return true;
    });

    assert.equal(fake.state.wallets[0].available_balance, 1000);
    assert.equal(fake.state.wallets[0].withheld_balance, 0);
    assert.equal(fake.state.bids.length, 0);
});

test('usuario sin billetera: también es INSUFFICIENT_FUNDS', async () => {
    const { createBid } = setup({ wallets: [] });

    await assert.rejects(createBid(1, 20, 1500), { code: 'INSUFFICIENT_FUNDS' });
});

test('subasta inexistente: AUCTION_NOT_FOUND (404)', async () => {
    const { createBid } = setup();

    await assert.rejects(createBid(999, 20, 1500), { code: 'AUCTION_NOT_FOUND', status: 404 });
});

test('el vendedor no puede pujar en su propia subasta', async () => {
    const { createBid } = setup({
        wallets: [{ id: 1, user_id: 10, total_balance: 5000, available_balance: 5000, withheld_balance: 0 }]
    });

    await assert.rejects(createBid(1, 10, 1500), { code: 'SELLER_CANNOT_BID' });
});

test('subasta no activa o vencida: se rechaza', async () => {
    const closed = setup({ auction: { state: 'FINALIZADA' } });
    await assert.rejects(closed.createBid(1, 20, 1500), { code: 'AUCTION_NOT_ACTIVE' });

    const expired = setup({ auction: { end_date: new Date(Date.now() - HOUR) } });
    await assert.rejects(expired.createBid(1, 20, 1500), { code: 'AUCTION_ENDED' });
});

test('anti-sniping: una puja en el último minuto extiende el cierre 2 minutos', async () => {
    const { fake, createBid } = setup({ auction: { end_date: new Date(Date.now() + 30 * 1000) } });

    await createBid(1, 20, 1500);

    const remaining = new Date(fake.state.auctions[0].end_date) - Date.now();
    assert.ok(remaining > 110 * 1000 && remaining <= 120 * 1000, `quedaron ${remaining} ms`);
    assert.ok(fake.state.audit.some((a) => a.action === 'ANTI_SNIPING_EXTENSION'));
});

test('un rechazo se registra en Audit_log como BID_REJECTED', async () => {
    const { fake, createBid } = setup({
        wallets: [{ id: 1, user_id: 20, total_balance: 100, available_balance: 100, withheld_balance: 0 }]
    });

    await assert.rejects(createBid(1, 20, 1500), { code: 'INSUFFICIENT_FUNDS' });

    assert.deepEqual(fake.state.audit.map((a) => a.action), ['BID_REJECTED']);
});
