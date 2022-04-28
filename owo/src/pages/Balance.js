// see "getting started with fetching data" on the react tutorial

import { useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import TransactionTable from '../components/transactiontable/TransactionTable.js';

function Balance() {
    const navigate = useNavigate();
    // sets isLoading to "true"
    const [isLoading, setIsLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);

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
            })
    }, [navigate]);

    if (isLoading) {
        return (
            <div>Balance Page Loading</div>
        );
    }

    return (
        <section>
            <h1>Balance</h1>
            <p>Balance: {balance}</p>
            <TransactionTable transactions={transactions}/>
        </section>
    );
}

export default Balance;