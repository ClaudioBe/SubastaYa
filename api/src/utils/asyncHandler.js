//Express 4 no atrapa los errores de handlers async: este wrapper los pasa a next() para que lleguen al middleware de errores
const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
