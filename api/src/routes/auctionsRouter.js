const {Router}=require('express');
const {createAuction,getAllAuctions,getAuctionById,}=require('../controllers/auctionsControllers')
const {createBid}=require('../controllers/bidsControllers')
const auctionsRouter=Router();

auctionsRouter.post('/',async(req,res)=>{
    try {
        const postAuction = await createAuction(req.body);
        res.status(200).json(postAuction);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

auctionsRouter.get('/',async(req,res)=>{
    try {
        const auctions = await getAllAuctions(req.body);
        res.status(200).json(auctions);
    } catch (error) {
        res.status(400).send(error.message)
    }
})
auctionsRouter.get('/:id',async(req,res)=>{
    try {
        const getAuction = await getAuctionById(req.params.id);
        res.status(200).json(getAuction);
    } catch (error) {
        res.status(400).send(error.message)
    }
})
auctionsRouter.post('/:id/bids',async(req,res)=>{
    try {
        const { buyerId, amount } = req.body;
        const bid = await createBid(req.params.id, buyerId, amount);
        res.status(200).json(bid);
    } catch (error) {
        res.status(400).send(error.message)
    }
})
module.exports={auctionsRouter}