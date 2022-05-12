const mongoose = require("mongoose");
const app = require('./app.js');

let debug = true

//TODO My local url used for testing. Replace with actual server url in production
// const url = "mongodb://localhost:27017/?readPreference=primary&directConnection=true&ssl=false";

// connecting to cloud db
const url = 'mongodb+srv://firstuser:'+ process.env.MONGO_ATLAS_PW +'@cluster0.9neui.mongodb.net/CSE416?retryWrites=true&w=majority';

const port = process.env.PORT || 4000;

// terminates the server on kill or keyboard interrupt doesn't work
process.on("SIGINT", close);
process.on("SIGTERM", close);

mongoose.connect(url, () => {
    if (debug) console.log("Connected to Database");
    app.listen(port, () => {if (debug) console.log(`Listening on port ${port}`)});
});

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
