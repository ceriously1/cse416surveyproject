const mongoose = require("mongoose");
const app = require('./app.js');
//const express = require('express');
//const app = express();

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require("path");
const key = fs.readFileSync('./cert/localhost.decrypted.key');
const cert = fs.readFileSync('./cert/localhost.crt');

let debug = true


// connecting to cloud db
const url = 'mongodb+srv://firstuser:'+ process.env.MONGO_ATLAS_PW +'@cluster0.9neui.mongodb.net/CSE416?retryWrites=true&w=majority';

const port = process.env.PORT || 4000;
const portHTTP = 4001

// terminates the server on kill or keyboard interrupt doesn't work
process.on("SIGINT", close);
process.on("SIGTERM", close);

mongoose.connect(url, () => {
    if (debug) console.log("Connected to Database");

    const server = https.createServer({ key, cert }, app);
    const serverHTTP = http.createServer(app);
    //app.listen(port);
    server.listen(port, () => {if (debug) console.log(`Listening on port ${port}`)});
    serverHTTP.listen(portHTTP, () => {if (debug) console.log(`Listening on port ${portHTTP}`)})
});

// TODO not working correctly
function close() {
    mongoose.disconnect(() => {
        if (debug) console.log("Database Closed");
    });
    app.close(() => {
        if (debug) console.log("Database Closed");
    });
}
