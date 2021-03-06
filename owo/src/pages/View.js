import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Survey} from 'survey-react-ui';
import {Model} from 'survey-core';

import globalStyles from './global.module.css';

function View() {
    const navigate = useNavigate();
    const {survey_id} = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [surveyJSON, setSurveyJSON] = useState({});
    const [surveyParams, setSurveyParams] = useState({title: 'Placeholder Title', description: 'No Description', tags:[], payout: 0, reserved: 0});
    const [surveyData, setSurveyData] = useState({});

    useEffect(() => {   // this is so similar to the get for taking that I'll just reuse this route
        fetch(`${process.env.REACT_APP_SERVER_ADDR}/survey/view/${survey_id}`, 
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
                navigate('/user/login',{state:`/survey/view/${survey_id}`});
                alert(response.message);
                return;
            }
            setIsLoading(false);
            setSurveyJSON(response.surveyJSON);
            setSurveyParams(response.surveyParams);
            setSurveyData(response.surveyData);
        });
    }, [survey_id, navigate]);

    if (isLoading) return <div>Loading Survey Viewer</div>

    if (typeof surveyJSON === 'undefined' || typeof surveyParams === 'undefined') {
        return <div>Cannot access survey.</div>
    }

    const survey = new Model(surveyJSON);
    survey.showNavigationButtons = false;

    survey.data = surveyData;
    
    return <div>
        <h1>Survey Viewer</h1>
        <div className={globalStyles.shift}>
            <div className={globalStyles.header}>Survey Title: {surveyParams.title}</div>
            <div className={globalStyles.desc}>Description: {surveyParams.description}</div>
            <div className={globalStyles.meta}>
                <div>Tags: {(surveyParams.tags.length < 1) ? 'None' : surveyParams.tags}</div>
                <div>Payout: {surveyParams.payout} microAlgos</div>
                <div>Reserve: {surveyParams.reserved} microAlgos</div>
            </div>
            <div><Survey model={survey}/></div>
            <div>
                <button onClick={() => {survey.prevPage()}}>Prev Page</button>
                <button onClick={() => {survey.nextPage()}}>Next Page</button>
            </div>
        </div>
    </div>;
}

export default View;