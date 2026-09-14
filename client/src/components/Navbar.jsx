import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom mb-3">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">SubastaYa</Link>

        <div className="d-flex gap-3 align-items-center">
          <NavLink to="/" end className="nav-link">Inicio</NavLink>
          <NavLink to="/subasta" className="nav-link">Crear subasta</NavLink>
        </div>

        <div className="d-flex gap-3 align-items-center ms-auto">
          {user ? (
            <>
              <span>Hola, {user.name}</span>
              <button className="btn btn-outline-dark btn-sm" onClick={logout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/iniciarSesion">Iniciar sesión</Link>
              <Link to="/registrarse">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
