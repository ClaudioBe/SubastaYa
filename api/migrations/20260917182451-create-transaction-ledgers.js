'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('transaction_ledgers', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      wallet_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'wallets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false // DEPOSITO, RETENCION, LIBERACION, PAGO, COBRO
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      auction_id: {
        type: Sequelize.BIGINT,
        allowNull: true, // null para movimientos no ligados a una subasta (ej. DEPOSITO)
        references: { model: 'auctions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('transaction_ledgers');
  }
};
