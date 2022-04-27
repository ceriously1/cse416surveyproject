const Response = require('../models/response.js');
const User = require('../models/user.js');
const Survey = require('../models/survey.js');
const router = require('express').Router();
const mongoose = require('mongoose');
const surveyjs = require('survey-react-ui');
const _ = require('lodash');
const user = require('../models/user.js');

// getting survey build information to pass to builder page
router.get('/builder/:survey_id', (req,res) => {
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false})
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

// Updating the build of the survey or creating a new one if necessary
router.post('/builder/:survey_id', (req,res) => {
    // incoming req has credentials, body: {surveyJSON, surveyParams}
    if (typeof req.body.surveyJSON.pages === 'undefined') {
        return res.status(400).json({message: 'No pages in survey.', survey_id:req.params.survey_id});
    }
    // 1. Find the user_id
    if (!req.user) return res.status(401).json({success: false, message: 'Please log in.', survey_id:req.params.survey_id})
    const username = req.session.passport.user;
    User.findOne({username: username})
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({message: 'User not found.'});
            // surveys will automatically be [] if there is no survey field
            // 2. If the survey_id parameter is 0, construct and save a new survey, add new survey_id to user
            if (req.params.survey_id === '0') {
                const survey = new Survey({
                    _id: new mongoose.Types.ObjectId(),
                    publisher: user._id,
                    publisherName: username,
                    published: false,
                    deactivated: false,
                    surveyJSON: req.body.surveyJSON,
                    surveyParams: req.body.surveyParams,
                    last_modified: new Date().toISOString()
                });
                // consider moving save() to a m_session
                survey.save().then(() => {
                    user.surveys_created.push(survey._id);
                    user.save().then(() => {
                        return res.status(201).json({message: 'New survey successfully created.', survey_id: survey._id});
                    });
                });
            // 3. Else check if the survey was created by the user and update the survey
            } else {
                // do you need to convert url parameter survey_id into mongoose objectid?
                const survey_id = mongoose.Types.ObjectId(req.params.survey_id);
                if (user.surveys_created.includes(survey_id)) {
                    Survey.findById(survey_id).exec().then(survey => {
                        if (survey.published === false && survey.deactivated === false) {
                            survey.last_modified = new Date().toISOString();
                            survey.surveyJSON = req.body.surveyJSON;
                            survey.surveyParams =req.body.surveyParams;
                            // no need to move save() to a m_session
                            survey.save().then(result => {
                                return res.status(201).json({message: 'Survey updated.', survey_id:req.params.survey_id});
                            });
                        }
                        else {
                            return res.status.apply(401).json({message: 'Can only edit survey being built.', survey_id:req.params.survey_id});
                        }
                    });
                } else {
                    return res.status(401).json({message: 'User cannot access survey.', survey_id:req.params.survey_id});
                }
            }
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// note that the route is called published, but this route includes the list for surveys being built
// this is supposed to delete the survey with the given id
router.post('/published/delete/:survey_id', (req, res) => {
    if (!req.user) return res.status(401).json({success: false, message: 'Please log in.'});
    const username = req.session.passport.user;
    User.findOne({username: username})
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({success: false, message: 'User not found.'});
            const index = user.surveys_created.indexOf(req.params.survey_id);
            if (index > -1) {
                Survey.findById(req.params.survey_id)
                    .select('published deactivated')
                    .exec()
                    .then(survey => {
                        if (!survey) return res.status(404).json({success: false, message: 'Survey not found.'});
                        if (survey.published === false && survey.deactivated === false) {
                            // consider moving to m_session
                            Survey.findByIdAndDelete(survey._id)
                                .exec().then(() => {
                                    // removing survey from user's created (not necessarily published) list
                                    // note that there is no need to delete responses because we can only delete surveys being built
                                    user.surveys_created.splice(index, 1);
                                    user.save().then(() => {
                                        return res.status(201).json({success: true, message: 'Survey deleted.'});
                                    });
                                });
                        } else {
                            return res.status(401).json({success: false, message: 'Can only delete survey being built.'});
                        }
                    });
            } else {
                return res.status(401).json({success: false, message: 'Not allowed to delete the survey.'});
            }
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                success: false,
                error: err
            });
        });
});

// deleting response as long as it's not completed
router.post('/progress/delete/:survey_id', (req, res) => {
    if (!req.user) return res.status(401).json({success: false, message: 'Please log in.'});
    const username = req.session.passport.user;
    User.findOne({username: username})
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({success: false, message: 'User not found.'});
            Response.findOne({$and:[{survey: req.params.survey_id}, {user: user._id}]})
                .select('complete')
                .exec()
                .then(response => {
                    if (!response) return res.status(404).json({success: false, message: 'Response not found.'});
                    if (response.complete) return res.status(400).json({success: false, message: 'Cannot delete completed response.'});
                    // move to session eventually
                    // https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array
                    const index = user.responses.indexOf(response._id);
                    if (index > -1) {
                        user.responses.splice(index,1);
                    }
                    // consider moving to m_session
                    user.save().then(() => {
                        Response.findByIdAndDelete(response._id).then(() => {
                            return res.status(200).json({success: true, message: 'Response eliminated.'});
                        });
                    });
                });
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                success: false,
                error: err
            });
        });
});

// generic survey list acquiring thing
// sorting should be done on front end because we're giving them everything
router.get('/list/:survey_status', (req, res) => {
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false});
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
        options.path = 'responses';
        options.match = {complete: {$eq: false}};
        options.select = 'survey';
        // https://stackoverflow.com/questions/36996384/how-to-populate-nested-entities-in-mongoose
        options.populate =[{
            path: 'survey',
            // matching here can fill response.survey with null, just filter based on deactivated
            // maybe we could move the following match up?
            // match: {published: {$eq: true}, deactivated: {$eq: false}}
        }];
    }
    else if (surveyStatus === 'history') {
        options.path = 'responses';
        options.select = 'survey complete';
        options.populate =[{
            path: 'survey',
            //match: {published: {$eq: true}}
        }];
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
                return res.status(201).json({message: 'Surveys found.', surveys: user.surveys_created});
            }
            if (surveyStatus === 'in-progress' || surveyStatus === 'history') {
                if (surveyStatus === 'history') {
                    const response_list = user.responses.filter(response => (response.complete || response.survey.deactivated));
                    return res.status(201).json({message: 'Surveys found.', surveys:response_list.map(response => response.survey)});
                }
                return res.status(201).json({message: 'Surveys found.', surveys:user.responses.filter(response => !response.survey.deactivated).map(response => response.survey)});
            }
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// https://stackoverflow.com/questions/26814456/how-to-get-all-the-values-that-contains-part-of-a-string-using-mongoose-find
// getting the search list based on query
// consider adding sorting, categories here
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
        .sort({'date_published': -1}).limit(20).exec().then(surveys => {
                return res.status(201).json({message: 'Surveys found.', surveys:surveys});
            }).catch(err =>{
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
    }
});

// publishing/deactivating survey
router.post('/activate/:survey_id', (req, res) => {
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false})
    User.findOne({username: req.session.passport.user})
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({success: false, message: 'User not found.'});
            req.params.survey_id;
            Survey.findById(req.params.survey_id).exec().then(survey => {
                if (typeof survey === 'undefined') return res.status(404).json({success: false, message: 'Survey not found.'});
                const activate = req.body.toggle === 'activate' && survey.published === false && survey.deactivated === false;
                const deactivate = req.body.toggle === 'deactivate' && survey.published === true && survey.deactivated === false;
                if (!activate && !deactivate) return res.status(400).json({success: false, message: 'Check method and survey state'});
                if (activate) {
                    survey.date_published = new Date().toISOString();
                    survey.published = true;
                    survey.deactivated = false;
                    // use m_session here to transact from user balance to survey reserve
                    survey.save().then(() => {
                        return res.status(201).json({success: true, message: 'Survey published/deactivated.'});
                    });
                }
                if (deactivate) {
                    survey.published = true;
                    survey.deactivated = true;
                    // use m_session here to transact from survey reserve to user balance
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

// gets survey and response of user
router.get('/taker/:survey_id', (req, res) => {
    // the conditions for allowing a user to take a survey:
    // the user does not have to be a publisher
    // whether or not there is enough reserve only affects whether or not the user will get a warning on (attempted) completion
    // the survey has to be active (published, not deactivated)
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false});
    const username = req.session.passport.user;
    Survey.findOne({$and:[{_id: req.params.survey_id}, {published: true}, {deactivated: false}]})
        .select('published deactivated surveyJSON surveyParams')
        .exec()
        .then(survey => {
            if (!survey) return res.status(404).json({success: false, message: 'Survey not found'});
            if (survey.published !== true || survey.deactivated !== false) return res.status(400).json({success: false, message: 'Survey is not active.'});
            User.findOne({username: username})
                .select('')
                .exec()
                .then(user => {
                    if (!user) return res.status(404).json({success: false, message: 'User not found.'});
                    Response.findOne({$and:[{user:user._id}, {survey:survey._id}]})
                        .then(response => {
                            if (!response) return res.status(200).json({success: true, surveyJSON: survey.surveyJSON, surveyParams: survey.surveyParams, surveyData: {}});
                            // check that the response is not completed
                            if (response.complete === true) return res.status(400).json({success: false, message: 'Response already completed.'});
                            return res.status(200).json({success: true, surveyJSON: survey.surveyJSON, surveyParams: survey.surveyParams, surveyData: response.surveyData});
                        });
                });
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                success: false,
                error: err
            });
        });
});

// practically a duplicate of the above route, but with slightly different conditions
router.get('/view/:survey_id', (req, res) => {
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false});
    const username = req.session.passport.user;
    Survey.findOne({_id: req.params.survey_id})
        .select('published deactivated surveyJSON surveyParams')
        .exec()
        .then(survey => {
            if (!survey) return res.status(404).json({success: false, message: 'Survey not found'});
            if (survey.published === false && survey.deactivated === false) return res.status(400).json({success: false, message: 'Survey is being built.'});
            User.findOne({username: username})
                .select('')
                .exec()
                .then(user => {
                    if (!user) return res.status(404).json({success: false, message: 'User not found.'});
                    Response.findOne({$and:[{user:user._id}, {survey:survey._id}]})
                        .then(response => {
                            if (!response) return res.status(200).json({success: true, surveyJSON: survey.surveyJSON, surveyParams: survey.surveyParams, surveyData: {}});
                            return res.status(200).json({success: true, surveyJSON: survey.surveyJSON, surveyParams: survey.surveyParams, surveyData: response.surveyData});
                        });
                });
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                success: false,
                error: err
            });
        });
});

async function transact_completing(survey_id, user_id, response_id) {
    let transacted = false;
    let no_reserve = false;
    // https://medium.com/cashpositive/the-hitchhikers-guide-to-mongodb-transactions-with-mongoose-5bf8a6e22033
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const survey = await Survey.findById(survey_id).session(session);
        survey.surveyParams.reserved -= survey.surveyParams.payout;
        if (survey.surveyParams.reserved < 0) no_reserve = true;
        survey.responses.push(response_id);
        await survey.save();
        const user = await User.findById(user_id).session(session);
        user.balance += survey.surveyParams.payout;
        await user.save();
        const response = await Response.findById(response_id).session(session);
        response.complete = true;
        await response.save();
        await session.commitTransaction();
        transacted = true;
    } catch (error) {
        await session.abortTransaction();
        //console.error(error);
        throw error;
    } finally {
        session.endSession();
        // create another function with response.complete = true; and the survey push to another async func if you want to complete even if there is no
        return [transacted, no_reserve];
    }
}

// creating or updating response
router.post('/taker/:survey_id', (req,res) => {
    // First, check if the survey is active
    // Next, check if the answers in req are the correct type based on the survey
    // Then, check if the user already has a response to this survey
    // If the response exists already, update the simply update the surveyData field of the response
    // If the response does not exist, create and submit a new (incomplete) response
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false});
    const username = req.session.passport.user;
    Survey.findById(req.params.survey_id)
        .exec()
        .then(survey => {
            if (!survey) return res.status(404).json({success: false, message: 'Survey does not exist.'});
            if (survey.published !== true || survey.deactivated != false) return res.status(423).json({success: false, message: 'Survey is not active.'});
            const surveyM = new surveyjs.Model(survey.surveyJSON);
            // the following concern is just that someone could flood the database with a large json, so I'm not bothering to check if the keys are a subset
            // https://stackoverflow.com/questions/6756104/get-size-of-json-object
            if (Object.keys(req.body.survey_data).length > surveyM.getAllQuestions().length) return res.status(400).json({success: false, message: 'Too many question inputs.'});
            surveyM.data = req.body.survey_data;
            surveyM.clearIncorrectValues();
            // https://poopcode.com/compare-two-json-objects-ignoring-the-order-of-the-properties-in-javascript/
            if(!_.isEqual(surveyM.data, req.body.survey_data)) return res.status(400).json({success: false, message: 'Invalid question inputs.'});
            if (req.body.completing === true) {
                const required_questions_filled = surveyM.getAllQuestions().filter(question => question.isRequired === true).map(question => (typeof question.value !== 'undefined') && (question.value !== []) && (question.value !== null)).reduce((a, b) => a && b, true);
                if (!required_questions_filled) return res.status(400).json({success: false, message: 'Cannot complete unless required entries are filled.'});
            }
            User.findOne({username: username}) // this is just to get the user's id
                .exec()
                .then(user => {
                    if (!user) return res.status(404).json({success: false, message: 'User not found.'});
                    Response.findOne({$and:[{'user':user._id}, {'survey':survey._id}]})
                        .exec()
                        .then(response => {
                            if (!response) {
                                const new_response = new Response({
                                    _id: new mongoose.Types.ObjectId(),
                                    survey: survey._id,
                                    user: user._id,
                                    surveyData: req.body.survey_data,
                                    complete: false,
                                    last_modified: new Date().toISOString()
                                });
                                new_response.save().then(() => {
                                    user.responses.push(new_response._id);
                                    user.save().then(() => {
                                        if (req.body.completing) {
                                            transact_completing(survey._id, user._id, new_response._id).then(bools => {
                                                const [transacted, no_reserve] = bools;
                                                const success = transacted;
                                                return res.status(success ? 201 : 500).json({success: success, message: 'See bools.', transacted: transacted, no_reserve:no_reserve});
                                            });
                                            return;
                                        }
                                        return res.status(200).json({success: true, message: 'Response created.'});
                                    });
                                });
                                return; // promises fall through
                            }
                            if (response.complete === true) return res.status(400).json({success: false, message: 'Response already completed.'});
                            response.surveyData = req.body.survey_data;
                            response.last_modified = new Date().toISOString();
                            response.save().then(() => {
                                if (req.body.completing) {
                                    transact_completing(survey._id, user._id, response._id).then(bools => {
                                        const [transacted, no_reserve] = bools;
                                        const success = transacted;
                                        return res.status(200).json({success: success, message: 'See bools.', transacted: transacted, no_reserve:no_reserve});
                                    });
                                    return;
                                }
                                return res.status(200).json({success: true, message: 'Response updated.'});
                            });
                        });
                });
        }).catch(err =>{
            console.log(err);
            res.status(500).json({
                success: false,
                error: err
            });
        });
});

router.get('/download/:survey_id', (req, res) => {
    if (!req.user) return res.status(401).json({success: false, message: 'Please log in.'});
    const username = req.session.passport.user;
    User.findOne({username: username})
        .select('')
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({success: false, message: 'User not found.'});
            Survey.findById(req.params.survey_id)
                .select('surveyJSON responses publisher')
                .populate('responses', 'surveyData')
                .exec()
                .then(survey => {
                    if (!survey) return res.status(404).json({success: false, message: 'Survey not found.'});
                    if (!survey.publisher.equals(user._id)) return res.status(401).json({success: false, message: 'Must be publisher to download survey.'});
                    const surveyM = new surveyjs.Model(survey.surveyJSON);
                    const surveyData = survey.responses.map(response => response.surveyData);
                    return res.status(200).json({success: true, surveyQuestions: surveyM.getAllQuestions(), surveyData: surveyData});
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