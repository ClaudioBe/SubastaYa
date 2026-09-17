import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWallet } from '../context/WalletContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { balance, hasWallet } = useWallet();

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
              <Link to="/mis-actividades" className="nav-link">
                Mis actividades
              </Link>
              {hasWallet && (
                <Link to="/billetera" className="nav-link">
                  $ {balance.available_balance}
                </Link>
              )}
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
