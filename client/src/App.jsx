import './App.css'
import {Routes,Route} from 'react-router-dom';

function App() {
  return (
    <div>
      <Routes>
        <Route exact path='/' element = {<Home/>}/>
      </Routes>
    </div>)
}

export default App
