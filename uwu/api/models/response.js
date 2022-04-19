const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // include validation somehow on the server to prevent any user from bricking this
    surveyData: Object,   // you should be able to get question indices through the surveyJSON after populating survey
    complete: { type: Boolean, default: false} // complete when all required questions are answered
}, {versionKey: false});

module.exports = mongoose.model('Response', responseSchema, 'Responses');