
import Page from '../components/surveys/Page.js';
import { useState, useEffect} from 'react';


// TO-DO : set-up server-side of this, figure out how to pass the survey id or name into this function, figure out how to use state to modify answers
function SurveyTaker() {

    // a page is an array of questions
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState([]);
    const [numPages, setNumPages] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);

    function savePageResponse() {
        fetch('http://localhost:4000/survey/in-progress/taking',
        {
            method: 'Post',
            credentials: 'include',
            body: {
                page: page,
                pageIndex: pageIndex
            }
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
        });
    };

    // when the server recieves a get request for an in-progress survey, it should use the credentials to select and append the surveyee's answers to the questions based on user
    useEffect(() => {
        fetch('http://localhost:4000/survey/in-progress/taking',
        {
            method: 'Get',
            credentials: 'include',
            body: {
                pageIndex: pageIndex
            }
        }
        ).then(response => {
            // .json() is a promise function, and promise functions need .then() to get their results
            return response.json();
        // data is response.json()
        }).then(data => {
            setIsLoading(false);
            setPage(data.page);
            setNumPages(data.numPages);
        })
    }, [pageIndex]);

    if (isLoading) {
        return (
            <div>Survey Taking Page Loading</div>
        );
    }

    // This should re-render everytime setPageIndex state changes
    return <section>
        <div>
            <Page page = {page} />
        </div>
        <div>
            <ul>
                <li><button onClick={setPageIndex((pageIndex < numPages - 1)?(pageIndex+1):(pageIndex))}>Next Page</button></li>
                <li><button onClick={setPageIndex((pageIndex > 0)?(pageIndex-1):(pageIndex))}>Previous Page</button></li>
                <li><button onClick={savePageResponse()}>Save Response</button></li>
            </ul>
        </div>
    </section>
}

export default SurveyTaker;