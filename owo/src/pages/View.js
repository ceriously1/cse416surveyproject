import {useEffect, useState} from 'react';
import {useNavigate, useParams, Navigate} from 'react-router-dom';
import {Survey} from 'survey-react-ui';
import {Model} from 'survey-core';

function View() {
    const navigate = useNavigate();
    const {survey_id} = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [surveyJSON, setSurveyJSON] = useState({});
    const [surveyParams, setSurveyParams] = useState({title: 'Placeholder Title', description: 'No Description', tags:[], payout: 0, reserved: 0});
    const [surveyData, setSurveyData] = useState({});

    useEffect(() => {   // this is so similar to the get for taking that I'll just reuse this route
        fetch(`http://localhost:4000/survey/view/${survey_id}`, 
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
                return;
            }
            setIsLoading(false);
            setSurveyJSON(response.surveyJSON);
            setSurveyParams(response.surveyParams);
            setSurveyData(response.surveyData);
        });
    }, [survey_id]);

    if (isLoading) return <div>Loading Survey Viewer</div>

    if (typeof surveyJSON === 'undefined' || typeof surveyParams === 'undefined') {
        return <div>Cannot access survey.</div>
    }

    const survey = new Model(surveyJSON);
    survey.showNavigationButtons = false;

    survey.data = surveyData;
    
    return <div>
        <div>Survey Title: {surveyParams.title}</div>
        <div>Description: {surveyParams.description}</div>
        <div>Tags: {(surveyParams.tags.length < 1) ? 'None' : surveyParams.tags}</div>
        <div>Payout: {surveyParams.payout} microAlgos</div>
        <div>Reserve: {surveyParams.reserved} microAlgos</div>
        <div><Survey model={survey}/></div>
        <div>
            <button onClick={() => {survey.prevPage()}}>Prev Page</button>
            <button onClick={() => {survey.nextPage()}}>Next Page</button>
        </div>
    </div>;
}

export default View;