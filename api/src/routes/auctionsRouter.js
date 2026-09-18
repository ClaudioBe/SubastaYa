const {Router}=require('express');
const {createAuction,getAllAuctions,getAuctionById,getAllCategoryNames}=require('../controllers/auctionsControllers')
const {createBid}=require('../controllers/bidsControllers')
const auctionsRouter=Router();

auctionsRouter.post('/',async(req,res)=>{
    try {
        const postAuction = await createAuction(req.body);
        res.status(200).json(postAuction);
    } catch (error) {
        try {
            // Si el error fue lanzado por tus validaciones manuales (JSON stringificado)
            return res.status(400).json(JSON.parse(error.message));
        } catch (parseError) {
            // Si el error vino de Sequelize/BD (Texto plano: "value too long...")
            console.error("Error nativo de BD:", error.message);
            return res.status(400).json({ databaseError: error.message });
        }   
    }
})

auctionsRouter.get('/categories',async(req,res)=>{
    try {
        const categoryNames=await getAllCategoryNames();
        res.status(201).json(categoryNames)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

auctionsRouter.get('/',async(req,res)=>{
    try {
        const { search, sellerId } = req.query;
        const auctions = await getAllAuctions(search, sellerId);
        res.status(200).json(auctions);
    } catch (error) {
        res.status(400).send(error.message)
    }
})
auctionsRouter.get('/categories',async(req,res)=>{
    try {
        const categoryNames = await getAllCategoryNames();
        res.status(200).json(categoryNames);
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