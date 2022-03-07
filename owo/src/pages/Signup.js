import {useRef} from 'react';

function SignUp() {
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

        fetch('http://localhost:4000/signup', 
            {
                method: 'Post', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify(signupData)
            }).then(res => {return res.json()})
            .then(response => {
                console.log(response);
            });
    }

    return (
    <div>
        <h1>Sign Up Page</h1>
        <form onSubmit={SignUpHandler}>
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
        </form>
    </div>
    );
}

export default SignUp;