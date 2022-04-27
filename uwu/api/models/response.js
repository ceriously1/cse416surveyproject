const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // include validation somehow on the server to prevent any user from bricking this
    surveyData: Object,   // you should be able to get question indices through the surveyJSON after populating survey
    complete: { type: Boolean, default: false}, // complete when all required questions are answered
    last_modified: { type: Date, required: true}    // use: new Date().toISOString() : https://stackoverflow.com/questions/7675549/how-do-i-update-a-property-with-the-current-date-in-a-mongoose-schema-on-every-s
}, {versionKey: false});

module.exports = mongoose.model('Response', responseSchema, 'Responses');