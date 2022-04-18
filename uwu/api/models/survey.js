const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    published: {Boolean, default: false},
    deactivated: {Boolean, default: false},
    surveyJSON: Object, // JSON object used to render survey
    surveyParams: {
        title: {type: String, required: true},
        description: {type: String, required: true},
        tags: [String],
        payout: {type: Number, required: true},
        reserved: {type: Number, required: true}
    },
    // remember to append answer_id to the following list when a surveyee 
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }]
    //publish_date: {type: Date, required: true},
    //deactivation_date: Date,
}, {versionKey: false});

module.exports = mongoose.model('Survey', surveySchema, 'Surveys');
