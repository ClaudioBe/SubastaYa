const {Router}= require("express")
const {subastaRouter}=require('./subastaRouter')
const router=Router();
router.use("/subastas",subastaRouter)


module.exports=router;