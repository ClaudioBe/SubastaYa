const {Auction, Category} = require('../db')
const { Op } = require('sequelize');

//para poder validar si el usuario ingresó una url valida
const regexURL = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

const createAuction= async({title,seller_id, category, description, url_image, base_price, min_increase, start_date, end_date})=>{
    const errors={};
    let startDate;
    if(title=="") errors.title="Debe ingresar un título!";
   
    if(description=="") errors.description="Debe ingresar una descripción!";
    else if(description.length!=5) errors.description="Descripción muy breve!";
    if(category=="") errors.category="Debe ingresar o elegir una categoría!";

    if(start_date=="") errors.start_date="Debe elegir una fecha de inicio!";
    else{
        startDate=new Date(start_date);
        startDate.setDate(startDate.getDate() + 1);
    }
    if(end_date=="") errors.end_date="Debe elegir una fecha de finalización!";

    if(base_price=="") errors.base_price="Debe ingresar un precio base!";
    if(min_increase=="") errors.min_increase="Debe ingresar un incremento mínimo!";

    if(url_image=="") errors.url_image="Debe ingresar una url de imagen!";
    else if(!regexURL.test(url_image)) errors.url_image="Debe ingresar una url!";

    console.log("fecha start: " + startDate);
    console.log("fecha hoy: " + new Date());
    // if(start_date=! new Date())
    if(Object.keys(errors).length)throw Error (JSON.stringify(errors));
    
    const endDate=new Date(end_date);
    endDate.setDate(endDate.getDate() + 1);
    const [categoryData] = await Category.findOrCreate({
        where: { name: category },
        defaults: { name: category }
    })
    
    const createdAuction=await Auction.create({title,seller_id,category_id:categoryData.id, description, url_image, base_price, min_increase,start_date: startDate, end_date:endDate, state, version:1});
    return createdAuction;
}

const getAllAuctions=async(search)=>{

    const include = [{ model: Category, attributes: ['name'] }];

    if (!search) return await Auction.findAll({ include });

    return await Auction.findAll({
        include,
        where: {
            [Op.or]: [
                { title: { [Op.iLike]: `%${search}%` } },
                { '$category.name$': { [Op.iLike]: `%${search}%` } }
            ]
        }
    });
};

const getAuctionById=async(id)=>{
    const auction=await Auction.findByPk(id);
    return auction;
}   

const getAllCategoryNames=async()=>{
    const categories = await Category.findAll({
        attributes: ['name'],
        order: [['name', 'ASC']]
    });
    const categoryNames = categories.map(c => c.name);
    
    return categoryNames?categoryNames:[];
}

module.exports={createAuction,getAllAuctions,getAuctionById,getAllCategoryNames};