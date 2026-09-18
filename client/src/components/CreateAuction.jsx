import { useState,useEffect } from 'react'
import axios from "axios";
import { useAuth } from '../context/AuthContext.jsx'
import swal from "sweetalert2";
import {useNavigate} from "react-router-dom"

export default function CreateAuction() {
    const { user } = useAuth();
    const [errors,setErrors]=useState({})
    const [categories, setCategories] = useState([])
    const today = new Date().toLocaleDateString('en-CA'); 
    const navigate=useNavigate();
    useEffect(() => {
        if(!user) {
            swal.fire({
                title:"Debe iniciar sesión para crear una subasta!",
                icon:"warning"
            })
            navigate("/iniciarSesion")
        } 
        
        const getCategories = async () => {
            const response = await axios.get('auctions/categories'); 
            setCategories(response.data)
        }
        getCategories()
    }, []);

    const [input, setInput]=useState({
        title:"",
        seller_id:user?.id,
        category:"",
        description:"",
        url_image:"", 
        base_price:"", 
        min_increase:"",
        start_date:"", 
        start_time:"",
        end_date:"",
        end_time:""
    })

    const getNextday=(date)=>{
        const startDate=new Date(date)
        startDate.setDate(startDate.getDate()+1)
        return startDate?.toISOString().split('T')[0];
    }

    const timesGenerator = () => {
        const times = [];
        for (var i= 0; i < 24; i++) {
            // padStart(2, '0') hace que el 8 se transforme en "08" 
            const formatHour = String(i).padStart(2, '0');
            times.push(formatHour + ":00");
            times.push(formatHour + ":30");
        }
        return times; 
    };

    const handleChange=(e)=>{
        setInput({...input,[e.target.name]:e.target.value})
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();
        try {
            await axios.post('auctions', input)
            setInput({
                title:"",
                seller_id:user?.id,
                category:"",
                description:"",
                url_image:"", 
                base_price:"", 
                min_increase:"",
                start_date:"", 
                start_time:"",
                end_date:"",
                end_time:""
            })
            setErrors({})
            swal.fire({ title: `Subasta creada con éxito!`, icon: 'success', timer: 1000 });
        } catch (error) {
            setErrors(error.response.data)
            swal.fire({ title: `Hay errores!`, icon: 'error', timer: 1000 });
        }  
    }

    return (
        <div className="container my-5">
            <div className="card shadow border-0 p-4 bg-white">
                <h1 className="text-center mb-4 text-primary fw-bold">Crear subasta</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Título</label>
                        <input name='title' value={input.title} type="text" onChange={handleChange} className={`form-control ${errors.title ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors.title}</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Descripción</label>
                        <textarea 
                            name='description' 
                            value={input.description} 
                            rows="3" 
                            onChange={handleChange} 
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}/>
                        <div className="invalid-feedback">{errors.description}</div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Categoría</label>
                        <div className="input-group">
                            <input 
                                type="text" 
                                name="category" 
                                value={input.category} 
                                onChange={handleChange} 
                                placeholder="Selecciona una de la lista o escribe una nueva..." 
                                className={`form-control ${errors.category ? 'is-invalid' : ''}`}
                            />
                            <select name='category' 
                                value={input.category} 
                                onChange={handleChange} 
                                disabled ={categories?.length==0} 
                                className="form-select bg-light text-secondary"
                            >
                                <option value="">Elige una categoría</option>
                                {categories.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                        <div className="text-danger small mt-1">{errors.category}</div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">URL de imagen</label>
                        <input  name='url_image' value={input.url_image} type="text" onChange={handleChange} className={`form-control ${errors.url_image ? 'is-invalid' : ''}`}/>
                        <div className="invalid-feedback">{errors.url_image}</div>
                    </div>
                    
                    <div className="row g-3 mb-4">
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-secondary">Precio base</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light fw-bold text-muted">$</span>
                                <input name='base_price' value={input.base_price} min="0" type="number" onChange={handleChange} className={`form-control ${errors.base_price ? 'is-invalid' : ''}`} />
                            </div>
                            <div className="text-danger small mt-1">{errors.base_price}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold text-secondary">Incremento mínimo</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light fw-bold text-muted">$</span>
                            <input  name='min_increase' value={input.min_increase} min="0" type="number" onChange={handleChange} className={`form-control ${errors.min_increase ? 'is-invalid' : ''}`}  />
                            </div>
                            <div className="text-danger small mt-1">{errors.min_increase}</div>
                        </div>
                    </div>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold text-secondary">Fecha y hora de inicio</label>
                                
                                    <input name='start_date' value={input.start_date} type="date" min={today} onChange={handleChange}/>
                                    <div className="text-danger small mt-1">{errors.start_date}</div>
                                    <select className="form-select" name='start_time' value={input.start_time} onChange={handleChange} disabled={input.start_date===""}>
                                        <option value="">Selccione un horario de inicio</option>
                                        {timesGenerator()
                                            .filter(t=>input.start_date===today?t>=new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false}):true)
                                            .map(t=>(<option key={t} value={t}>{t}hs</option>))}
                                    </select>
                                
                            <div className="text-danger small mt-1">{errors.start_time}</div>
                        </div>

                        <div className="col-12 col-md-6">
                            <label className="form-label fw-semibold text-secondary">Fecha y hora de finalización</label>
                                
                                    <input name='end_date' value={input.end_date} type="date" min={input.start_date?getNextday(input.start_date):""} onChange={handleChange} disabled = {input.start_date==="" && input.start_time===""}/>
                                    <div className="text-danger small mt-1">{errors.end_date}</div>
                       
                                    <select className="form-select" name='end_time' value={input.end_time} onChange={handleChange} disabled={input.start_date===""}>
                                        <option value="">Selccione un horario de finalización</option>
                                            {timesGenerator().map(t=>(<option key={t} value={t}>{t}hs</option>))}
                                    </select>
                                
                            <div className="text-danger small mt-1">{errors.end_time}</div>
                        </div>
                    </div>
                    <button  className="btn btn-primary" type='submit'>Crear subasta</button>
                </form> 
            </div>
        </div>
    )
}
