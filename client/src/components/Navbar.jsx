import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWallet } from '../context/WalletContext.jsx';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { balance, hasWallet } = useWallet();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark mb-4 shadow-sm" style={{ background: 'var(--brand-dark)' }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="SubastaYa" height="52" />
        </Link>

        <div className="d-flex gap-3 align-items-center">
          <NavLink to="/subasta" className="nav-link">Crear subasta</NavLink>
        </div>

        <div className="d-flex gap-3 align-items-center ms-auto">
          {user ? (
            <>
              <span className="text-white-50 d-none d-md-inline">Hola, {user.name}</span>
              <Link to="/mis-actividades" className="nav-link">
                Mis actividades
              </Link>
              {hasWallet && (
                <Link
                  to="/billetera"
                  className="btn btn-sm fw-semibold"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent-hover)' }}
                >
                  $ {balance.available_balance}
                </Link>
              )}
              <button className="btn btn-outline-light btn-sm" onClick={logout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/iniciarSesion" className="nav-link">Iniciar sesión</Link>
              <Link to="/registrarse" className="btn btn-sm" style={{ background: 'var(--accent)', color: '#fff' }}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
