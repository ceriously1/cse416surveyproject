const Answer = require('../models/answer.js');
const User = require('../models/user.js');
const Survey = require('../models/survey.js');
const router = require('express').Router();
const mongoose = require('mongoose');
const { query } = require('express');

router.get('/builder/:survey_id', (req,res) => {
    if (typeof req.session.passport === 'undefined') res.status(401).json({message: 'Session expired. Log back in.'})
    User.findOne({username: req.session.passport.user})
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({message: 'User not found.'});
            if (req.params.survey_id === '0') {
                return res.status(201).json({message: 'Doing nothing because of default behavior on client side.'});
            } else {
                const survey_id = mongoose.Types.ObjectId(req.params.survey_id);
                if (user.surveys_created.includes(survey_id)) {
                    Survey.findById(survey_id).exec().then(survey => {
                        return res.status(201).json({
                            message: 'Survey found!',
                            surveyJSON: survey.surveyJSON,
                            surveyParams: survey.surveyParams
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
            if (!user) return res.status(404).json({message: 'User not found.'});
            // surveys will automatically be [] if there is no survey field
            // 2. If the survey_id parameter is 0, construct and save a new survey, add new survey_id to user
            if (req.params.survey_id === '0') {
                const survey = new Survey({
                    _id: new mongoose.Types.ObjectId(),
                    publisher: user._id,
                    published: false,
                    deactivated: false,
                    surveyJSON: req.body.surveyJSON,
                    surveyParams: req.body.surveyParams
                });
                survey.save().then(result => {
                    user.surveys_created.push(survey._id);
                    user.save().then(result2 => {
                        return res.status(201).json({message: 'New survey successfully created.'});
                    });
                });
            // 3. Else check if the survey was created by the user and update the survey
            } else {
                // you need to convert url parameter survey_id into mongoose objectid
                const survey_id = mongoose.Types.ObjectId(req.params.survey_id);
                if (user.surveys_created.includes(survey_id)) {
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

router.get('/list/:survey_status', (req, res) => {
    if (typeof req.session.passport === 'undefined') res.status(401).json({message: 'Session expired. Log back in.'});
    const surveyStatus = req.params.survey_status;
    // 'Query conditions and other options': https://mongoosejs.com/docs/populate.html
    let options = {
        path: '',
        match: {}
    };
    if (surveyStatus === 'active') {
        options.path = 'surveys_created';
        options.match = {published: {$eq: true}, deactivated: {$eq: false}};
    }
    else if (surveyStatus === 'inactive') {
        options.path = 'surveys_created';
        options.match = {published: {$eq: true}, deactivated: {$eq: true}};
    }
    else if (surveyStatus === 'building') {
        options.path = 'surveys_created';
        options.match = {published: {$eq: false}, deactivated: {$eq: false}};
    }
    else if (surveyStatus === 'in-progress') {
        options.path = 'answers';
        options.match = {complete: {$eq: false}};
        options.select = 'survey';
    }
    else if (surveyStatus === 'history') {
        options.path = 'answers';
        options.match = {complete: {$eq: true}};
        options.select = 'survey';
    }
    else {
        console.log(surveyStatus);
        return res.status(400).json({message: 'Invalid survey status.'});
    }
    User.findOne({username: req.session.passport.user})
        .select('_id')
        .populate(options)
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({message: 'User not found.'});
            if (surveyStatus === 'active' || surveyStatus === 'inactive' || surveyStatus === 'building') {
                res.status(201).json({
                    message: 'Surveys found.',
                    // should be an array of survey objects
                    surveys: user.surveys_created
                });
            }
            if (surveyStatus === 'in-progress' || surveyStatus === 'history') {
                // user.answers.populate()
            }
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// https://stackoverflow.com/questions/26814456/how-to-get-all-the-values-that-contains-part-of-a-string-using-mongoose-find
router.get('/search/:query?', (req, res) => {
    if (typeof req.params.query === 'undefined') {
        Survey.find({$and:[{'published':true}, {'deactivated':false}]})
        .sort({'_id': -1}).limit(20).exec().then(surveys => {
            return res.status(201).json({message: 'Surveys found.', surveys:surveys});
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    } else {
        // https://stackoverflow.com/questions/13272824/combine-two-or-queries-with-and-in-mongoose
        Survey.find({$and:[{$or:[{'surveyParams.title':{'$regex':req.params.query,'$options':'i'}}, {'surveyParams.description':{'$regex':req.params.query,'$options':'i'}}]}, {'published':true}, {'deactivated':false}]})
        .sort({'_id': -1}).limit(20).exec().then(surveys => {
                return res.status(201).json({message: 'Surveys found.', surveys:surveys});
            }).catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    }
});

router.post('/activate/:survey_id', (req, res) => {
    if (typeof req.session.passport === 'undefined') res.status(401).json({message: 'Session expired. Log back in.'})
    User.findOne({username: req.session.passport.user})
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({success: false, message: 'User not found.'});
            req.params.survey_id;
            Survey.findById(req.params.survey_id).exec().then(survey => {
                if (typeof survey === 'undefined') return res.status(404).json({success: false, message: 'Survey not found.'});
                const bool1 = req.body.toggle === 'activate' && survey.published === false && survey.deactivated === false;
                const bool2 = req.body.toggle === 'deactivate' && survey.published === true && survey.deactivated === false;
                if (!bool1 && !bool2) return res.status(400).json({success: false, message: 'Check method and survey state'});
                if (bool1) {
                    console.log(survey.published);
                    survey.published = true;
                    survey.deactivated = false;
                    survey.save().then(result => {
                        return res.status(201).json({success: true, message: 'Survey published/deactivated.'});
                    });
                }
                if (bool2) {
                    survey.published = true;
                    survey.deactivated = true;
                    survey.save().then(result => {
                        return res.status(201).json({success: true, message: 'Survey published.'});
                    });
                }
            });
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                success: false,
                error: err
            });
        });
});

module.exports = router;