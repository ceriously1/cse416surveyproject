import {useState, useEffect, useRef} from 'react';
import SurveyList from '../components/surveylist/SurveyList.js';

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
        fetch(`http://localhost:4000/survey/search/${sortBy}/${pageIndex}/${order}/${query}`,
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
        {searchElement()}
        <SurveyList surveys={surveys} surveyStatus={surveyStatus} toggle={toggle} setToggle={setToggle}/>
        {pageSwapElement()}
    </div>
}

export default Search;