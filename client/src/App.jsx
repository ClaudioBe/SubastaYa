// import './App.css'
import {Routes,Route} from 'react-router-dom';
import Home from './components/Home.jsx';
import CreateAuction from './components/CreateAuction';
import AuctionRoom from './components/AuctionRoom.jsx';
import Register from './components/Register.jsx';
import LogIn from './components/LogIn.jsx';
import axios from 'axios';

axios.defaults.baseURL='http://localhost:3001/';

function App() {
  return (
    <>
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
