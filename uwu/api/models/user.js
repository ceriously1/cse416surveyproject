const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Username: { type: String, required: true },
    email: { type: String, required: true },
    Password: { type: String, required: true },
    Profile_info: {pfp_path: String, stat1: Number, stat2: Number},
    Completed_survey: [mongoose.Types.ObjectId],
    Failed_survey: [mongoose.Types.ObjectId],
    Inprogress_survey: [mongoose.Types.ObjectId]
}, {versionKey: false});

module.exports = mongoose.model('User', userSchema, 'Users');