const {Auction, Category, User, Bid} = require('../db')
const { Op } = require('sequelize');

//para poder validar si el usuario ingresó una url valida
const regexURL = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;



const createAuction= async({title,seller_id, category, description, url_image, base_price, min_increase, start_date, start_time, end_date, end_time})=>{
    const errors={};
    let startDate;
    if(title=="") errors.title="Debe ingresar un título!";
   
    if(description=="") errors.description="Debe ingresar una descripción!";
    else if(description.length<5) errors.description="Descripción muy breve!";
    if(category=="") errors.category="Debe ingresar o elegir una categoría!";

    if(start_date=="") errors.start_date="Debe elegir una fecha de inicio!";
    else{
        startDate = new Date(`${start_date}T${start_time}:00`);
        if(startDate<=new Date()) errors.start_time_="Debe seleccionar un horario posterior al actual!"
    }

    if(end_date=="") errors.end_date="Debe elegir una fecha de finalización!";

    if(start_time=="") errors.start_time="Debe elegir un horario de inicio!";
    
    if(end_time=="") errors.end_time="Debe elegir un horario de finalización!";

    if(base_price=="") errors.base_price="Debe ingresar un precio base!";
    if(min_increase=="") errors.min_increase="Debe ingresar un incremento mínimo!";

    if(url_image=="") errors.url_image="Debe ingresar una url de imagen!";
    else if(!regexURL.test(url_image)) errors.url_image="Debe ingresar una url válida!";
    
    if(Object.keys(errors).length)throw Error (JSON.stringify(errors));
    
    const endDate= new Date(`${end_date}T${end_time}:00`);

    const [categoryData] = await Category.findOrCreate({
        where: { name: category },
        defaults: { name: category }
    })
    
   
    const createdAuction=await Auction.create({title,seller_id,category_id:categoryData.id, description, url_image, base_price, min_increase,start_date: startDate, end_date:endDate, state:'PRÓXIMA'});
    return createdAuction;
}

const getAllAuctions=async({ search, sellerId, category, state, minPrice, maxPrice, sort } = {})=>{

    const include = [{ model: Category, attributes: ['name'] }, { model: Bid }];
    const now = new Date();
    const and = [];

    if (sellerId) and.push({ seller_id: sellerId });

    if (search) {
        and.push({
            [Op.or]: [
                { title: { [Op.iLike]: `%${search}%` } },
                { '$category.name$': { [Op.iLike]: `%${search}%` } }
            ]
        });
    }

    if (category) and.push({ '$category.name$': category });

    //Estado: PRÓXIMA/ACTIVA/FINALIZADA/DESIERTA son estados reales, salvo el caso ACTIVA-vencida-sin-procesar
    //todavía por el worker (margen de hasta AUCTION_WORKER_INTERVAL_MS), que tratamos como finalizada.
    if (state === 'ACTIVA') {
        and.push({ state: 'ACTIVA' }, { end_date: { [Op.gt]: now } });
    } else if (state === 'PROXIMA') {
        and.push({ state: 'PRÓXIMA' });
    } else if (state === 'FINALIZADA') {
        and.push({
            [Op.or]: [
                { state: { [Op.in]: ['FINALIZADA', 'DESIERTA'] } },
                { state: 'ACTIVA', end_date: { [Op.lte]: now } }
            ]
        });
    }

    const where = and.length ? { [Op.and]: and } : {};

    const auctions = await Auction.findAll({ include, where });

    //Precio actual = puja más alta, o el precio base si todavía no tiene pujas
    let results = auctions.map(a => {
        const json = a.toJSON();
        const highestAmount = json.bids.length ? Math.max(...json.bids.map(b => Number(b.amount))) : null;
        return { ...json, currentPrice: highestAmount ?? Number(json.base_price) };
    });

    if (minPrice) results = results.filter(a => a.currentPrice >= Number(minPrice));
    if (maxPrice) results = results.filter(a => a.currentPrice <= Number(maxPrice));

    if (sort === 'time_asc') {
        results = results.sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
    } else if (sort === 'bids_desc') {
        results = results.sort((a, b) => b.currentPrice - a.currentPrice);
    }

    return results;
};

const getAuctionById=async(id)=>{
    const auction=await Auction.findByPk(id, {
        include: [
            { model: Category, attributes: ['name'] },
            { model: User, attributes: ['id', 'name'] },
            { model: Bid, attributes: ['id', 'amount', 'bid_date', 'buyer_id'], include: [{ model: User, attributes: ['id', 'name'] }] }
        ]
    });
    if (!auction) throw new Error('Subasta no encontrada');
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