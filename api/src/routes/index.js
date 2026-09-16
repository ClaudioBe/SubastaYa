const {Router}= require("express")
const {auctionsRouter}=require('./auctionsRouter')
const {walletsRouter}=require('./walletsRouter')
const{usersRouter}=require('./usersRouter')

const router=Router();

router.use("/auctions",auctionsRouter)
router.use("/wallets",walletsRouter)
router.use("/users",usersRouter)

module.exports=router;