import {useRef} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    const state = useLocation().state;
    const userLoginRef = useRef();
    const passwordRef = useRef();

    function LoginHandler(event) {
        event.preventDefault();

        const loginData = {
            username: userLoginRef.current.value,
            password: passwordRef.current.value
        }

        fetch('http://localhost:4000/user/login', 
            {
                method: 'Post', 
                headers: {'Content-Type': 'application/json'},
                withCredentials: true,
                credentials: 'include',
                body: JSON.stringify(loginData)
            }
            ).then(res => {
                if (res.status === 401) alert('Login failed. Check username or password.');
                return res.json()
            })
            .then(response => {
                console.log(response);
                if (response.success) {
                    // https://stackoverflow.com/questions/70622541/how-can-i-use-previous-location-to-redirect-user-in-react-router-v6
                    navigate((state === null) ? '/' : state);
                }
            });
    }

    return (
    <div>
        <h1>Login</h1>
        <form onSubmit={LoginHandler}>
            <div>
                <label htmlFor='userLogin'>User</label>
                <input type='text' required id='userLogin' ref={userLoginRef}></input>
            </div>
            <div>
                <label htmlFor='password'>Password</label>
                <input type='password' required id='password' ref={passwordRef}></input>
            </div>
            <div><button>Login</button></div>
        </form>
    </div>
    );
}

export default Login;