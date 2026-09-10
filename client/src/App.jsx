// import './App.css'
import {Routes,Route} from 'react-router-dom';
import Home from './components/Home.jsx';
import CreateAuction from './components/CreateAuction';
import axios from 'axios';
axios.defaults.baseURL='http://localhost:3001/';

function App() {
  return (
    <>
      <Routes>
        <Route  path='/' element = {<Home/>}/>
         <Route  path='/subasta' element = {<CreateAuction/>}/> 
      </Routes>
    </>)
}

export default App
