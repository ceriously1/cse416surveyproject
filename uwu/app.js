// requiring middleware
const express = require('express');
const app = express();
const morgan = require('morgan'); // terminal analytics
const bodyParser = require('body-parser'); // parses requests
const mongoose = require('mongoose');

// requiring routes
const signupRoutes = require('./api/routes/signup');

// connecting to cloud db
mongoose.connect('mongodb+srv://firstuser:ajQDfI4Cz3sNN4G6@cluster0.9neui.mongodb.net/CSE416?retryWrites=true&w=majority');

// misc. middleware
app.use(morgan('dev'));
//app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// gives client access (cors "cross-origin-resource-sharing")
app.use((req, res, next) => {
    console.log("here");
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'Options') {
        res.header('Access-Control-Allow-Methods', 'Get, Post, Delete, Put');
        return res.status(200).json({});
    }
    next();
});

// using backend routing
app.use('/signup', signupRoutes);

// handling errors
app.use((req, res, next) => {
    const error = new Error('404');
    next(error);
})
app.use((error, req, res, next) => {
    res.json({error: error.message});
})

module.exports = app;