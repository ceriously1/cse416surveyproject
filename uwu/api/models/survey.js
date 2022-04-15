const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    description: {type: String, required: true},
    tags: [String],
    payout: {type: Number, required: true},
    publish_date: {type: Date, required: true},
    deactivation_date: Date,
}, {versionKey: false});

module.exports = mongoose.model('Survey', surveySchema, 'Surveys');
