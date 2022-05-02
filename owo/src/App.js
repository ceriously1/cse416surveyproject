import {Route, Routes} from 'react-router-dom';

import Balance from './pages/Balance.js';
import Builder from './pages/Builder.js';
import Home from './pages/Home.js';
import Login from './pages/Login.js';
import Progress from './pages/Progress.js';
import Published from './pages/Published.js';
import Signup from './pages/Signup.js';
import Taker from './pages/Taker.js';
import Search from './pages/Search.js';
import View from './pages/View.js';

import NavigationBar from './components/layout/NavigationBar.js';

// https://stackoverflow.com/questions/54247104/node-react-after-installing-env-module-error-for-fs

function App() {
  return (
    <div>
      <NavigationBar />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/user/balance' element={<Balance/>}/>
        <Route path='/user/login' element={<Login/>}/>
        <Route path='/survey/progress' element={<Progress/>}/>
        <Route path='/survey/published' element={<Published/>}/>
        <Route path='/user/signup' element={<Signup/>}/>
        <Route path='/survey/builder/:survey_id' element={<Builder/>}/>
        <Route path='/survey/taker/:survey_id' element={<Taker/>}/>
        <Route path='/survey/search' element={<Search/>}/>
        <Route path='/survey/view/:survey_id' element={<View/>}/>
      </Routes>
    </div>
  );
}

export default App;
