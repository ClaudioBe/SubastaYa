import { useState,useEffect } from 'react'
import axios from "axios";

export default function CreateAuction() {
    const [errors,setErrors]=useState({})
    const [categories, setCategories] = useState([])
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const getCategories = async () => {
            const response = await axios.get('auctions/categories'); 
            setCategories(response.data)
        }
        getCategories()
    }, []);

    const [input, setInput]=useState({
        title:"",
        seller_id:1,
        category:"",
        description:"",
        url_image:"", 
        base_price:"", 
        min_increase:"",
        start_date:"", 
        end_date:""
    })


    const handleChange=(e)=>{
        setInput({...input,[e.target.name]:e.target.value})
    }

    const handleSubmit=async(e)=>{
        console.log(input);
        
        e.preventDefault();
        try {
            await axios.post('auctions', input)
        } catch (error) {
            console.log("Error en create: " +JSON.parse(error.data));
            
            setErrors(error.data)
        }
        
    }

    return (
        <div>
        <h1>Crear subasta</h1>
        <form onSubmit={handleSubmit}>
            <label>Título</label>
            <input name='title' value={input.title} type="text" onChange={handleChange}  />
            <p>{errors.title}</p>

            <label>Descripción</label>
            <input name='description' value={input.description} type="text" onChange={handleChange} />
            <p>{errors.description}</p>

            <label>Categoría</label>
           <input type="text" name="category" value={input.category} onChange={handleChange} list="categories-options" placeholder="Selecciona una de la lista o escribe una nueva..."/>
  
            <datalist id="categories-options">
                {categories.map(name => <option value={name} />)}
            </datalist>
            <p>{errors.category}</p>

            <label>URL de imagen</label>
            <input  name='url_image' value={input.url_image} type="text" onChange={handleChange}  />
            <p>{errors.url_image}</p>

            <label>Precio base</label>
            <input name='base_price' value={input.base_price} type="number" onChange={handleChange}  />
            <p>{errors.base_price}</p>

            <label>Incremento mínimo</label>
            <input  name='min_increase' value={input.min_increase} type="number" onChange={handleChange}  />
            <p>{errors.min_increase}</p>

            <label>Fecha de inicio</label>
            <input  name='start_date' value={input.start_date} type="date" min={today} onChange={handleChange} />
            <p>{errors.start_date}</p>

            <label>Fecha de finalización</label>
            <input  name='end_date' value={input.end_date} type="date" min={today} onChange={handleChange} />
            <p>{errors.end_date}</p>
            <button type='submit'></button>
        </form> 
        </div>
    )
}
