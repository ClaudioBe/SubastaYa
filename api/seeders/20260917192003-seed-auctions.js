'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('auctions', [
      {
        id: 1,
        title: 'Subasta Activa Estándar',
        description: 'Cierra en 25 minutos.......',
        url_image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS41Uc_-dVnmpcUJK42q_sO33c7A4Y6qjgeqqhLTL33uu4YeDgNBADiRpY&s=10",
        base_price: 30000.00,
        min_increase: 5000.00,
        start_date: new Date(now.getTime() - 30 * 60000), // Empezó hace media hora
        end_date: new Date(now.getTime() + 25 * 60000),   // Cierra en 25 min
        state: 'ACTIVA',
        seller_id: 1, // vendedor@test.com
        category_id: 1, // Tecnología
        version: 0,
        
      },
      {
        id: 2,
        title: 'Subasta Activa Crítica (Anti-sniping)',
        description: 'Cierra en 30 segundos para probar extensión de tiempo.',
        url_image: 'https://pub-b1b918e2eedc4e8bbe3f696f68b24026.r2.dev/listings/6cd59b5a-dde0-46d9-87b2-8ab3a034bcdc/0d202a8a-cdf4-41b8-bc1a-26668d397dba.jpg',
        base_price: 10000.00,
        min_increase: 1000.00,
        start_date: new Date(now.getTime() - 60 * 60000),
        end_date: new Date(now.getTime() + 30 * 1000),   // Cierra en 30 segundos!
        state: 'ACTIVA',
        seller_id: 1,
        category_id: 2, // Coleccionables
        version: 0,
        
      },
      {
        id: 3,
        title: 'Subasta Próxima Programada',
        description: 'Inicia en 24 horas. Las pujas deben estar bloqueadas.',
        url_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc3KqxDkbQQARwiaU83QLRjWB5eh_kI53qHq4zcgtl1g&s=10',
        base_price: 50000.00,
        min_increase: 2000.00,
        start_date: new Date(now.getTime() + 24 * 60 * 60000), // Mañana
        end_date: new Date(now.getTime() + 48 * 60 * 60000),   // Pasado
        state: 'PROGRAMADA',
        seller_id: 1,
        category_id: 3, // Indumentaria
        version: 0,
        
      },
      {
        id: 4,
        title: 'Subasta Vencida con Ganador',
        description: 'Finalizada hace 10 minutos para probar liquidación del Worker.',
        url_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRN8SkptOg294pI1oPZ73Cwcxhq7QBgq26LSfbzsS23A&s=10',
        base_price: 40000.00,
        min_increase: 5000.00,
        start_date: new Date(now.getTime() - 2 * 60 * 60000),
        end_date: new Date(now.getTime() - 10 * 60000), // Terminado hace 10 min
        state: 'ACTIVA', // Arranca activa para que el worker la procese como vencida
        seller_id: 1,
        category_id: 1,
        version: 0,
      
      },
      {
        id: 5,
        title: 'Subasta Vencida Desierta',
        description: 'Finalizada sin ofertas para probar pase a DESIERTA',
        url_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSshobic8BoODExueohUIbmdrRhbdOW9wMzt8pjXxDbMQ&s=10',
        base_price: 15000.00,
        min_increase: 1000.00,
        start_date: new Date(now.getTime() - 2 * 60 * 60000),
        end_date: new Date(now.getTime() - 5 * 60000), //Terminado hace 5 min
        state: 'ACTIVA',
        seller_id: 1,
        category_id: 4, //Vehículos
        version: 0,
      
      }
    ], {});

    //subasta 1 con el comprador 1 liderando a $45.000 y 2 pujas previas
    await queryInterface.bulkInsert('bids', [
      { id: 1, auction_id: 1, buyer_id: 3, amount: 35000.00, bid_date: new Date(now.getTime() - 20 * 60000),},
      { id: 2, auction_id: 1, buyer_id: 2, amount: 45000.00, bid_date: new Date(now.getTime() - 15 * 60000),}
    ], {});

    // puja de la subasta 4 vencida con ganador para que el worker la liquide al comprador 2
    await queryInterface.bulkInsert('bids', [
      { id: 3, auction_id: 4, buyer_id: 3, amount: 45000.00, bid_date: new Date(now.getTime() - 30 * 60000),}
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('bids', null, {});
    await queryInterface.bulkDelete('auctions', null, {});
  }
};
