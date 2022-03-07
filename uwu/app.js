const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://firstuser:ajQDfI4Cz3sNN4G6@cluster0.9neui.mongodb.net/CSE416?retryWrites=true&w=majority');
const User = require('./models/user.js');

const router = express.Router();
router.post('/signup', (req, res, next) => {
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

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'Options') {
        res.header('Access-Control-Allow-Methods', 'Get, Post, Delete, Put');
        return res.status(200).json({});
    }
    next();
});
app.use('/', router);


app.use((req, res, next) => {
    const error = new Error('404');
    next(error);
})
app.use((error, req, res, next) => {
    res.json({error: error.message});
})

module.exports = app;