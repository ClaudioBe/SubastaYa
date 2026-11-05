const express = require('express');
const routes= require('./routes/index.js');
const morgan=require('morgan');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.js');
const server = express();

//para poder convertir los datos de las peticiones a json 
server.use(express.json());
//para ver en la consola lo que pasa con las peticiones
server.use(morgan('dev'));

const origin="http://localhost:3000"

server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin',"http://localhost:3000"); 
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
   
    next();
});

server.use('/', routes);

//siempre al final: rutas inexistentes y manejo centralizado de errores
server.use(notFoundHandler);
server.use(errorHandler);


module.exports= server;