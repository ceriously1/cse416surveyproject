import {useEffect, useState} from 'react';
import {useNavigate, useParams, Navigate} from 'react-router-dom';
import {Survey} from 'survey-react-ui';
import {Model} from 'survey-core';

function Taker() {
    const navigate = useNavigate();
    // remember to deal with the case where the survey is deactivated
    // to take a survey, the survey has to be active (published, not deactivated)
    const {survey_id} = useParams();
    const [isLoading, setIsLoading] = useState(true);   // ensures that we don't attempt to access anything we're not ready to access
    const [surveyJSON, setSurveyJSON] = useState({});
    const [surveyParams, setSurveyParams] = useState({title: 'Placeholder Title', description: 'No Description', tags:[], payout: 0, reserved: 0});
    const [surveyData, setSurveyData] = useState({});

    useEffect(() => {
        fetch(`http://localhost:4000/survey/taker/${survey_id}`, 
        {
            method: 'Get', 
            credentials: 'include',
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
            if (response.message === 'Please log in.') {
                navigate('/user/login');
                alert(response.message);
                return; // I think returning before setting state helps prevent stuff from rendering?
            }
            if (response.message === 'Response already completed.') {
                navigate(`/survey/view/${survey_id}`);
                alert(response.message);
                return;
            }
            setIsLoading(false);
            setSurveyJSON(response.surveyJSON);
            setSurveyParams(response.surveyParams);
            setSurveyData(response.surveyData);
        });
    }, [survey_id]);

    if (isLoading) return <div>Loading Survey Taker</div>

    if (typeof surveyJSON === 'undefined' || typeof surveyParams === 'undefined') {
        return <div>Cannot access survey.</div>
    }

    const survey = new Model(surveyJSON);
    survey.showNavigationButtons = true;
    survey.showCompletedPage = false;

    survey.data = surveyData;

    survey.onComplete.add(()=> {
        fetch(`http://localhost:4000/survey/taker/${survey_id}`, 
        {
            method: 'Post', 
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({completing: true, survey_data: survey.data})
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
            console.log(response.success);
            if (response.success) navigate(`/survey/progress`);
            else navigate(0);
        });
    });

    function saveResponse() {
        // on the server side, you should retrieve the surveyJSON to and get the question types to verify that the answers are valid
        fetch(`http://localhost:4000/survey/taker/${survey_id}`, 
        {
            method: 'Post', 
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({completing: false, survey_data: survey.data})
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
        });
    };  
    
    return <div>
        <div>Survey Title: {surveyParams.title}</div>
        <div>Description: {surveyParams.description}</div>
        <div>Tags: {(surveyParams.tags.length < 1) ? 'None' : surveyParams.tags}</div>
        <div>Payout: {surveyParams.payout} microAlgos</div>
        <div>Reserve: {surveyParams.reserved} microAlgos</div>
        {(surveyParams.payout > surveyParams.reserved)? <div>Warning. Survey payout is currently greater than reserve.</div>:null}
        <div><Survey model={survey}/></div>
        <div><button onClick={() => {saveResponse()}}>Save Response</button></div>
    </div>;
}

export default Taker;