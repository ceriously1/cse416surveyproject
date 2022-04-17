const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    survey: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
    user: { type: String, required: true, unique: true },
    //questions: [String],
    answers: [String]   // you should be able to get questions by populating the survey field
}, {versionKey: false});

module.exports = mongoose.model('Answer', answerSchema, 'Answers');