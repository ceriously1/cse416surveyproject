import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import SurveyList from '../components/surveylist/SurveyList.js';

function Progress() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [surveyStatus, setSurveyStatus] = useState('in-progress');
    const [surveys, setSurveys] = useState([]);
    const [toggle, setToggle] = useState(false);

    useEffect(() => {
        // active = published: true, deactivated: false; inactive = published: true, deactivated: true; in-progress = published: false, deactivated: false
        // for an active survey, you should be able to view and deactivate the survey and view answers
        // for an inactive survey, you can view the survey and answers
        // for an building survey, you can continue building or activate the survey
        // a survey element should have the surveyParams and _id
        fetch(`http://localhost:4000/survey/list/${surveyStatus}`,
        {
            method: 'Get',
            credentials: 'include'
        }
        ).then(response => {
            return response.json();
        }).then(data => {
            if (data.message === 'Please log in.') {
                navigate('/user/login',{state:'/survey/progress'});
                alert(data.message);
                return;
            }
            setIsLoading(false);
            console.log(data);
            setSurveys(data.surveys);
        }) 
    }, [surveyStatus, toggle, navigate]);

    if (isLoading) return <div>Survey Progress Page Loading</div>;

    if (typeof surveys === 'undefined') {
        return <div>Relog</div>;
    }

    return <div>
        <h1>Survey Progress</h1>
        <div>
            <button onClick={() => {if (surveyStatus !== 'in-progress') {setSurveyStatus('in-progress'); setIsLoading(true);}}}>In-Progress Surveys</button>
            <button onClick={() => {if (surveyStatus !== 'history') {setSurveyStatus('history'); setIsLoading(true);}}}>Past Survey</button>
        </div>
        <SurveyList surveys={surveys} surveyStatus={surveyStatus} toggle={toggle} setToggle={setToggle}/>
    </div>;
}

export default Progress;