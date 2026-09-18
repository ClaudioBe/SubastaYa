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
        <div className="container my-5 d-flex justify-content-center">
            <div className="card shadow-sm border-0 p-4" style={{ maxWidth: 420, width: '100%' }}>
                <h2 className="text-center mb-4 fw-bold">Registrarse</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Nombre</label>
                        <input name='name' value={input.name} type="text" onChange={handleChange} className={`form-control ${errors.name ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors.name}</div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">E-mail</label>
                        <input name='email' value={input.email} type="text" onChange={handleChange} className={`form-control ${errors.email ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors.email}</div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Contraseña</label>
                        <input type="password" name="password" value={input.password} onChange={handleChange} className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
                        <div className="invalid-feedback">{errors.password}</div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label fw-semibold text-secondary">Rol</label>
                        <select name="role" onChange={handleChange} className="form-select" defaultValue="" >
                            <option value="" disabled>Seleccione un rol</option>
                            <option value="cliente">cliente</option>
                            <option value="vendedor">vendedor</option>
                        </select>
                        <div className="text-danger small mt-1">{errors.role}</div>
                    </div>
                    <button type='submit' className="btn btn-primary w-100 fw-semibold">Registrarse</button>
                </form>
            </div>
        </div>
    )
}

export default Register;
