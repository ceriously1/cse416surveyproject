import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import SurveyList from '../components/surveylist/SurveyList.js';

import globalStyles from './global.module.css';

function Published() {
    const navigate = useNavigate();
    // to give a response to the user when waiting for server response
    const [isLoading, setIsLoading] = useState(true);
    // type and storage of surveys
    const [surveyStatus, setSurveyStatus] = useState('active');
    const [surveys, setSurveys] = useState([]);
    // for refreshing
    const [toggle, setToggle] = useState(false);
    // for pagination
    const [pageIndex, setPageIndex] = useState(0);
    const [totalNumSurveys, setTotalNumSurveys] = useState(0);
    const surveysPerPage = 10;
    // for sorting
    const [sortBy, setSortBy] = useState('date_published');
    const [order, setOrder] = useState('decreasing');

    useEffect(() => {
        fetch(`http://localhost:4000/survey/published/list/${surveyStatus}/${sortBy}/${pageIndex}/${order}`,
        {
            method: 'Get',
            credentials: 'include'
        }
        ).then(response => {
            return response.json();
        }).then(data => {
            console.log(data);
            if (data.message === 'Please log in.') {
                navigate('/user/login',{state:`/survey/published`});
                alert(data.message);
                return;
            }
            console.log(data);
            setIsLoading(false);
            setSurveys(data.surveys);
            setTotalNumSurveys(data.totalNumSurveys);
            setPageIndex(data.actualPageIndex);
        }) 
    }, [surveyStatus, toggle, navigate, pageIndex, sortBy, order]);

    if (isLoading || typeof surveys === 'undefined') return <div>Survey Progress Page Loading</div>;

    function sortSelectElement() {
        // https://stackoverflow.com/questions/28868071/onchange-event-using-react-js-for-drop-down
        return <div>
            Sort by
            <select onChange={e => {setSortBy(e.target.value); setPageIndex(0);}}>
                {surveyStatus === 'building' ? <option value='last_modified'>Last Modified</option> : null}
                {surveyStatus === 'inactive' ? <option value='date_deactivated'>Date Deactivated</option> : null}
                {surveyStatus !== 'building' ? <option value='date_published'>Date Published</option> : null}
                {surveyStatus !== 'building' ? <option value='completions'>Completions</option> : null}
                <option value='title'>Title</option>
                <option value='payout'>Payout</option>
                <option value='reserved'>Reserved</option>
            </select>
            <select onChange={e => {setOrder(e.target.value); setPageIndex(0);}}>
                <option value='decreasing'>Decreasing</option>
                <option value='increasing'>Increasing</option>
            </select>
        </div>
    }

    function pageSwapElement() {
        const displayPrev = (pageIndex > 0) && (surveys.length > 0);
        const displayNext = ((pageIndex+1)*surveysPerPage < totalNumSurveys);
        return <div>
            <div>Viewing Page {pageIndex+1} of {parseInt((totalNumSurveys-1)/surveysPerPage)+1}</div>
            {displayPrev ? <button onClick={() => {setPageIndex(pageIndex-1)}}>Previous Page</button>: null}
            {displayNext ? <button onClick={() => {setPageIndex(pageIndex+1)}}>Next Page</button>: null}
        </div>
    }

    function statusSwapElement() {
        function statusSwap(status) {
            if (surveyStatus !== status) {
                if (status === 'active') setSortBy('date_published');
                if (status === 'inactive') setSortBy('date_deactivated');
                if (status === 'building') setSortBy('last_modified');
                setSurveyStatus(status);
                setPageIndex(0);
                setIsLoading(true);
            }
        }
        return <div>
            <button onClick={() => {statusSwap('active')}}>Active Surveys</button>
            <button onClick={() => {statusSwap('inactive')}}>Inactive Surveys</button>
            <button onClick={() => {statusSwap('building')}}>Surveys Being Built</button>
        </div>
    }

    return <div>
        <h1>Surveys Published</h1>
        <div className={globalStyles.shift}>
        <div><button onClick={() => {navigate('/survey/builder/0')}}>Create New Survey</button></div>
        {statusSwapElement()}
        {sortSelectElement()}
        <SurveyList surveys={surveys} surveyStatus={surveyStatus} toggle={toggle} setToggle={setToggle}/>
        {pageSwapElement()}
        </div>
    </div>;
}

export default Published;