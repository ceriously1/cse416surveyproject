import { useState, useEffect} from 'react';
import SurveyList from '../components/surveys/SurveyList.js';

function Progress() {
    
    const [isLoading, setIsLoading] = useState(true);
    // 0 for surveys in progress, 1 for survey history
    // page is an array of surveys
    const [surveyClass, setSurveyClass] = setState(0);
    const [pageIndex, setPageIndex] = setState(0);
    const [numSurveys, setNumSurveys] = setState(0);
    const [page, setPage] = setState([]);
    const pageLength = 20;


    useEffect(() => {
        fetch('http://localhost:4000/survey/progress', 
        {
            method: 'Get',
            credentials: 'include',
            body: {
                surveyClass: surveyClass,
                pageIndex: pageIndex,
                pageLength: pageLength
            }
        }
        ).then(res => {
            return res.json()
        })
        .then(data => {
            setIsLoading(False);
            // data = {message, page, numSurveys}
            console.log(data.message);
            setPage(data.page);  // we need to put this in useEffect to prevent infinite loop
            setNumSurveys(data.numSurveys); // using this instead of index to prevent infinite loop
        });
    }, [pageIndex]);

    if (isLoading) {
        return (
            <div>Survey Taking Page Loading</div>
        );
    }
    
    return <section>
        <div>
            <SurveyList page = {page} surveyClass = {surveyClass}/>
        </div>
        <div>
            <ul>
                <li><button onClick={setPageIndex((pageIndex < Math.ceil(numSurveys/20) - 1)?(pageIndex+1):(pageIndex))}>Next Page</button></li>
                <li><button onClick={setPageIndex((pageIndex > 0)?(pageIndex-1):(pageIndex))}>Previous Page</button></li>
            </ul>
        </div>
    </section>
}

export default Progress;