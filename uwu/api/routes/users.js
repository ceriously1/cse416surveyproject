const passport = require('passport');
const User = require('../models/user.js');
const router = require('express').Router();

// https://github.com/saintedlama/passport-local-mongoose#api-documentation
// Academind tutorial for the User.find(), 400 responses

router.post('/signup', (req, res) => {
    User.register(new User({
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
            sucess: true,
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
    res.status(200).json({
        success: true,
        message: 'Authentification successful'
    });
});

// handling GET request from /user/balance (displays balance, transaction history)
// Note: you may get something like "websocket closed due to suspension", this is if you send a 304 I think
router.get("/balance", (req, res, next) => {
    console.log(req.session.passport.user);
    if (req.session.passport.user) {
        User.find({username: req.session.passport.user}).exec().then(user => {
            if (user.length < 1) {
                return res.status(404).json({
                    message: 'User no longer exists.'
                });
            }
            // TO-DO get transaction history (I would get the id (user[0]._id) and query the db for all transactions with the id sorted by date)

            //////
            res.status(200).json({
                message: "Balance found.",
                balance: user[0].balance
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    } else {
        console.log("Invalid cookie. Dev: try logging in again if server restarted");
        res.status(401).json({
            message: "Invalid access."
        });
    }
})

module.exports = router;


//////// Youtube tutorial implementation
// Heavily based on code from the login part of the readme backend tutorial

// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken')
// const checkAuth = require('../middleware/check-auth.js')

// // Model
// const User = require('../models/user.js');

// // Handling POST requests from /login/signup
// router.post("/signup", (req, res, next) => {
//     // check if email or username is taken
//     User.find({$or: [{email: req.body.email}, {username: req.body.username}]}).exec().then(user => {
//         if (user.length >= 1) {
//             if (user[0].email == req.body.email) {
//                 return res.status(409).json({
//                     message: "Email already exists"
//                 });
//             }
//             if (user[0].username == req.body.username) {
//                 return res.status(409).json({
//                     message: "Username already exists"
//                 });
//             }
//         } else {
//             // hash password
//             bcrypt.hash(req.body.password, 10, (err, hash) => {
//                 if(err) {
//                     return res.status(500).json({
//                         error: err
//                     });
//                 } else {
//                     // create user
//                     const user = new User({
//                         _id: new mongoose.Types.ObjectId,
//                         username: req.body.username,
//                         email: req.body.email,
//                         password: hash,
//                         balance: 0,
//                         profile_info: {pfp_path: null, stat1: 0, stat2: 0},
//                         completed_survey: [],
//                         failed_survey: [],
//                         in_progress_survey: []
//                     });
//                     // save user
//                     user.save().then(result => {
//                         console.log(result);
//                         res.status(201).json({
//                             message: "User created"
//                         });
//                     })
//                     .catch(err => {
//                         console.log(err);
//                         res.status(500).json({
//                             error:err
//                         });
//                     });
//                 }
//             })
//         }
//     })
// });

// // handling post requests to /user/login
// router.post('/login', (req, res, next) => {
//     // check if user exists
//     console.log(req.body);
//     User.find({$or: [{username: req.body.userLogin}, {email: req.body.userLogin}]}).exec().then(user => {
//         if (user.length < 1) {
//             return res.status(401).json({
//                 message: 'Authentification failed.'
//             });
//         }
//         // check if password from client matches the retrieved user's password
//         bcrypt.compare(req.body.password, user[0].password, (err, result) => {
//             if (err) {
//                 return res.status(401).json({
//                     message: 'Authentification failed.'
//                 });
//             }
//             if (result) {
//                 // converts data into a token the client will use
//                 const token = jwt.sign(
//                     {
//                         email: user[0].email,
//                         username: user[0].username
//                     },
//                     "super_secret_omega_key", 
//                     {
//                         expiresIn: "1h"
//                     }  
//                 );
//                 return res.status(200).json({
//                     message: "Authentification successful",
//                     token: token
//                 });
//             }
//             // "return" is not necessary here because it is the final res.function
//             res.status(401).json({
//                 message: "Authentification failed"
//             });
//         })
//     }).catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     })
// })

// // handling GET request from /user/balance (displays balance, transaction history)
// router.get("/balance", checkAuth, (req, res, next) => {
//     User.find({email: req.userData.email}).exec().then(user => {
//         if (user.length < 1) {
//             return res.status(401).json({
//                 message: 'User no longer exists.'
//             });
//         }
//         // TO-DO get transaction history (I would get the id (user[0]._id) and query the db for all transactions with the id sorted by date)

//         //////
//         res.status(200).json({
//             message: "Balance found.",
//             balance: user[0].balance
//         })
//     }).catch(err => {
//         console.log(err);
//         res.status(500).json({
//             error: err
//         });
//     })
// })

// module.exports = router;