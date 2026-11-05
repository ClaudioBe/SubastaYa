//DTOs de respuesta: definen el contrato público de la API y evitan exponer las instancias de Sequelize
//(campos internos como "version" o relaciones no pedidas). Aceptan instancias del modelo u objetos planos.
const plain = (value) => (value && typeof value.toJSON === 'function' ? value.toJSON() : value);

const toBidDto = (bid) => {
    const { id, auction_id, buyer_id, amount, bid_date, user } = plain(bid);
    const dto = { id, auction_id, buyer_id, amount, bid_date };
    if (user) dto.user = { id: user.id, name: user.name };
    return dto;
};

const toAuctionDto = (auction) => {
    const { id, title, description, url_image, seller_id, category_id, base_price, min_increase, start_date, end_date, state } = plain(auction);
    return { id, title, description, url_image, seller_id, category_id, base_price, min_increase, start_date, end_date, state };
};

//Listado y detalle comparten la base y suman solo lo que cada uno carga
const toAuctionDetailDto = (auction) => {
    const { category, user, bids, currentPrice } = plain(auction);
    const dto = toAuctionDto(auction);
    if (category) dto.category = { name: category.name };
    if (user) dto.user = { id: user.id, name: user.name };
    if (bids) dto.bids = bids.map(toBidDto);
    if (currentPrice !== undefined) dto.currentPrice = currentPrice;
    return dto;
};

const toWalletDto = (wallet) => {
    const { id, user_id, total_balance, withheld_balance, available_balance } = plain(wallet);
    return { id, user_id, total_balance, withheld_balance, available_balance };
};

const toBalanceDto = ({ total_balance, withheld_balance, available_balance }) => (
    { total_balance, withheld_balance, available_balance }
);

const toMovementDto = (movement) => {
    const { id, wallet_id, type, amount, date, auction_id, auction } = plain(movement);
    const dto = { id, wallet_id, type, amount, date, auction_id };
    if (auction) dto.auction = { title: auction.title };
    return dto;
};

//El login ya devuelve el usuario sin contraseña; aquí se fija además qué campos salen
const toUserDto = (user) => {
    const { id, name, email, role } = plain(user);
    return { id, name, email, role };
};

const toUserBidDto = ({ id, title, url_image, end_date, myBestAmount, highestAmount, status }) => (
    { id, title, url_image, end_date, myBestAmount, highestAmount, status }
);

module.exports = {
    toBidDto,
    toAuctionDto,
    toAuctionDetailDto,
    toWalletDto,
    toBalanceDto,
    toMovementDto,
    toUserDto,
    toUserBidDto
};
