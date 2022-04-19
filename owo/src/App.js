import {Route, Routes} from 'react-router-dom';

import Account from './pages/Account.js';
import Balance from './pages/Balance.js';
import Builder from './pages/Builder.js';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Progress from './pages/Progress.js';
import Published from './pages/Published.js';
import Signup from './pages/Signup.js';
import Taker from './pages/Taker.js';
import Search from './pages/Search.js';

import NavigationBar from './components/layout/NavigationBar.js';

function App() {
  return (
    <div>
      <NavigationBar />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/account' element={<Account/>}/>
        <Route path='/user/balance' element={<Balance/>}/>
        <Route path='/user/login' element={<Login/>}/>
        <Route path='/survey/progress' element={<Progress/>}/>
        <Route path='/survey/published' element={<Published/>}/>
        <Route path='/user/signup' element={<Signup/>}/>
        <Route path='/survey/builder/:survey_id' element={<Builder/>}/>
        <Route path='/survey/taker/:survey_id' element={<Taker/>}/>
        <Route path='/survey/search' element={<Search/>}/>
      </Routes>
    </div>
  );
}

export default App;
