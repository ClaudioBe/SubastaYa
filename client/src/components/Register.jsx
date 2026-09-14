import { useState } from "react"
import axios from 'axios'
import swal from "sweetalert2";
import {useNavigate} from "react-router-dom";

const Register=()=> {
    const [errors,setErrors]=useState({})
    const [input, setInput]=useState({
            name:"",
            email:"",
            password:"",
            role:""
    })
    const navigate = useNavigate()
        
    const handleChange=(e)=>{
        setInput({...input,[e.target.name]:e.target.value})
    }
    
    const handleSubmit=async(e)=>{
        e.preventDefault();
        try {
            await axios.post('users/register', input);
            navigate('/iniciarSesion')
            swal.fire({
                    title: `Registro exitoso!`,
                    text: "Ya puedes iniciar sesion!",
                    icon: 'success'    
            });


        } catch (error) {
            setErrors(error.response.data);
            swal.fire({
                    title: `Hay errores!`,
                    icon: 'error',
                    timer: 1000
            });
        }
    }
             
    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded bg-light">
            <h1 className="mb-4">Registrarse</h1>
            <div className="col-md-4 mb-3">
                <label className="form-label">Nombre</label>
                <input name='name' value={input.name} type="text" onChange={handleChange}/>
                <div className="text-danger small mt-1">{errors.name}</div>
            </div>
            <div className="col-md-4 mb-3">
                <label className="form-label">E-mail</label>
                <input name='email' value={input.email} type="text" onChange={handleChange} />
                <div className="text-danger small mt-1">{errors.email}</div>
            </div>
            <div className="col-md-4 mb-3">
                <label className="form-label">Contraseña</label>
                <input type="password" name="password" value={input.password} onChange={handleChange}/>
                <div className="text-danger small mt-1">{errors.password}</div>
            </div>

            <div className="col-md-4 mb-3">
                <label className="form-label">Rol</label>
                <select name="role" onChange={handleChange} className="form-select" defaultValue="" >
                    <option value="" disabled>Seleccione un rol</option>
                    <option value="cliente">cliente</option>
                    <option value="vendedor">vendedor</option>
                </select>
                <div className="text-danger small mt-1">{errors.role}</div>
            </div>
            <div className="col-12">
                <button type='submit' className="btn btn-primary">Registrarse</button>
            </div>
        </form> 
    )
}

export default Register;
