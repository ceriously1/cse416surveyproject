const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answers: [String],   // you should be able to get question indices through the surveyJSON after populating survey
    complete: {Boolean, default: false} // complete when all required questions are answered
}, {versionKey: false});

module.exports = mongoose.model('Answer', answerSchema, 'Answers');