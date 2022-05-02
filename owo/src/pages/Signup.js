import {useRef} from 'react';
import { useNavigate } from 'react-router-dom';

import globalStyles from './global.module.css';

function SignUp() {
    const navigate = useNavigate();
    const usernameRef = useRef();
    const passwordRef = useRef();
    const emailRef = useRef();

    function SignUpHandler(event) {
        event.preventDefault();

        const signupData = {
            username: usernameRef.current.value,
            password: passwordRef.current.value,
            email: emailRef.current.value
        }

        fetch(`${process.env.REACT_APP_SERVER_ADDR}/user/signup`, 
            {
                method: 'Post', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(signupData)
            }
            ).then(res => {return res.json()})
            .then(response => {
                console.log(response);
                if (response.success) navigate('/user/login',{state:'/'});
                if (!response.success) alert(response.error);
            });
    }

    return (
    <div>
        <h1>Sign Up</h1>
        <form onSubmit={SignUpHandler}>
            <div className={globalStyles.center}>
            <div>
                <label htmlFor='username'>Username</label>
                <input type='text' required id='username' ref={usernameRef}></input>
            </div>
            <div>
                <label htmlFor='password'>Password</label>
                <input type='password' required id='password' ref={passwordRef}></input>
            </div>
            <div>
                <label htmlFor='email'>Email</label>
                <input type='text' required id='email' ref={emailRef}></input>
            </div>
            <div><button>Sign Up</button></div>
            </div>
        </form>
    </div>
    );
}

export default SignUp;