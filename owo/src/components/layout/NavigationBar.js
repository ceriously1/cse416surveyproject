import {Link} from 'react-router-dom';

function NavigationBar() {
    return <header>
        <nav>
            <ul style= {{display: 'inline-flex', listStyle: 'none'}}>
                <li><Link to='/'>Home</Link></li>
                <li><Link to='/user/signup'>Sign Up</Link></li>
                <li><Link to='/user/login'>Login</Link></li>
                <li><Link to='/user/balance'>Balance</Link></li>
            </ul>
        </nav>
    </header>;
}

export default NavigationBar;