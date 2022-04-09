const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true, unique: true },
    // we'll need to implement email verification later
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile_info: {pfp_path: String, stat1: Number, stat2: Number},
    completed_survey: [mongoose.Types.ObjectId],
    failed_survey: [mongoose.Types.ObjectId],
    in_progress_survey: [mongoose.Types.ObjectId]
}, {versionKey: false});

module.exports = mongoose.model('User', userSchema, 'Users');