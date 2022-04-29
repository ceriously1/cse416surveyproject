// see "getting started with fetching data" on the react tutorial

import { useState, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import TransactionTable from '../components/transactiontable/TransactionTable.js';

function Balance() {
    const navigate = useNavigate();
    // sets isLoading to "true"
    const [isLoading, setIsLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [depositing, setDepositing] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);
    const [withdrawAddress, setWithdrawAddress] = useState(null);
    // depositRef and witdrawRef refer to the amounts
    const depositRef = useRef();
    const withdrawRef = useRef();
    const withdrawAddressRef = useRef();
    const [depositURI, setDepositURI] = useState(null);
    const [toggle, setToggle] = useState(false);


    // useEffect conditionally calls fetch so that it isn't called everytime a state is updated
    // the empty array at the end means that fetch will only be called when this page is first rendered
    // for other use cases, we can include "external variables" in the array to call useEffefct's function everytime the variables change
    // Gets balance and transaction history
    useEffect(() => {
        fetch('http://localhost:4000/user/balance',
            {
                method: 'Get',
                credentials: 'include'
            }
            ).then(response => {
                // .json() is a promise function, and promise functions need .then() to get their results
                return response.json();
            // data is response.json()
            }).then(data => {
                if (data.message === 'Please log in.') {
                    navigate('/user/login',{state:`/user/balance`});
                    alert(data.message);
                    return;
                }
                console.log(data);
                setIsLoading(false);
                setBalance(data.balance);
                setTransactions(data.transactions);
                setWithdrawAddress(data.algo_address);
            })
    }, [navigate, toggle]);

    // returns the jsx element allowing users to select how much they want to deposit
    function depositElement() {
        return <div>
            <label htmlFor='deposit'>Amount</label>
            <input type='number' required id='deposit' ref={depositRef}></input>
            <button onClick={() => {deposit()}}>Submit</button>
            <button onClick={() => {setDepositing(false)}}>Cancel</button>
        </div>
    }

    function deposit() {
        const amount = depositRef.current.value;
        fetch(`http://localhost:4000/user/deposit`, 
        {
            method: 'Post',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({amount: amount})
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
            alert(response.message);
            if (response.message === 'Please log in.') {
                navigate('/user/login',{state:`/user/balance`});
                return;
            }
            if (response.success) {
                setDepositURI(response.URI);
                setDepositing(false);
            }
        });
    }

    function withdrawElement() {
        return <div>
            <div><b>1000 mAlgo fee added to entered amount.</b></div>
            <div><b>Minimum amount is 1 mAlgo.</b></div>
            <div>
                <label htmlFor='withdraw'>Amount</label>
                <input type='number' required id='withdraw' ref={withdrawRef}></input>
            </div>
            <div>
                <label htmlFor='withdrawAddress'>Address</label>
                <input type='text' required id='withdrawAddress' defaultValue={withdrawAddress} ref={withdrawAddressRef}></input>
            </div>
            <div>
                <button onClick={() => {withdraw()}}>Submit</button>
                <button onClick={() => {setWithdrawing(false)}}>Cancel</button>
            </div>
        </div>
    }

    function withdraw() {
        const amount = withdrawRef.current.value;
        const address = withdrawAddressRef.current.value;
        fetch(`http://localhost:4000/user/withdraw`, 
        {
            method: 'Post',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({amount: amount, address: address})
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
            alert(response.message);
            if (response.message === 'Please log in.') {
                navigate('/user/login',{state:`/user/balance`});
                return;
            }
            if (response.success) {
                setWithdrawing(false);
            }
        });
    }

    if (isLoading) {
        return (
            <div>Balance Page Loading</div>
        );
    }

    return (
        <section>
            <h1>Balance</h1>
            <p>Balance: {balance}</p>
            <div><button onClick={() => {setDepositing(true)}}>Deposit</button></div>
            <div>{depositing? depositElement() : null}</div>
            <div><button onClick={() => {setWithdrawing(true)}}>Withdraw</button></div>
            <div>{withdrawing? withdrawElement() : null}</div>
            <TransactionTable transactions={transactions}/>
        </section>
    );
}

export default Balance;