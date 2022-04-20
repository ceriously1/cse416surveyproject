///////// https://github.com/saintedlama/passport-local-mongoose#api-documentation
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
    // passport-local mongoose will deal with the username and password (adds username, hash, salt fields)
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0, min: 0},
    // !! these are the completed and incomplete answers !!
    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response'}],
    // surveys_responded includes not-completed surveys
    surveys_responded: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Survey'}],
    surveys_created: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Survey'}] // Self-created surveys
});

User.plugin(passportLocalMongoose);

// note that the 3rd argument is the specific db name
module.exports = mongoose.model('User', User, 'Users');