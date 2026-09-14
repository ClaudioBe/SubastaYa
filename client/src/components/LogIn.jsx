import { useState } from 'react'
import axios from 'axios'
import { useNavigate} from "react-router-dom"
import { useAuth } from '../context/AuthContext.jsx'
import swal from 'sweetalert2'

const LogIn=()=> {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [errors,setErrors]=useState({})
    const [input, setInput]=useState({
            email:"",
            password:""
    })

    const handleChange=(e)=>{
        setInput({...input,[e.target.name]:e.target.value})
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();
        try {
            const response = await axios.post('users/login', input);
            login(response.data);
            navigate('/');
        } catch (error) {
            setErrors(error.response.data);
            swal.fire({ title: `Hay errores!`, icon: 'error', timer: 1000 });
        }
    }

    return (
        <div>
        <h1>Iniciar sesión</h1>
        <form onSubmit={handleSubmit}>
            <label>E-mail</label>
            <input name='email' value={input.email} type="text" onChange={handleChange}  />
            <p>{errors.email}</p>

            <label>Contraseña</label>
            <input name='password' value={input.password} type="password" onChange={handleChange} />
            <p>{errors.password}</p>

            <button type='submit'>Iniciar Sesión</button>
        </form> 
        </div>
    )
}

export default LogIn