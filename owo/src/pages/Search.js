import {useState, useEffect, useRef} from 'react';
import SurveyList from '../components/surveylist/SurveyList.js';

import globalStyles from './global.module.css';

function Search() {
    const [query, setQuery] = useState('');
    const queryRef = useRef();
    const [isLoading, setIsLoading] = useState(true);
    const surveyStatus = 'search';
    const [surveys, setSurveys] = useState([]);
    // I'm only including this here because the child comps expect this as a prop
    const [toggle, setToggle] = useState(false);
    // for pagination
    const [pageIndex, setPageIndex] = useState(0);
    const [totalNumSurveys, setTotalNumSurveys] = useState(0);
    const surveysPerPage = 10;
    // for sorting
    const [sortBy, setSortBy] = useState('date_published');
    const [order, setOrder] = useState('decreasing');

    useEffect(() => {
        fetch(`${process.env.REACT_APP_SERVER_ADDR}/survey/search/${sortBy}/${pageIndex}/${order}/${query}`,
        {
            method: 'Get',
            credentials: 'include',
        }
        ).then(response => {
            return response.json();
        }).then(data => {
            console.log(data);
            setIsLoading(false);
            setSurveys(data.surveys);
            setTotalNumSurveys(data.totalNumSurveys);
            setPageIndex(data.actualPageIndex);
        }) 
    }, [query, toggle, sortBy, pageIndex, order]);

    if (isLoading) return <div>Search Loading</div>

    function searchElement() {
        return <div>
            <div>
                <label>Search</label>
                <input type='text' ref={queryRef} />
                <button onClick={() => {setQuery(queryRef.current.value)}}>Submit</button>
            </div>
        </div>
    }

    function sortSelectElement() {
        // https://stackoverflow.com/questions/28868071/onchange-event-using-react-js-for-drop-down
        return <div>
            Sort by
            <select onChange={e => {setSortBy(e.target.value); setPageIndex(0);}}>
                <option value='date_published'>Date Published</option>
                <option value='completions'>Completions</option>
                <option value='surveyParams.title'>Title</option>
                <option value='surveyParams.payout'>Payout</option>
                <option value='surveyParams.reserved'>Reserved</option>
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

    return <div>
        <h1>Search</h1>
        <div className={globalStyles.shift}> 
            {searchElement()}
            {sortSelectElement()}
            <SurveyList surveys={surveys} surveyStatus={surveyStatus} toggle={toggle} setToggle={setToggle}/>
            {pageSwapElement()}
        </div>
    </div>
}

export default Search;