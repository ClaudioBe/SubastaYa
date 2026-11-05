//Especificación OpenAPI 3 de la API, servida por swagger-ui-express en /api-docs
const errorResponse = (description, example) => ({
    description,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example } }
});

const userIdQuery = { name: 'userId', in: 'query', required: true, schema: { type: 'integer' }, example: 1 };
const idPath = (name) => ({ name, in: 'path', required: true, schema: { type: 'integer' }, example: 1 });

module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'SubastaYa API',
        version: '1.0.0',
        description: 'API de la plataforma de subastas. Los errores devuelven `{ error, message, fields? }`.'
    },
    tags: [
        { name: 'Auctions', description: 'Subastas, categorías y pujas' },
        { name: 'Users', description: 'Registro, login y pujas de un usuario' },
        { name: 'Wallets', description: 'Billetera, depósitos y movimientos' }
    ],
    paths: {
        '/auctions': {
            get: {
                tags: ['Auctions'],
                summary: 'Lista subastas con filtros opcionales',
                parameters: [
                    { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Busca en título y categoría' },
                    { name: 'sellerId', in: 'query', schema: { type: 'integer' } },
                    { name: 'category', in: 'query', schema: { type: 'string' } },
                    { name: 'state', in: 'query', schema: { type: 'string', enum: ['ACTIVA', 'PROXIMA', 'FINALIZADA'] } },
                    { name: 'minPrice', in: 'query', schema: { type: 'number' }, description: 'Sobre el precio actual' },
                    { name: 'maxPrice', in: 'query', schema: { type: 'number' }, description: 'Sobre el precio actual' },
                    { name: 'sort', in: 'query', schema: { type: 'string', enum: ['time_asc', 'bids_desc'] } }
                ],
                responses: {
                    200: {
                        description: 'Lista de subastas',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Auction' } } } }
                    }
                }
            },
            post: {
                tags: ['Auctions'],
                summary: 'Crea una subasta (queda en estado PRÓXIMA)',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAuctionRequest' } } }
                },
                responses: {
                    201: { description: 'Subasta creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Auction' } } } },
                    400: errorResponse('Datos inválidos', {
                        error: 'VALIDATION_ERROR',
                        message: 'Debe ingresar un título!',
                        fields: { title: 'Debe ingresar un título!' }
                    })
                }
            }
        },
        '/auctions/categories': {
            get: {
                tags: ['Auctions'],
                summary: 'Lista los nombres de las categorías',
                responses: {
                    200: {
                        description: 'Nombres de categorías',
                        content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } }, example: ['Arte', 'Tecnología'] } }
                    }
                }
            }
        },
        '/auctions/{id}': {
            get: {
                tags: ['Auctions'],
                summary: 'Detalle de una subasta con sus pujas',
                parameters: [idPath('id')],
                responses: {
                    200: { description: 'Subasta', content: { 'application/json': { schema: { $ref: '#/components/schemas/Auction' } } } },
                    404: errorResponse('Subasta inexistente', { error: 'AUCTION_NOT_FOUND', message: 'Subasta no encontrada' })
                }
            }
        },
        '/auctions/{id}/bids': {
            post: {
                tags: ['Auctions'],
                summary: 'Realiza una puja',
                description: 'Retiene el saldo del postor y libera el del postor anterior. Toda la operación es transaccional.',
                parameters: [idPath('id')],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateBidRequest' } } }
                },
                responses: {
                    201: { description: 'Puja registrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Bid' } } } },
                    404: errorResponse('Subasta inexistente', { error: 'AUCTION_NOT_FOUND', message: 'Subasta no encontrada' }),
                    422: errorResponse(
                        'Regla de negocio incumplida. Códigos: AUCTION_NOT_ACTIVE, SELLER_CANNOT_BID, AUCTION_ENDED, BID_TOO_LOW, INSUFFICIENT_FUNDS',
                        { error: 'INSUFFICIENT_FUNDS', message: 'Saldo insuficiente' }
                    )
                }
            }
        },
        '/users/register': {
            post: {
                tags: ['Users'],
                summary: 'Registra un usuario (crea también su billetera)',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
                },
                responses: {
                    201: { description: 'Usuario creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    400: errorResponse('Datos inválidos', {
                        error: 'VALIDATION_ERROR',
                        message: 'Contraseña muy larga!',
                        fields: { password: 'Contraseña muy larga!' }
                    }),
                    409: errorResponse('El email ya existe', { error: 'CONFLICT', message: 'El registro ya existe' })
                }
            }
        },
        '/users/login': {
            post: {
                tags: ['Users'],
                summary: 'Inicia sesión',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
                },
                responses: {
                    200: { description: 'Usuario sin contraseña', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    400: errorResponse('Campos vacíos', {
                        error: 'VALIDATION_ERROR',
                        message: 'Debe ingresar una contraseña!',
                        fields: { password: 'Debe ingresar una contraseña!' }
                    }),
                    401: errorResponse('Credenciales incorrectas', {
                        error: 'INVALID_CREDENTIALS',
                        message: 'email o contraseña incorrecto/a',
                        fields: { email: 'email o contraseña incorrecto/a', password: 'email o contraseña incorrecto/a' }
                    })
                }
            }
        },
        '/users/{id}/bids': {
            get: {
                tags: ['Users'],
                summary: 'Subastas en las que pujó un usuario, con su mejor monto y estado',
                parameters: [idPath('id')],
                responses: {
                    200: {
                        description: 'Una entrada por subasta',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/UserBid' } } } }
                    }
                }
            }
        },
        '/wallets/balance': {
            get: {
                tags: ['Wallets'],
                summary: 'Saldo de la billetera de un usuario',
                parameters: [userIdQuery],
                responses: {
                    200: {
                        description: 'Saldos',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        total_balance: { type: 'string', example: '150000.00' },
                                        withheld_balance: { type: 'string', example: '45000.00' },
                                        available_balance: { type: 'string', example: '105000.00' }
                                    }
                                }
                            }
                        }
                    },
                    404: errorResponse('El usuario no tiene billetera', { error: 'WALLET_NOT_FOUND', message: 'El usuario no tiene billetera' })
                }
            }
        },
        '/wallets/deposit': {
            post: {
                tags: ['Wallets'],
                summary: 'Deposita saldo',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/DepositRequest' } } }
                },
                responses: {
                    200: { description: 'Billetera actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Wallet' } } } },
                    400: errorResponse('Monto inválido', {
                        error: 'VALIDATION_ERROR',
                        message: 'El monto debe ser mayor a 0',
                        fields: { amount: 'El monto debe ser mayor a 0' }
                    }),
                    404: errorResponse('El usuario no tiene billetera', { error: 'WALLET_NOT_FOUND', message: 'El usuario no tiene billetera' }),
                    409: errorResponse('Conflicto de concurrencia, reintentar', {
                        error: 'WALLET_CONCURRENCY_CONFLICT',
                        message: 'Conflicto de concurrencia en la billetera, reintentar'
                    })
                }
            }
        },
        '/wallets/movements': {
            get: {
                tags: ['Wallets'],
                summary: 'Movimientos del libro de transacciones de un usuario',
                parameters: [userIdQuery],
                responses: {
                    200: {
                        description: 'Movimientos',
                        content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } }
                    },
                    404: errorResponse('El usuario no tiene billetera', { error: 'WALLET_NOT_FOUND', message: 'El usuario no tiene billetera' })
                }
            }
        }
    },
    components: {
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string', example: 'VALIDATION_ERROR' },
                    message: { type: 'string' },
                    fields: { type: 'object', additionalProperties: { type: 'string' }, description: 'Solo en errores de validación' }
                }
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', example: 'comprador' }
                }
            },
            RegisterRequest: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                    name: { type: 'string', example: 'Ana Pérez' },
                    email: { type: 'string', example: 'ana@test.com' },
                    password: { type: 'string', maxLength: 20, example: 'secreto123' },
                    role: { type: 'string', example: 'comprador' }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', example: 'comprador1@test.com' },
                    password: { type: 'string' }
                }
            },
            Bid: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    amount: { type: 'string', example: '60000.00' },
                    bid_date: { type: 'string', format: 'date-time' },
                    buyer_id: { type: 'integer' }
                }
            },
            Auction: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    url_image: { type: 'string' },
                    seller_id: { type: 'integer' },
                    category_id: { type: 'integer' },
                    base_price: { type: 'string', example: '50000.00' },
                    min_increase: { type: 'string', example: '1000.00' },
                    start_date: { type: 'string', format: 'date-time' },
                    end_date: { type: 'string', format: 'date-time' },
                    state: { type: 'string', enum: ['PRÓXIMA', 'ACTIVA', 'FINALIZADA', 'DESIERTA'] },
                    currentPrice: { type: 'number', description: 'Solo en el listado: puja más alta o precio base' },
                    bids: { type: 'array', items: { $ref: '#/components/schemas/Bid' } }
                }
            },
            CreateAuctionRequest: {
                type: 'object',
                required: ['title', 'seller_id', 'category', 'description', 'url_image', 'base_price', 'min_increase',
                    'start_date', 'start_time', 'end_date', 'end_time'],
                properties: {
                    title: { type: 'string' },
                    seller_id: { type: 'integer' },
                    category: { type: 'string', description: 'Se crea si no existe' },
                    description: { type: 'string', minLength: 5 },
                    url_image: { type: 'string', example: 'https://ejemplo.com/foto.jpg' },
                    base_price: { type: 'number', example: 50000 },
                    min_increase: { type: 'number', example: 1000 },
                    start_date: { type: 'string', example: '2026-12-01' },
                    start_time: { type: 'string', example: '10:00' },
                    end_date: { type: 'string', example: '2026-12-02' },
                    end_time: { type: 'string', example: '18:00' }
                }
            },
            CreateBidRequest: {
                type: 'object',
                required: ['buyerId', 'amount'],
                properties: {
                    buyerId: { type: 'integer', example: 2 },
                    amount: { type: 'number', example: 60000 }
                }
            },
            UserBid: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    url_image: { type: 'string' },
                    end_date: { type: 'string', format: 'date-time' },
                    myBestAmount: { type: 'number' },
                    highestAmount: { type: 'number' },
                    status: { type: 'string', enum: ['GANANDO', 'SUPERADO', 'GANADA', 'PERDIDA'] }
                }
            },
            DepositRequest: {
                type: 'object',
                required: ['userId', 'amount'],
                properties: {
                    userId: { type: 'integer', example: 1 },
                    amount: { type: 'number', example: 10000 }
                }
            },
            Wallet: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    user_id: { type: 'integer' },
                    total_balance: { type: 'string' },
                    withheld_balance: { type: 'string' },
                    available_balance: { type: 'string' }
                }
            }
        }
    }
};
