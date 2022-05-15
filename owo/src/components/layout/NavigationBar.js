import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import styles from './NavigationBar.module.css';

function NavigationBar() {
    const navigate = useNavigate();
    const [logged, setLogged] = useState(false);

    console.log(process.env.REACT_APP_SERVER_ADDR)
    function logout() {
        fetch(`${process.env.REACT_APP_SERVER_ADDR}/user/logout`, 
        {
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
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
        fetch(`${process.env.REACT_APP_SERVER_ADDR}/user/logged`, 
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
        return <header className={styles.header}>
            <nav className={styles.nav}>
            <button className={styles.button} onClick={() => {navigate('/')}}>Home</button>
            <button className={styles.button} onClick={() => {navigate('/user/balance')}}>Balance</button>
            <button className={styles.button} onClick={() => {navigate('/survey/progress')}}>Survey Progress</button>
            <button className={styles.button} onClick={() => {navigate('/survey/published')}}>Surveys Published</button>
            <button className={styles.button} onClick={() => {navigate('/survey/search')}}>Search</button>
            <button className={styles.button} onClick={() => {logout()}}>Log Out</button>
            </nav>
        </header>
    }

    return <header className={styles.header}>
        <nav>
            <button className={styles.button} onClick={() => {navigate('/')}}>Home</button>
            <button className={styles.button} onClick={() => {navigate('/user/signup')}}>Sign Up</button>
            <button className={styles.button} onClick={() => {navigate('/user/login')}}>Login</button>
            <button className={styles.button} onClick={() => {navigate('/survey/search')}}>Search</button>
        </nav>
    </header>;
}

export default NavigationBar;