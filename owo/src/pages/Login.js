import {useRef} from 'react';

function Login() {
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
                return res.json()
            })
            .then(response => {
                console.log(response);
            });
    }

    return (
    <div>
        <h1>Login Page</h1>
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