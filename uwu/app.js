const express = require('express');
const app = express();
const morgan = require('morgan'); // terminal analytics
const bodyParser = require('body-parser'); // parses requests
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const MongoStore = require('connect-mongo');

// requiring routes
const userRoutes = require('./api/routes/users.js');

// connecting to cloud db
// ajQDfI4Cz3sNN4G6 is the hard-coded password to connect to the db
mongoose.connect('mongodb+srv://firstuser:ajQDfI4Cz3sNN4G6@cluster0.9neui.mongodb.net/CSE416?retryWrites=true&w=majority');

// https://dilshankelsen.com/user-authentication-with-passport-express/
// using authentification middleware
// add secure: true if https : https://stackoverflow.com/questions/56524264/how-to-store-jwt-in-cookie-and-pass-it-to-authentication-function-when-redirecti
// I didn't realize secure: true prevented the cookie from being sent to normal http...
// cost me so many hours :/
// mongostore to save cookies across server resets: https://stackoverflow.com/questions/67309712/class-constructor-mongostore-cannot-be-invoked-without-new-express-nodejsbac
app.use(session({
    name: 'session-id',
    secret: '123-456-789',
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 1800000, sameSite: 'none' },
    store: MongoStore.create({ mongoUrl: 'mongodb+srv://firstuser:ajQDfI4Cz3sNN4G6@cluster0.9neui.mongodb.net/CSE416?retryWrites=true&w=majority' })
}));
app.use(passport.initialize());
app.use(passport.session());

// configuring Passport/Passport-Local module
const User = require('./api/models/user.js');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// using misc. middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// gives client access (cors "cross-origin-resource-sharing")
// https://stackoverflow.com/questions/46288437/set-cookies-for-cross-origin-requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'Options') {
        res.header('Access-Control-Allow-Methods', 'Get, Post, Delete, Put');
        return res.status(200).json({});
    }
    next();
});

// using backend routing
app.use('/user', userRoutes);

// handling errors
app.use((req, res, next) => {
    const err = new Error('404');
    next(err);
})
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({error: err.message});
})

module.exports = app;