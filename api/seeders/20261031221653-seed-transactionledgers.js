'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('transaction_ledgers', [
      // Depósitos iniciales
      {
        wallet_id: 2,
        type: 'DEPOSITO',
        amount: 150000.00,
        date: new Date()
      },
      {
        wallet_id: 3,
        type: 'DEPOSITO',
        amount: 200000.00,
        date: new Date()
      },
      {
        wallet_id: 4,
        type: 'DEPOSITO',
        amount: 500.00,
        date: new Date()
      },

      {
        wallet_id: 3,
        type: 'RETENCION',
        amount: 35000.00,
        date: new Date(),
        auction_id: 1
      },
      {
        wallet_id: 3,
        type: 'LIBERACION',
        amount: 35000.00,
        date: new Date(),
        auction_id: 1
      },
      {
        wallet_id: 2,
        type: 'RETENCION',
        amount: 45000.00,
        date: new Date(),
        auction_id: 1
      },
      {
        wallet_id: 2,
        type: 'RETENCION',
        amount: 45000.00,
        date: new Date(),
        auction_id: 4
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('transaction_ledgers', null, {});
  }
};