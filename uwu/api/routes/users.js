const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

// Model
const User = require('../models/user.js');

// Handling POST requests from /login/signup
router.post("/signup", (req, res, next) => {
    // check if email or username is taken
    User.find({$or: [{email: req.body.email}, {username: req.body.username}]}).exec().then(user => {
        if (user.length >= 1) {
            if (user[0].email == req.body.email) {
                return res.status(409).json({
                    message: "Email already exists"
                });
            }
            if (user[0].username == req.body.username) {
                return res.status(409).json({
                    message: "Username already exists"
                });
            }
        } else {
            // hash password
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) {
                    return res.status(500).json({
                        error: err
                    });
                } else {
                    // create user
                    const user = new User({
                        _id: new mongoose.Types.ObjectId,
                        username: req.body.username,
                        email: req.body.email,
                        password: hash,
                        profile_info: {pfp_path: null, stat1: 0, stat2: 0},
                        completed_survey: [],
                        failed_survey: [],
                        in_progress_survey: []
                    });
                    // save user
                    user.save().then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: "User created"
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error:err
                        });
                    });
                }
            })
        }
    })
});

// handling post requests to /user/login
router.post('/login', (req, res, next) => {
    // check if user exists
    console.log(req.body);
    User.find({$or: [{username: req.body.userLogin}, {email: req.body.userLogin}]}).exec().then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: 'Authentification failed.'
            });
        }
        // check if password from client matches the retrieved user's password
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    message: 'Authentification failed.'
                });
            }
            if (result) {
                // converts data into a token the client will use
                const token = jwt.sign(
                    {
                        email: user[0].email,
                        username: user[0].username
                    },
                    "super_secret_omega_key", 
                    {
                        expiresIn: "1h"
                    }  
                );
                return res.status(200).json({
                    message: "Authentification successful",
                    token: token
                });
            }
            res.status(401).json({
                message: "Authentification failed"
            });
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
})

module.exports = router;