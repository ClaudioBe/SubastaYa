// import './App.css'
import {Routes,Route,Link} from 'react-router-dom';
import Home from './components/Home.jsx';
import CreateAuction from './components/CreateAuction';
import AuctionRoom from './components/AuctionRoom.jsx';
import Register from './components/Register.jsx';
import LogIn from './components/LogIn.jsx';
import axios from 'axios';
import { useAuth } from './context/AuthContext.jsx';
axios.defaults.baseURL='http://localhost:3001/';

function App() {
  const { user, logout } = useAuth();
  return (
    <>
    <div className="d-flex justify-content-end p-2 gap-2">
        {user
          ? <>
              <span>Hola, {user.name}</span>
              <button onClick={logout}>Cerrar sesión</button>
            </>
          : <>
              <Link to="/iniciarSesion">Iniciar sesión</Link>
              <Link to="/registrarse">Registrarse</Link>
            </>
        }
      </div>
      <Routes>
        <Route  path='/' element = {<Home/>}/>
        <Route  path='/subasta' element = {<CreateAuction/>}/>
        <Route  path='/subastas/:id' element = {<AuctionRoom/>}/>
        <Route  path='/registrarse' element = {<Register/>}/> 
        <Route  path='/iniciarSesion' element = {<LogIn/>}/> 
      </Routes>
    </>)
}

export default App
