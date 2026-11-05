const {Router}=require('express');
const {createAuction,getAllAuctions,getAuctionById,getAllCategoryNames}=require('../controllers/auctionsControllers')
const {createBid}=require('../controllers/bidsControllers')
const {asyncHandler}=require('../utils/asyncHandler')
const auctionsRouter=Router();

auctionsRouter.post('/',asyncHandler(async(req,res)=>{
    const postAuction = await createAuction(req.body);
    res.status(201).json(postAuction);
}))

auctionsRouter.get('/',asyncHandler(async(req,res)=>{
    const { search, sellerId, category, state, minPrice, maxPrice, sort } = req.query;
    const auctions = await getAllAuctions({ search, sellerId, category, state, minPrice, maxPrice, sort });
    res.status(200).json(auctions);
}))

auctionsRouter.get('/categories',asyncHandler(async(req,res)=>{
    const categoryNames = await getAllCategoryNames();
    res.status(200).json(categoryNames);
}))

auctionsRouter.get('/:id',asyncHandler(async(req,res)=>{
    const getAuction = await getAuctionById(req.params.id);
    res.status(200).json(getAuction);
}))

auctionsRouter.post('/:id/bids',asyncHandler(async(req,res)=>{
    const { buyerId, amount } = req.body;
    const bid = await createBid(req.params.id, buyerId, amount);
    res.status(201).json(bid);
}))

module.exports={auctionsRouter}
