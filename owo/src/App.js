import {Route, Routes} from 'react-router-dom';

import Account from './pages/Account.js';
import Balance from './pages/Balance.js';
import Builder from './pages/Builder.js';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Progress from './pages/Progress.js';
import Published from './pages/Published.js';
import Signup from './pages/Signup.js';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/account' element={<Account/>}/>
        <Route path='/balance' element={<Balance/>}/>
        <Route path='/user/login' element={<Login/>}/>
        <Route path='/progress' element={<Progress/>}/>
        <Route path='/published' element={<Published/>}/>
        <Route path='/user/signup' element={<Signup/>}/>
      </Routes>
    </div>
  );
}

export default App;
