import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import SurveyList from '../components/surveylist/SurveyList.js';

function Published() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    // surveyStatus determines which kind of survey is displayed
    const [surveyStatus, setSurveyStatus] = useState('active');
    const [surveys, setSurveys] = useState([]);
    // the purpose of toggle is to have a way of refreshing the surveys whenever we want
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
            setIsLoading(false);
            console.log(data);
            setSurveys(data.surveys);
        }) 
    }, [surveyStatus, toggle]);

    if (isLoading) return <div>Surveys Published Loading</div>;

    if (typeof surveys === 'undefined') {
        return <div>Relog</div>;
    }



    return <div>
        <div>Surveys Published Page</div>
        <div><button onClick={() => {navigate('/survey/builder/0')}}>Create New Survey</button></div>
        <div>
            <button onClick={() => {if (surveyStatus !== 'active') {setSurveyStatus('active'); setIsLoading(true);}}}>Active Surveys</button>
            <button onClick={() => {if (surveyStatus !== 'inactive') {setSurveyStatus('inactive'); setIsLoading(true);}}}>Inactive Surveys</button>
            <button onClick={() => {if (surveyStatus !== 'building') {setSurveyStatus('building'); setIsLoading(true);}}}>Surveys Being Built</button>
        </div>
        <SurveyList surveys={surveys} surveyStatus={surveyStatus} toggle={toggle} setToggle={setToggle}/>
    </div>;
}

export default Published;