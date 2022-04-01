const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Username: String,
    email: String,
    Password: String,
    Profile_info: {pfp_path: String, stat1: Number, stat2: Number},
    Completed_survey: [mongoose.Types.ObjectId],
    Failed_survey: [mongoose.Types.ObjectId],
    Inprogress_survey: [mongoose.Types.ObjectId]
}, {versionKey: false});

module.exports = mongoose.model('User', userSchema, 'Users');