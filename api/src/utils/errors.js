//Errores de la aplicación: cada uno lleva el código HTTP y un código estable para que el cliente pueda distinguirlos
class AppError extends Error {
    constructor(status, code, message, fields) {
        super(message);
        this.status = status;
        this.code = code;
        this.fields = fields;
    }
}

//400: datos mal formados. "fields" es un mapa { campo: mensaje } que usan los formularios del frontend
class ValidationError extends AppError {
    constructor(fields, message) {
        const firstMessage = Object.values(fields || {}).find((value) => typeof value === 'string');
        super(400, 'VALIDATION_ERROR', message || firstMessage || 'Datos inválidos', fields);
    }
}

//404: el recurso no existe
class NotFoundError extends AppError {
    constructor(message, code = 'NOT_FOUND') {
        super(404, code, message);
    }
}

//409: conflicto con el estado actual (por ejemplo, concurrencia sobre la billetera)
class ConflictError extends AppError {
    constructor(message, code = 'CONFLICT') {
        super(409, code, message);
    }
}

//422: la petición es válida pero incumple una regla de negocio (saldo insuficiente, subasta cerrada, etc.)
class BusinessError extends AppError {
    constructor(message, code = 'BUSINESS_RULE_VIOLATION') {
        super(422, code, message);
    }
}

module.exports = { AppError, ValidationError, NotFoundError, ConflictError, BusinessError };
