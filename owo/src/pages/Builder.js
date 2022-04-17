import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Builder() {
    const {survey_id} = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [pages, setPages] = useState([]);
    const [pageIndex, setPageIndex] = useState(0);

    // surveyParams
    const titleRef = useRef();
    const descriptionRef = useRef();
    const tag1Ref = useRef();
    const payoutRef = useRef();

    // survey_id === 0 will be a special case indicating that a new survey is being created, surver should send response.pages: [[]]
    // from the builder's pov, it is okay to give them all the pages and questions at once
    // fetch to get the survey from the server only needs to be called once
    useEffect(() => {
        fetch(`http://localhost:4000/survey/builder/:${survey_id}`, 
        {
            method: 'Get', 
            credentials: 'include',
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response.message);
            setIsLoading(false);
            setPages(response.pages);
            surveyParams = response.surveyParams;
            // hopefully this fills the entries in forms by default
            titleRef.current.value = surveyParams.title;
            descriptionRef.current.value = surveyParams.description;
            tag1Ref.current.value = surveyParams.tags[0];
            payoutRef.current.value = surveyParams.payout;
        });
    }, [survey_id])

    if (isLoading) return <div>Builder Loading</div>;
    
    // the function saveSurvey is fairly simplistic because it is unnecessary to get a response from the server
    function saveSurvey() {
        const surveyParams = {
            title: titleRef.current.value,
            description: descriptionRef.current.value,
            tags: [tag1.current.value],
            payout: payoutRef.current.value
        }

        fetch(`http://localhost:4000/survey/builder/:${survey_id}`, 
        {
            method: 'Post', 
            credentials: 'include',
            body: {
                surveyParams: JSON.stringify(surveyParams),
                pages: pages
            }
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response.message);
        });
    };

    function tagOptions() {
        return <>
            <option value='Garble'>Garble</option>
            <option value='Goo'>Goo</option>
            <option value='Wobble'>Wobble</option>
            <option value='Squabble'>Squabble</option>
        </>
    };

    // Now I need to use the pages state to display the existing pages
    // These pages should come with the option to set survey params, change pages, save the survey, and add questions
    // Only adding questions is page-specific, so we can handle that in the page component

    // in the following code, page is a prop getting passed down to the 'Page' componenent
    // further down, we conditionally render the next and prev page buttons
    // this conditional rendering is made particularly easy by the fact that we know exactly how many pages there are
    return <section>
        <div>
            <Page page = {pages[pageIndex]} />
        </div>
        <div>
            <ul>
                {(pageIndex < pages.length - 1) ? <li><button onClick={setPageIndex(pageIndex+1)}>Next Page</button></li> : null}
                {(pageIndex > 0) ? <li><button onClick={setPageIndex(pageIndex-1)}>Next Page</button></li> : null}
                <li><form onSubmit={saveSurvey()}>
                    <div>
                        <label htmlFor='title'>Title</label>
                        <input type='text' required id='title' ref={titleRef}></input>
                    </div>
                    <div>
                        <label htmlFor='description'>Description</label>
                        <input type='text' required id='description' ref={descriptionRef}></input>
                    </div>
                    <div>
                        <label htmlFor='tag1'>Tag 1</label>
                        <input type='select' required id='tag1' ref={tag1Ref}>
                            {tagOptions()}
                        </input>
                    </div>
                    <div>
                        <label htmlFor='payout'>Payout (MicroAlgos)</label>
                        <input type='number' required id='payout' ref={payoutRef}></input>
                    </div>
                    <div><button>Save Survey</button></div>
                </form></li>
            </ul>
        </div>
    </section>
}

export default Builder;