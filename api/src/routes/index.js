const {Router}= require("express")
const {subastaRouter}=require('./subastaRouter')
const {billeteraRouter}=require('./billeteraRouter')
const router=Router();
router.use("/subastas",subastaRouter)
router.use("/billetera",billeteraRouter)

module.exports=router;