'use strict';

//Los seeders anteriores insertan filas con id explícito, lo que no avanza las secuencias de PostgreSQL:
//sin este paso, la primera fila creada desde la API intentaría usar el id 1 y chocaría con el seed.
const TABLES = ['users', 'categories', 'auctions', 'wallets', 'bids', 'transaction_ledgers', 'audit_logs'];

module.exports = {
  async up (queryInterface) {
    for (const table of TABLES) {
      await queryInterface.sequelize.query(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM ${table}), 1), (SELECT COUNT(*) > 0 FROM ${table}))`
      );
    }
  },

  async down () {
    //Nada que revertir: las secuencias solo avanzan.
  }
};
