const {Router}= require("express")
const {auctionsRouter}=require('./auctionsRouter')
const {walletsRouter}=require('./walletsRouter')
const router=Router();
router.use("/auctions",auctionsRouter)
router.use("/wallets",walletsRouter)

module.exports=router;