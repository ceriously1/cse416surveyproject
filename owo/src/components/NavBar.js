import {Link} from 'react-router-dom';

function NavBar() {
    return <header>
        <nav>
            <ul>
                <li><Link to='/'>Home</Link></li>
                <li><Link to='/account'>Account</Link></li>
                <li><Link to='/balance'>Balance</Link></li>
                <li><Link to='/buildprogress'>Build Survey</Link></li>
                <li><Link to='/progress'>Survey Progress</Link></li>
                <li><Link to='/published'>Surveys Published</Link></li>
            </ul>
        </nav>
    </header>;
}

export default NavBar;