const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    publisher: {type: String, required: true},
    title: {type: String, required: true},
    description: {type: String},
    tags: [String],
    payout: {type: Number, default: 0},
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }]
    //publish_date: {type: Date, required: true},
    //deactivation_date: Date,
}, {versionKey: false});

module.exports = mongoose.model('Survey', surveySchema, 'Surveys');
