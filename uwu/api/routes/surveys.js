const Response = require('../models/response.js');
const User = require('../models/user.js');
const Survey = require('../models/survey.js');
const Transaction = require('../models/transactions.js');
const router = require('express').Router();
const mongoose = require('mongoose');
const surveyjs = require('survey-react-ui');
const _ = require('lodash');

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
        }).catch(error => {console.log(error); return res.status(500).json({message: error});});
});

// Updating the build of the survey or creating a new one if necessary
router.post('/builder/:survey_id', (req,res) => {
    // incoming req has credentials, body: {surveyJSON, surveyParams}
    if (typeof req.body.surveyJSON.pages === 'undefined') {
        return res.status(400).json({success: false, message: 'No pages in survey.', survey_id:req.params.survey_id});
    }
    // 1. Find the user_id
    if (!req.user) return res.status(401).json({success: false, message: 'Please log in.', survey_id:req.params.survey_id})
    const username = req.session.passport.user;
    User.findOne({username: username})
        .exec()
        .then(user => {
            if (!user) return res.status(404).json({success: false, message: 'User not found.'});
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
                // consider moving save() to a m_session; It's possible to create a floating "build" survey (not a critical error. Akin to memory leak)
                survey.save().then(() => {
                    user.surveys_created.push(survey._id);
                    user.save().then(() => {
                        return res.status(201).json({success: true, message: 'New survey successfully created.', survey_id: survey._id});
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
                            survey.save().then(result => {
                                return res.status(200).json({success: true, message: 'Survey updated.', survey_id:req.params.survey_id});
                            });
                        }
                        else {
                            return res.status.apply(401).json({success: false, message: 'Can only edit survey being built.', survey_id:req.params.survey_id});
                        }
                    });
                } else {
                    return res.status(401).json({success: false, message: 'User cannot access survey.', survey_id:req.params.survey_id});
                }
            }
        }).catch(error => {console.log(error); return res.status(500).json({message: error});});
});


async function deleteBuild(username, survey_id) {
    let success = false;
    let err = '';
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const user = await User.findOne({username: username}).session(session);
        const index = user.surveys_created.indexOf(survey_id);
        if (index < 0) throw ('Survey not created by user.');
        user.surveys_created.splice(index, 1);
        await user.save();
        const survey = await Survey.findById(survey_id).select('published deactivated').session(session);
        if (survey.published || survey.deactivated) throw ('Survey not being built.');
        await Survey.findByIdAndDelete(survey_id).session(session);
        await session.commitTransaction();
        success = true
    } catch (error) {
        await session.abortTransaction();
        err = error;
    } finally {
        session.endSession();
        return [success, err];
    }
}

// note that the route is called published, but this route includes the list for surveys being built
// this is supposed to delete the survey with the given id
// only works on "build" surveys
router.post('/published/delete/:survey_id', (req, res) => {
    if (!req.user) return res.status(401).json({success: false, message: 'Please log in.'});
    deleteBuild(req.session.passport.user, req.params.survey_id).then(results => {
        const [success, error] = results;
        if (success) return res.status(200).json({success: true, message: 'Survey deleted.'});
        return res.status(500).json({success: false, message: error});
    }).catch(error => {console.log(error); return res.status(500).json({success: false, message: error});});
});

async function deleteResponse(user_id, survey_id) {
    let success = false;
    let responseCompleted = false;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const response = await Response.findOne({$and:[{survey: survey_id}, {user: user_id}]}).select('complete').session(session);
        if (!response.complete) await Response.findByIdAndDelete(response.id).session(session);
        else {
            responseCompleted = true;
            throw 'Completed response cannot be deleted.';
        }
        const user = await User.findById(user_id).session(session);
        // https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array
        const index = user.responses.indexOf(response._id);
        if (index > -1) user.responses.splice(index,1);
        await user.save();
        await session.commitTransaction();
        success = true
    } catch (error) {
        await session.abortTransaction();
        console.log(error);
    } finally {
        session.endSession();
        return [success, responseCompleted];
    }
}

// deleting response as long as it's not completed
router.post('/progress/delete/:survey_id', (req, res) => {
    if (!req.user) return res.status(401).json({success: false, message: 'Please log in.'});
    const username = req.session.passport.user;
    User.findOne({username: username}).select('').exec()
        .then(user => {
            if (!user) return res.status(404).json({success: false, message: 'User not found.'});
            deleteResponse(user._id, req.params.survey_id).then(results => {
                const [success, responseCompleted] = results;
                if (responseCompleted) return res.status(400).json({success: false, message: 'Cannot delete completed response.'});
                if (success) return res.status(200).json({success: true, message: 'Response eliminated.'});
                return res.status(500).json({success: false, message: 'Server error.'});
            });
        }).catch(error => {console.log(error); return res.status(500).json({message: error});});
});

// populating:
// https://mongoosejs.com/docs/populate.html
// https://stackoverflow.com/questions/36996384/how-to-populate-nested-entities-in-mongoose
// https://stackoverflow.com/questions/33160536/mongoose-variable-sort

const surveysPerPage = 10;
// user -> responses -> surveys meeting conditions
// in-progress conditions: response.complete === false && survey.deactivated === false
// history condition: inverse of in-progress condition
router.get('/progress/list/:surveyStatus/:sortBy/:pageIndex/:order', (req, res) => {
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false});
    const {surveyStatus, sortBy, pageIndex, order} = req.params;
    let options = {path: 'responses', populate: {path: 'survey', select: '-surveyJSON'}};
    User.findOne({username: req.session.passport.user}).select('_id').populate(options).then(user => {
        function isInProgress(response) {return response.complete === false && response.survey.deactivated === false};
        const orderNum = order === 'increasing' ? 1 : -1;
        function compareResponses(r1, r2) {
            if (sortBy === 'title') return orderNum*(r1.survey.surveyParams.title > r2.survey.surveyParams.title ? 1 : -1);
            if (sortBy === 'date_published') return orderNum*(new Date(r1.survey.date_published) - new Date(r2.survey.date_published));
            if (sortBy === 'date_deactivated') return orderNum*(new Date(r1.survey.date_deactivated) - new Date(r2.survey.date_deactivated));
            if (sortBy === 'date_completed') return orderNum*(new Date(r1.date_completed) - new Date(r2.date_completed));
            if (sortBy === 'completions') return orderNum*(r1.survey.responses.length - r2.survey.responses.length);
            if (sortBy === 'payout') return orderNum*(r1.survey.surveyParams.payout - r2.survey.surveyParams.payout);
            if (sortBy === 'reserved') return orderNum*(r1.survey.surveyParams.reserved - r2.survey.surveyParams.reserved);
            return orderNum*(new Date(r1.last_modified) - new Date(r2.last_modified));
        }
        const surveysMatched = user.responses.filter(response => surveyStatus === 'in-progress' ? isInProgress(response) : !isInProgress(response));
        const totalNumSurveys = surveysMatched.length;
        let actualPageIndex = parseInt(pageIndex);
        if ((actualPageIndex+1)*surveysPerPage > totalNumSurveys) actualPageIndex = parseInt((totalNumSurveys-1)/surveysPerPage); 
        if (actualPageIndex*surveysPerPage < 0) actualPageIndex = 0;
        return res.status(200).json({
            responses: surveysMatched
                .sort((r1, r2) => compareResponses(r1,r2))
                .slice(actualPageIndex*surveysPerPage, (actualPageIndex+1)*surveysPerPage),
            totalNumSurveys: totalNumSurveys,
            actualPageIndex: actualPageIndex
        });
    }).catch(error =>{console.log(error); return res.status(500).json({message: error});});
});

// user -> surveys created (matching condition)
// active: published, not deactivated
// inactive: published, deactivated
// building: published, not deactivated
router.get('/published/list/:surveyStatus/:sortBy/:pageIndex/:order', (req, res) => {
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false});
    const {surveyStatus, sortBy, pageIndex, order} = req.params;
    let options = {path: 'surveys_created', select: '-surveyJSON'};
    if (surveyStatus === 'active') options.match = {published: {$eq: true}, deactivated: {$eq: false}};
    if (surveyStatus === 'inactive') options.match = {published: {$eq: true}, deactivated: {$eq: true}};
    if (surveyStatus === 'building') options.match = {published: {$eq: false}, deactivated: {$eq: false}};
    User.findOne({username: req.session.passport.user}).select('_id').populate(options).then(user => {
        const orderNum = order === 'increasing' ? 1 : -1;
        function compareSurveys(s1, s2) {
            if (sortBy === 'title') return orderNum*(s1.surveyParams.title > s2.surveyParams.title ? 1 : -1);
            if (sortBy === 'date_published') return orderNum*(new Date(s1.date_published) - new Date(s2.date_published));
            if (sortBy === 'date_deactivated') return orderNum*(new Date(s1.date_deactivated) - new Date(s2.date_deactivated));
            if (sortBy === 'completions') return orderNum*(s1.responses.length - s2.responses.length);
            if (sortBy === 'payout') return orderNum*(s1.surveyParams.payout - s2.surveyParams.payout);
            if (sortBy === 'reserved') return orderNum*(s1.surveyParams.reserved - s2.surveyParams.reserved);
            return orderNum*(new Date(s1.last_modified) - new Date(s2.last_modified));
        }
        const totalNumSurveys = user.surveys_created.length;
        let actualPageIndex = parseInt(pageIndex);
        if ((actualPageIndex+1)*surveysPerPage > totalNumSurveys) actualPageIndex = parseInt((totalNumSurveys-1)/surveysPerPage); 
        if (actualPageIndex*surveysPerPage < 0) actualPageIndex = 0;
        return res.status(200).json({
            surveys: user.surveys_created
                .sort((s1, s2) => compareSurveys(s1,s2))
                .slice(actualPageIndex*surveysPerPage, (actualPageIndex+1)*surveysPerPage),
            totalNumSurveys: totalNumSurveys,
            actualPageIndex: actualPageIndex
        });
    }).catch(error =>{console.log(error); return res.status(500).json({message: error});});
});

// https://stackoverflow.com/questions/26814456/how-to-get-all-the-values-that-contains-part-of-a-string-using-mongoose-find
// getting the search list based on query
// consider adding sorting, categories here
router.get('/search/:sortBy/:pageIndex/:order/:query?', (req, res) => {
    let {query, sortBy, pageIndex, order} = req.params;
    if (typeof query === 'undefined') query = '';
    const orderNum = order === 'increasing' ? 1 : -1 ;
    // https://stackoverflow.com/questions/13272824/combine-two-or-queries-with-and-in-mongoose
    Survey.find({$and:[{$or:[{'surveyParams.title':{'$regex':query,'$options':'i'}}, {'surveyParams.description':{'$regex':query,'$options':'i'}}, {'publisherName':{'$regex':query,'$options':'i'}}]}, {'published':true}, {'deactivated':false}]})
        .select('-surveyJSON').sort({[sortBy]: orderNum}).exec().then(surveys => {
            if (sortBy === 'completions') surveys.sort((s1, s2) => {return orderNum*(s1.responses.length - s2.responses.length)});
            const totalNumSurveys = surveys.length;
            let actualPageIndex = parseInt(pageIndex);
            if ((actualPageIndex+1)*surveysPerPage > totalNumSurveys) actualPageIndex = parseInt((totalNumSurveys-1)/surveysPerPage); 
            if (actualPageIndex*surveysPerPage < 0) actualPageIndex = 0;
            return res.status(200).json({message: 'Surveys found.', surveys: surveys
                .slice(actualPageIndex*surveysPerPage, (actualPageIndex+1)*surveysPerPage),
                totalNumSurveys: totalNumSurveys,
                actualPageIndex: actualPageIndex
            });
        }).catch(error => {console.log(error); return res.status(500).json({message: error});});
});

// for safely activating a survey
async function transact_activate(user_id, survey_id) {
    let transacted = false;
    let no_balance = false;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const survey = await Survey.findById(survey_id).session(session);
        survey.date_published = new Date().toISOString();
        survey.published = true;
        // survey.surveyParams.reserved is already set
        await survey.save();
        const user = await User.findById(user_id).session(session);
        user.balance -= survey.surveyParams.reserved;
        if (user.balance < 0) {
            no_balance = true;
        }
        const transaction_id = new mongoose.Types.ObjectId();
        user.transactions.push(transaction_id);
        await user.save();
        await Transaction.create([{
            _id: transaction_id,
            type: 'fund',
            from: user_id,
            to: survey_id,
            from_name: user.username,
            to_name: survey.surveyParams.title,
            amount: survey.surveyParams.reserved,
            time: new Date().toISOString()
        }], {session: session});
        await session.commitTransaction();
        transacted = true;
    } catch (error) {
        await session.abortTransaction();
    } finally {
        session.endSession();
        return [transacted, no_balance];
    }
};

// for safely deactivating a survey
async function transact_deactivate(user_id, survey_id) {
    let transacted = false;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const survey = await Survey.findById(survey_id).session(session);
        survey.deactivated = true;
        survey.date_deactivated = new Date().toISOString();
        const amount = survey.surveyParams.reserved;
        survey.surveyParams.reserved = 0;
        await survey.save();
        const user = await User.findById(user_id).session(session);
        user.balance += amount;
        const transaction_id = new mongoose.Types.ObjectId();
        user.transactions.push(transaction_id);
        await user.save();
        await Transaction.create([{
            _id: transaction_id,
            type: 'defund',
            from: survey_id,
            to: user_id,
            from_name: survey.surveyParams.title,
            to_name: user.username,
            amount: amount,
            time: new Date().toISOString()
        }], {session: session});
        await session.commitTransaction();
        transacted = true;
    } catch (error) {
        await session.abortTransaction();
    } finally {
        session.endSession();
        return transacted;
    }
};

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
                    transact_activate(user._id, survey._id).then(transact_result => {
                        const [transacted, no_balance] = transact_result;
                        if (transacted) return res.status(200).json({success: true, message: 'Survey activated.'});
                        return res.status(500).json({success: false, message: 'Survey not activated.', no_balance: no_balance});
                    });
                }
                if (deactivate) {
                    transact_deactivate(user._id, survey._id).then(transacted => {
                        if (transacted) return res.status(200).json({success: true, message: 'Survey deactivated.'});
                        return res.status(500).json({success: false, message: 'Survey not deactivated.'});
                    });
                }
            });
        }).catch(error => {console.log(error); return res.status(500).json({message: error});});
});

// for safely funding an active survey
async function transact_fund(user_id, survey_id, amount) {
    let transacted = false;
    let no_balance = false;
    let active = true;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const survey = await Survey.findById(survey_id).session(session);
        active = survey.published && !survey.deactivated;
        if (!active) {
            throw 'Survey is in invalid state to fund.';
        }
        survey.surveyParams.reserved += amount;
        await survey.save();
        const user = await User.findById(user_id).session(session);
        user.balance -= amount;
        if (user.balance < 0) {
            no_balance = true;
        }
        const transaction_id = new mongoose.Types.ObjectId();
        user.transactions.push(transaction_id);
        await user.save();
        await Transaction.create([{
            _id: transaction_id,
            type: 'fund',
            from: user_id,
            to: survey_id,
            from_name: user.username,
            to_name: survey.surveyParams.title,
            amount: amount,
            time: new Date().toISOString()
        }], {session: session});
        await session.commitTransaction();
        transacted = true;
    } catch (error) {
        await session.abortTransaction();
    } finally {
        session.endSession();
        return [transacted, no_balance, active];
    }
};

// funding of active survey
router.post('/fund/:survey_id', (req, res) => {
    if (!req.user) return res.status(401).json({message: 'Please log in.', success: false});
    User.findOne({username: req.session.passport.user})
        .select('')
        .exec()
        .then(user => {
            // not checking if user created survey, just that the user is authenticated
            if (!user) return res.status(404).json({success: false, message: 'User not found.'});
            const amount = parseInt(req.body.amount);
            console.log(req.body);
            if (Number.isNaN(amount) || amount < 0) return res.status(400).json({success: false, message: 'Not a valid value to fund.', no_balance: false, active: true});
            transact_fund(user._id, req.params.survey_id, Number(req.body.amount)).then(result => {
                const [transacted, no_balance, active] = result;
                if (transacted) return res.status(200).json({success: true, message: 'Survey funded.'});
                return res.status(500).json({success: false, message: 'Failed to fund survey.', no_balance: no_balance, active: active});
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
        }).catch(error => {console.log(error); return res.status(500).json({message: error});});
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
        }).catch(error => {console.log(error); return res.status(500).json({message: error});});
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
        // construct transaction before saving user
        const transaction_id = new mongoose.Types.ObjectId();
        user.transactions.push(transaction_id);
        await user.save();
        await Transaction.create([{
            _id: transaction_id,
            type: 'reward',
            from: survey_id,
            to: user_id,
            from_name: survey.surveyParams.title,
            to_name: user.username,
            amount: survey.surveyParams.payout,
            time: new Date().toISOString()
        }], {session: session});
        const response = await Response.findById(response_id).session(session);
        response.complete = true;
        response.date_completed = new Date().toISOString();
        await response.save();
        await session.commitTransaction();
        transacted = true;
    } catch (error) {
        await session.abortTransaction();
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
            // comparing json to see if data is the same after clearing incorrect values
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
                            // case: new response
                            if (!response) {
                                const new_response = new Response({
                                    _id: new mongoose.Types.ObjectId(),
                                    survey: survey._id,
                                    user: user._id,
                                    surveyData: req.body.survey_data,
                                    complete: false,
                                    last_modified: new Date().toISOString()
                                });
                                // consider moving to m_session; error not critical, hanging response possible
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
                            // case: updating response
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
        }).catch(error => {console.log(error); return res.status(500).json({message: error});});
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
        }).catch(error => {console.log(error); return res.status(500).json({message: error});});
});

module.exports = router;