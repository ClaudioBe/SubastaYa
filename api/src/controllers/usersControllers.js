const usersService = require('../services/usersService');
const bidsService = require('../services/bidsService');
const { toUserDto, toUserBidDto } = require('../dtos');

const register = async (req, res) => {
    const message = await usersService.register(req.body);
    res.status(201).send(message);
};

const login = async (req, res) => {
    const user = await usersService.login(req.body);
    res.status(200).json(toUserDto(user));
};

const listBids = async (req, res) => {
    const bids = await bidsService.getBidsByBuyer(req.params.id);
    res.status(200).json(bids.map(toUserBidDto));
};

module.exports = { register, login, listBids };
