const passport = require('passport');
const User = require('../models/user.js');
const router = require('express').Router();
const mongoose = require('mongoose');
const Transaction = require('../models/transactions.js');
const algosdk = require('algosdk');
const algodClient = require('../modules/algodclient.js');

// https://github.com/saintedlama/passport-local-mongoose#api-documentation
// Academind tutorial for the User.find(), 400 responses

router.post('/signup', (req, res) => {
    User.register(new User({
        _id: new mongoose.Types.ObjectId(),
        username: req.body.username, 
        email: req.body.email
    }), req.body.password, (err) => {
        if (err) {
            console.log(`Error while registering ${req.body.username}:\n`, err.message);
            return res.status(500).json({
                message: `Error registering ${req.body.username}`,
                error: err.message
            });
        }
        console.log(`${req.body.username} registered.`);
        res.status(200).json({
            success: true,
            message: `${req.body.username} registered.`
        });
    });
});

// https://www.passportjs.org/concepts/authentication/login/
// when we passed User.authenticate() into new LocalStrategy in app.js,
// we gave it a function which checks req.body.username and req.body.password
// this is what's used when we call the passport.authenticate('local') middleware function
// important!!!: everytime you restart the server, the server forgets about existing cookies
// so you need to login everytime.
// you can access the user with req.session.passport.user without adding any middleware to routes, undefined otherwise
// good explanation: http://toon.io/understanding-passportjs-authentication-flow/
router.post('/login', passport.authenticate('local'), (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Authentification successful'
    });
});

router.post('/logout', (req, res) => {
    req.logout();
    return res.status(200).json({success: true, message: 'Logged out.'});
});

router.get('/logged', (req, res) => {
    let logged = false;
    if (req.user) logged = true;
    res.status(200).json({success: true, logged:logged});
});

// handling GET request from /user/balance (displays balance, transaction history)
// Note: you may get something like "websocket closed due to suspension", this is if you send a 304 I think
router.get("/balance", (req, res, next) => {
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false});
        User.findOne({username: req.session.passport.user})
        .select('_id balance algo_address transactions')
        .populate({
            path:'transactions',
            options: {
                limit: 15,
                sort: { time: -1},
            }})
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({success: false, message: 'User not found.'});
            res.status(200).json({
                success: true,
                message: "Balance and transaction history found.",
                balance: user.balance,
                algo_address: user.algo_address,
                transactions: user.transactions
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: err
            });
        });
});

router.post('/deposit', (req, res) => {
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false});

});

async function withdrawAlgos(address, amount, db_txn_id) {
    //////////// Attempt to transact on testnet
    // most of code from: https://developer.algorand.org/docs/sdks/javascript/
    // addr is the server algo address, sk is the corresponding secret key
    const {addr, sk} = algosdk.mnemonicToSecretKey(process.env.ALGO_SERVER_MNEM);
    let accountInfo = await algodClient.accountInformation(addr).do();
    console.log("Server account balance: %d microAlgos", accountInfo.amount);
    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;
    const receiver = address;
    const enc = new TextEncoder();
    const note = enc.encode(`Withdrawal from SurveU. Transaction Id: ${db_txn_id}.`);
    let sender = addr;
    let txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: sender, 
        to: receiver, 
        amount: amount-algosdk.ALGORAND_MIN_TX_FEE, 
        note: note, 
        suggestedParams: params
    });
    let signedTxn = txn.signTxn(sk);
    let txId = txn.txID().toString();
    console.log("Signed transaction with txID: %s", txId);
    await algodClient.sendRawTransaction(signedTxn).do();
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
    let string = new TextDecoder().decode(confirmedTxn.txn.txn.note);
    console.log("Note field: ", string);
    accountInfo = await algodClient.accountInformation(addr).do();
    console.log("Transaction Amount: %d microAlgos", confirmedTxn.txn.txn.amt);        
    console.log("Transaction Fee: %d microAlgos", confirmedTxn.txn.txn.fee);
    console.log("Account balance: %d microAlgos", accountInfo.amount);
    //////////////
}

async function transact_withdraw(user_id, username, address, amount) {
    let transacted = false;
    let no_balance = false;
    const transaction_id = new mongoose.Types.ObjectId();
    await Transaction.create([{
        _id: transaction_id,
        type: 'withdraw',
        from: user_id,
        to: user_id,
        from_name: username,
        to_name: username,
        amount: amount,
        time: new Date().toISOString(),
        success: false
    }]);
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const user = await User.findById(user_id).session(session);
        user.algo_address = address;
        user.balance -= amount;
        if (user.balance < 0) no_balance = true;
        user.transactions.push(transaction_id);
        await user.save();
        const transaction = await Transaction.findById(transaction_id).session(session);
        transaction.success = true;
        await transaction.save();
        await withdrawAlgos(address, amount, transaction_id);
        // if the following statement somehow fails without everything before it failing, there may be an infinite money glitch
        await session.commitTransaction();
        transacted = true;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
        return [transacted, no_balance];
    }
}

router.post('/withdraw', (req, res) => {
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false});
    User.findOne({username: req.session.passport.user})
        .select('_id balance')
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({success: false, message: 'User not found.'});
            let amount = parseInt(req.body.amount);
            if (Number.isNaN(amount) || amount < 1) return res.status(401).json({success: false, message: 'Invalid amount.'});
            amount += algosdk.ALGORAND_MIN_TX_FEE;
            if (amount > user.balance) return res.status(401).json({success: false, message: 'Insufficient balance.'});
            res.status(200).json({success: true, message: 'Transaction is being executed.'});
            transact_withdraw(user._id, req.session.passport.user, req.body.address, amount).then(results => {
                // const [transacted, no_balance] = results;
                // if (transacted) return res.status(200).json({success: true, message: 'Withdrawal successful.'});
                // return res.status(500).json({success: false, message: 'Withdrawal failed. Ensure your Algorand address has at least 0.1 Algos.', no_balance: no_balance});
                return;
            });
        }).catch(err => {
            console.log(err);
            return res.status(500).json({success: false, message: err});
        });
});

module.exports = router;