const mongoose = require("mongoose");
const users = require("./api/routes/users.js")
const express = require("express")
const app = express()

let debug = true

//TODO My local url used for testing. Replace with actual server url in production
const url = "mongodb://localhost:27017/?readPreference=primary&directConnection=true&ssl=false";
const port = process.env.PORT || 4000;

try {
    await mongoose.connect(url);
    if (debug) console.log("Connected to Database");
    app.listen(port, () => {if (debug) console.log(`Listening on port ${port}`)});
} catch (err) {
    console.log(err);
}

app.use("/url/of/user/page", users);

app.get("/", (req, res) => {
    //TODO Take to homepage
});

//TODO used for when terminating the server
function close() {
    mongoose.disconnect(() => {
        if (debug) console.log("Database Closed");
    });
    app.close(() => {
        if (debug) console.log("Database Closed");
    });
}
