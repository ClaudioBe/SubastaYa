const test = require('node:test');
const assert = require('node:assert/strict');
const dtos = require('../src/dtos');

//Imita una instancia de Sequelize: campos internos como "version" viajan en toJSON()
const instance = (data) => ({ ...data, toJSON: () => data });

const auctionRow = {
    id: 1, title: 'Reloj', description: 'Antiguo', url_image: 'http://x.com/a.jpg', seller_id: 10, category_id: 2,
    base_price: '1000.00', min_increase: '100.00', start_date: '2026-12-01', end_date: '2026-12-02', state: 'ACTIVA',
    version: 7
};

test('toAuctionDto no expone el campo interno version', () => {
    const dto = dtos.toAuctionDto(instance(auctionRow));

    assert.equal(dto.id, 1);
    assert.equal(dto.state, 'ACTIVA');
    assert.ok(!('version' in dto));
});

test('toAuctionDetailDto incluye categoría, vendedor y pujas, sin datos sensibles', () => {
    const dto = dtos.toAuctionDetailDto(instance({
        ...auctionRow,
        category: { name: 'Relojes', id: 2 },
        user: { id: 10, name: 'Ana', email: 'ana@test.com', password: 'secreto' },
        bids: [{ id: 5, auction_id: 1, buyer_id: 20, amount: '1200.00', bid_date: '2026-12-01', user: { id: 20, name: 'Luis', password: 'x' } }],
        currentPrice: 1200
    }));

    assert.deepEqual(dto.category, { name: 'Relojes' });
    assert.deepEqual(dto.user, { id: 10, name: 'Ana' });
    assert.deepEqual(dto.bids[0].user, { id: 20, name: 'Luis' });
    assert.equal(dto.currentPrice, 1200);
    assert.ok(!('version' in dto));
});

test('toAuctionDetailDto omite las relaciones que no se cargaron', () => {
    const dto = dtos.toAuctionDetailDto(auctionRow);

    assert.ok(!('category' in dto) && !('user' in dto) && !('bids' in dto) && !('currentPrice' in dto));
});

test('toWalletDto no expone version', () => {
    const dto = dtos.toWalletDto(instance({
        id: 1, user_id: 20, total_balance: '5000', withheld_balance: '0', available_balance: '5000', version: 3
    }));

    assert.deepEqual(Object.keys(dto), ['id', 'user_id', 'total_balance', 'withheld_balance', 'available_balance']);
});

test('toMovementDto conserva el título de la subasta', () => {
    const dto = dtos.toMovementDto(instance({
        id: 1, wallet_id: 1, type: 'RETENCION', amount: '1500', date: '2026-12-01', auction_id: 1, auction: { title: 'Reloj', id: 1 }
    }));

    assert.deepEqual(dto.auction, { title: 'Reloj' });
});

test('toUserDto no expone la contraseña', () => {
    const dto = dtos.toUserDto({ id: 1, name: 'Ana', email: 'ana@test.com', password: 'secreto' });

    assert.ok(!('password' in dto));
});
