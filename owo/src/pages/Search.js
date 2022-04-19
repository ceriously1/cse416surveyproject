import {useState, useEffect} from 'react';
import SurveyList from '../components/surveylist/SurveyList.js';

function Search() {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const surveyStatus = 'search';
    const [surveys, setSurveys] = useState([]);
    // I'm only including this here because the child comps expect this as a prop
    const [toggle, setToggle] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:4000/survey/search/${query}`,
        {
            method: 'Get',
            credentials: 'include',
        }
        ).then(response => {
            return response.json();
        }).then(data => {
            setIsLoading(false);
            console.log(data);
            setSurveys(data.surveys);
        }) 
    }, [query, toggle]);

    if (isLoading) return <div>Search Loading</div>

    return <div>
        <label>Search</label>
        <input type='text' onChange={(e) => {setQuery(e.target.value)}} />
        <SurveyList surveys={surveys} surveyStatus={surveyStatus} toggle={toggle} setToggle={setToggle}/>
    </div>
}

export default Search;