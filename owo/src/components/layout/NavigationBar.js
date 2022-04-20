import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';

function NavigationBar() {
    const navigate = useNavigate();
    const [logged, setLogged] = useState(false);

    function logout() {
        fetch('http://localhost:4000/user/logout', 
        {
            method: 'Post', 
            credentials: 'include',
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
            if (response.success === true) {
                navigate('/user/login');
                return;
            }
        });
    }

    useEffect(() => {
        fetch('http://localhost:4000/user/logged', 
        {
            method: 'Get', 
            credentials: 'include',
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            //console.log(response);
            setLogged(response.logged);
        });
    }, [navigate]);
    
    if (logged) {
        return <header>
            <nav>
            <button onClick={() => {navigate('/')}}>Home</button>
            <button onClick={() => {navigate('/user/balance')}}>Balance</button>
            <button onClick={() => {navigate('/survey/progress')}}>Survey Progress</button>
            <button onClick={() => {navigate('/survey/published')}}>Surveys Published</button>
            <button onClick={() => {navigate('/survey/search')}}>Search</button>
            <button onClick={() => {logout()}}>Log Out</button>
            </nav>
        </header>
    }

    return <header>
        <nav>
            <button onClick={() => {navigate('/')}}>Home</button>
            <button onClick={() => {navigate('/user/signup')}}>Sign Up</button>
            <button onClick={() => {navigate('/user/login')}}>Login</button>
            <button onClick={() => {navigate('/survey/search')}}>Search</button>
        </nav>
    </header>;
}

export default NavigationBar;