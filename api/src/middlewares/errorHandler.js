const { AppError } = require('../utils/errors');

//Rutas que no existen
const notFoundHandler = (req, res) => {
    res.status(404).json({ error: 'NOT_FOUND', message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

//Traduce cualquier error a { error, message, fields? } con el código HTTP correspondiente
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err instanceof AppError) {
        const body = { error: err.code, message: err.message };
        if (err.fields) body.fields = err.fields;
        return res.status(err.status).json(body);
    }

    //JSON mal formado en el body de la petición
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'INVALID_JSON', message: 'El cuerpo de la petición no es un JSON válido' });
    }

    //Errores de Sequelize provocados por datos del cliente
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'CONFLICT', message: 'El registro ya existe' });
    }
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: 'VALIDATION_ERROR', message: err.message });
    }

    //Cualquier otra cosa (incluidos los errores de SQL/conexión) es un error inesperado: no se filtra el detalle al cliente
    console.error('Error no controlado:', err);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error interno del servidor' });
};

module.exports = { errorHandler, notFoundHandler };
