const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Models
const User = require('../models/user.js');

// Handling POST requests from frontend
router.post('/', (req, res, next) => {
    User.findOne({$or: [{Username: req.body.username}, {email: req.body.email}]}).then(result => {
        console.log(req.body);
        if (result === null) {
            // create db version of user
            const user = new User({
                _id: new mongoose.Types.ObjectId,
                Username: req.body.username,
                email: req.body.email,
                Password: req.body.password,
                Profile_info: {pfp_path: null, stat1: 0, stat2: 0},
                Completed_survey: [],
                Failed_survey: [],
                Inprogress_survey: []
            });
            // save user into data base
            user.save().then(console.log(`${req.body.username} registered.`)).catch(err => console.log(err));
            res.status(200).json({msg: `${req.body.username} registered.`});
        }
        else {
            // see log
            console.log('Username or email already exists');
            res.status(200).json({msg: 'Username or email already exists'});
        }
    }).catch(err => console.log(err));
});

module.exports = router;