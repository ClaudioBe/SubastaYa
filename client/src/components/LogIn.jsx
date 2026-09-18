import { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate} from "react-router-dom"
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
            response.data.role==="vendedor" ? navigate("/subasta")
                                            : navigate('/');
        } catch (error) {
            setErrors(error.response.data);
            swal.fire({ title: `Hay errores!`, icon: 'error', timer: 1000 });
        }
    }

    return (
        <div className="container my-5 d-flex justify-content-center">
            <div className="card shadow-sm border-0 p-4" style={{ maxWidth: 420, width: '100%' }}>
                <h2 className="text-center mb-4 fw-bold">Iniciar sesión</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">E-mail</label>
                        <input
                            name='email'
                            value={input.email}
                            type="email"
                            onChange={handleChange}
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        />
                        <div className="invalid-feedback">{errors.email}</div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold text-secondary">Contraseña</label>
                        <input
                            name='password'
                            value={input.password}
                            type="password"
                            onChange={handleChange}
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        />
                        <div className="invalid-feedback">{errors.password}</div>
                    </div>
                    <button type='submit' className="btn btn-primary w-100 fw-semibold">Iniciar Sesión</button>
                </form>
                <div className="text-center mt-4">
                    <p className="text-muted small mb-2">¿Todavía no tienes una cuenta?</p>
                    <Link className="btn btn-outline-dark btn-sm" to="/registrarse">¡Registrate!</Link>
                </div>
            </div>
        </div>
    )
}

export default LogIn
