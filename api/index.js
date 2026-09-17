const server = require('./src/app.js');
const { conn } = require('./src/db.js');
const { PORT } = process.env

conn.authenticate()
    .then(() => {
        console.log('Conexión con la base de datos establecida.');
        server.listen(PORT, () => {
            console.log(`Server listening at ${PORT}`);
        });
    })
    .catch((error) => {
        console.error(`Falló el arranque del servidor: ${error.message}`);
    });

module.exports=server;