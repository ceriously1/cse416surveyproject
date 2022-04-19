const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    publisherName: { type: String, required: true},
    published: { type: Boolean, default: false},
    deactivated: { type: Boolean, default: false },
    surveyJSON: Object, // JSON object used to render survey
    surveyParams: {
        title: {type: String, required: true},
        description: {type: String, required: true},
        tags: [String],
        payout: {type: Number, required: true},
        reserved: {type: Number, required: true}
    },
    // !! these are the completed answers !!
    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }]
    //publish_date: {type: Date, required: true},
    //deactivation_date: Date,
}, {versionKey: false});

module.exports = mongoose.model('Survey', surveySchema, 'Surveys');
