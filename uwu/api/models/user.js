///////// https://github.com/saintedlama/passport-local-mongoose#api-documentation
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
    // passport-local mongoose will deal with the username and password (adds username, hash, salt fields)
    username: { type: String, required: true, unique: true },
    email : { type: String, required: true, unique: true }
});

User.plugin(passportLocalMongoose);

// note that the 3rd argument is the specific db name
module.exports = mongoose.model('User', User, 'Users');



///////////// youtube tutorial implemention
// const mongoose = require('mongoose');

// const userSchema = mongoose.Schema({
//     _id: mongoose.Schema.Types.ObjectId,
//     username: { type: String, required: true, unique: true },
//     // we'll need to implement email verification later
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     balance: { type: Number, required: true},
//     profile_info: {pfp_path: String, stat1: Number, stat2: Number},
//     completed_survey: [mongoose.Types.ObjectId],
//     failed_survey: [mongoose.Types.ObjectId],
//     in_progress_survey: [mongoose.Types.ObjectId]
// }, {versionKey: false});

// module.exports = mongoose.model('User', userSchema, 'Users');