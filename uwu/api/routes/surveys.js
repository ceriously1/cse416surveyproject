const Answer = require('../models/answer.js');
const Survey = require('../models/survey.js');
const router = require('express').Router();

router.get('/progress', (req,res) => {
    Answer.find({user: req.session.passport.user})
        .select('_id') // selecting nothing from answers besides id
        .populate('survey', '_id title description tags payout')  // utitlize the reference in the Answer model to get fields from the corresponding surveys
        .exec()
        .then(answers => {
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