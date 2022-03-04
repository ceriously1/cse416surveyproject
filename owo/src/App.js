import {Route, Routes} from 'react-router-dom';

import Account from './pages/Account.js';
import Balance from './pages/Balance.js';
import BuildProgress from './pages/BuildProgress.js';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Progress from './pages/Progress.js';
import Published from './pages/Published.js';

import NavBar from './components/NavBar';

function App() {
  return (
    <div>
      <NavBar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/account' element={<Account/>}/>
        <Route path='/balance' element={<Balance/>}/>
        <Route path='/buildprogress' element={<BuildProgress/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/progress' element={<Progress/>}/>
        <Route path='/published' element={<Published/>}/>
      </Routes>
    </div>
  );
}

export default App;
