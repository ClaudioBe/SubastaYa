const {Auction} = require('../db')

const createAuction= async(auction)=>{
    const createdAuction=await Auction.create(auction);
    return createdAuction;
}

const getAllAuctions=async()=>{
    const auctions=await Auction.findAll();
    return auctions;
}

const getAuctionById=async(id)=>{
    const auction=await Auction.findByPk(id);
    return auction;
}   
module.exports={createAuction,getAllAuctions,getAuctionById};