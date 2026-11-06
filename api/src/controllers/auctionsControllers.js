const auctionsService = require('../services/auctionsService');
const bidsService = require('../services/bidsService');
const { toAuctionDto, toAuctionDetailDto, toBidDto } = require('../dtos');

//Capa HTTP: lee la petición, delega en el servicio y responde con DTOs
const create = async (req, res) => {
    const auction = await auctionsService.createAuction(req.body);
    res.status(201).json(toAuctionDto(auction));
};

const list = async (req, res) => {
    const { search, sellerId, category, state, minPrice, maxPrice, sort } = req.query;
    const auctions = await auctionsService.getAllAuctions({ search, sellerId, category, state, minPrice, maxPrice, sort });
    res.status(200).json(auctions.map(toAuctionDetailDto));
};

const listCategories = async (req, res) => {
    res.status(200).json(await auctionsService.getAllCategoryNames());
};

const getById = async (req, res) => {
    const auction = await auctionsService.getAuctionById(req.params.id);
    res.status(200).json(toAuctionDetailDto(auction));
};

const placeBid = async (req, res) => {
    const { buyerId, amount } = req.body;
    const bid = await bidsService.createBid(req.params.id, buyerId, amount);
    res.status(201).json(toBidDto(bid));
};

module.exports = { create, list, listCategories, getById, placeBid };
