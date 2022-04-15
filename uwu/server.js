const mongoose = require("mongoose");
const app = require('./app.js');

let debug = true

//TODO My local url used for testing. Replace with actual server url in production
const url = "mongodb://localhost:27017/?readPreference=primary&directConnection=true&ssl=false";

// connecting to cloud db
// ajQDfI4Cz3sNN4G6 is the hard-coded password to connect to the db
//const url = 'mongodb+srv://firstuser:ajQDfI4Cz3sNN4G6@cluster0.9neui.mongodb.net/CSE416?retryWrites=true&w=majority';

const port = process.env.PORT || 4000;

// terminates the server on kill or keyboard interrupt
process.on("SIGINT", close)
process.on("SIGTERM", close)

try {
    await mongoose.connect(url);
    if (debug) console.log("Connected to Database");
    app.listen(port, () => {if (debug) console.log(`Listening on port ${port}`)});
} catch (err) {
    console.log(err);
}

app.get("/", (req, res) => {
    //TODO Take to homepage
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
