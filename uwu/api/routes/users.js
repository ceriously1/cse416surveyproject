const passport = require('passport');
const User = require('../models/user.js');
const router = require('express').Router();
const mongoose = require('mongoose');

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

// handling GET request from /user/balance (displays balance, transaction history)
// Note: you may get something like "websocket closed due to suspension", this is if you send a 304 I think
router.get("/balance", (req, res, next) => {
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false});
        User.find({username: req.session.passport.user}).exec().then(user => {
            if (user.length < 1) {
                return res.status(404).json({
                    success: false,
                    message: 'User no longer exists.'
                });
            }
            // TO-DO get transaction history (I would get the id (user[0]._id) and query the db for all transactions with the id sorted by date)

            //////
            res.status(200).json({
                success: true,
                message: "Balance found.",
                balance: user[0].balance
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                error: err
            });
        });
})

module.exports = router;