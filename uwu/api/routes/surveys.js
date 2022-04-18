const Answer = require('../models/answer.js');
const User = require('../models/user.js');
const Survey = require('../models/survey.js');
const router = require('express').Router();
const mongoose = require('mongoose');

router.get('/builder/:survey_id', (req,res) => {
    
});

router.post('/builder/:survey_id', (req,res) => {
    // incoming req has credentials, body: {surveyJSON, surveyParams}
    if (typeof req.body.surveyJSON.pages === 'undefined') {
        return res.status(400).json({message: 'No pages in survey.'});
    }
    // 1. Find the user_id
    if (typeof req.session.passport === 'undefined') res.status(401).json({message: 'Session expired. Log back in.'})
    User.findOne({username: req.session.passport.user})
        .exec()
        .then(user => {
            if (!user) res.status(404).json({message: 'User not found.'});
            // surveys will automatically be [] if there is no survey field
            // 2. If the survey_id parameter is 0, construct and save a new survey, add new survey_id to user
            if (req.params.survey_id === '0') {
                const survey = new Survey({
                    _id: new mongoose.Types.ObjectId(),
                    publisher: user._id,
                    surveyJSON: req.body.surveyJSON,
                    surveyParams: req.body.surveyParams
                });
                survey.save().then(result => {
                    user.surveys.push(survey._id);
                    user.save().then(result2 => {
                        return res.status(201).json({message: 'New survey successfully created.'});
                    });
                });
            // 3. Else check if the survey was created by the user and update the survey
            } else {
                // you need to convert url parameter survey_id into mongoose objectid
                const survey_id = mongoose.Types.ObjectId(req.params.survey_id);
                if (user.surveys.includes(survey_id)) {
                    Survey.findById(survey_id).exec().then(survey => {
                        survey.surveyJSON = req.body.surveyJSON;
                        survey.surveyParams =req.body.surveyParams;
                        survey.save().then(result => {
                            return res.status(201).json({message: 'Survey updated.'});
                        });
                    });
                } else {
                    return res.status(401).json({message: 'User cannot access survey.'});
                }
            }
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


router.get('/progress', (req,res) => {
    Answer.find({user: req.session.passport.user})
        .select('_id') // selecting nothing from answers besides id
        .populate('survey', '_id title description tags payout')  // I believe that populate replaces each 'survey: id' in each answer with 'survey: {..}'
        .exec()
        .then(answers => {
            if (answers.length < 1) {
                return res.status(404).json({
                    message: 'User has not answered any surveys.'
                });
            }
            // an answer in answers will have the form {_id, survey: {_id, title, description, tags, payout}}
            const bottom_slice = (req.pageIndex*req.pageLength > 0) ? req.pageIndex*req.pageLength : 0;
            const top_slice = ((req.pageIndex+1)*req.pageLength < answers.length) ? (req.pageIndex+1)*req.pageLength : answers.length;
            const surveys = answers.map(answer => answer.survey)
                .sort((a, b) => {a.title < b.title})
                .slice(bottom_slice, top_slice);
            res.status(200).json({
                message: 'Survey query successful',
                numSurveys: answers.length,
                page: surveys
            });
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router;