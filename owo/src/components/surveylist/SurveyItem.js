import {useNavigate} from 'react-router-dom';
import {useState, useRef} from 'react';

function SurveyItem(props) {
    const navigate = useNavigate();
    const [isFunding,setIsFunding] = useState(false);
    const fundingRef = useRef();
    
    // props.surveyState determine what buttons you should display
    const surveyStatus = props.surveyStatus;
    const survey = props.survey;
    const surveyParams = survey.surveyParams;
    const tags = (survey.surveyParams.tags.length > 0) ? survey.surveyParams.tags : 'None' ;

    // activate/deactivate survey
    function activate(toggle) {
        fetch(`http://localhost:4000/survey/activate/${survey._id}`, 
        {
            method: 'Post',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({toggle: toggle})
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
            if (response.success === true) {
                props.setToggle(!props.toggle);
            } else if (response.no_balance === true) {
                alert("Your balance is too low to fund the survey reserves.");
            } else {
                alert(response.message);
            }
        });
    }

    // delete survey being built
    function deleteBuild() {
        fetch(`http://localhost:4000/survey/published/delete/${survey._id}`, 
        {
            method: 'Post',
            credentials: 'include',
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
            if (response.success === true) {
                props.setToggle(!props.toggle);
            }
        });
    }

    // delete response which is not completed
    function deleteResponse() {
        // affects a User and a Response
        fetch(`http://localhost:4000/survey/progress/delete/${survey._id}`, 
        {
            method: 'Post',
            credentials: 'include',
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
            if (response.success === true) {
                props.setToggle(!props.toggle);
            }
        });
    };

    // download results based on type
    function download(type) {
        fetch(`http://localhost:4000/survey/download/${survey._id}`, 
        {
            method: 'Get',
            credentials: 'include',
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            if (response.message === 'Please log in.') {
                navigate('/user/login',{state:'/survey/published'});
                alert(response.message);
                return;
            }
            if (!response.success) {
                alert(response.message);
                return;
            }
            const questions = response.surveyQuestions.map(question => JSON.stringify(question)).toString();
            const data = JSON.stringify(response.surveyData);
            alert(questions.concat(data));
        });
    }

    // 
    function fund() {
        const amountJSON = {
            amount: fundingRef.current.value
        }
        console.log(amountJSON);
        fetch(`http://localhost:4000/survey/fund/${survey._id}`, 
        {
            method: 'Post',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(amountJSON)
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
            if (response.success) {
                setIsFunding(false);
                props.setToggle(!props.toggle);
            } else if (response.no_balance) {
                alert('Insufficient balance.');
            } else {
                alert(response.message);
            }
        });
    }

    function buttons() {
        if (surveyStatus === 'active') {
            return <div>
                <button onClick={() => {navigate(`/survey/view/${survey._id}`)}}>View</button>
                <button onClick={() => {activate('deactivate')}}>Deactivate</button>
                <button onClick={() => {download('json')}}>Download JSON</button>
                <button onClick={() => {setIsFunding(true);}}>Fund</button>
            </div>
        }
        if (surveyStatus === 'inactive') {
            return <div>
                <button onClick={() => {navigate(`/survey/view/${survey._id}`)}}>View</button>
                <button onClick={() => {download('json')}}>Download JSON</button>
            </div>
        }
        if (surveyStatus === 'building') {
            return <div>
                <button onClick={() => {navigate(`/survey/builder/${survey._id}`)}}>Continue</button>
                <button onClick={() => {activate('activate')}}>Activate</button>
                <button onClick={() => {deleteBuild()}}>Delete</button>
            </div>
        }
        if (surveyStatus === 'in-progress') {
            return <div>
                <button onClick={() => {navigate(`/survey/taker/${survey._id}`)}}>Continue</button>
                <button onClick={() => {deleteResponse()}}>Delete</button>
            </div>
        }
        if (surveyStatus === 'history') {
            return <div>
                <button onClick={() => {navigate(`/survey/view/${survey._id}`)}}>View</button>
            </div>
        }
        if (surveyStatus === 'search') {
            return <div>
                <button onClick={() => {navigate(`/survey/taker/${survey._id}`)}}>Take</button>
            </div>
        }
    }

    function info() {
        // can use switch, but that doesn't really matter because there aren't particulary many variations of surveyStatus
        if (surveyStatus === 'active') {
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserve - {surveyParams.reserved} microAlgos</div>
                <div>Completions - {survey.responses.length}</div>
            </div>
        }
        if (surveyStatus === 'inactive') {
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserve - {surveyParams.reserved} microAlgos</div>
                <div>Completions - {survey.responses.length}</div>
            </div>
        }
        if (surveyStatus === 'building') {
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserve - {surveyParams.reserved} microAlgos</div>
            </div>
        }
        if (surveyStatus === 'in-progress') {
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Publisher - {survey.publisherName}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserve - {surveyParams.reserved} microAlgos</div>
                <div>Completions - {survey.responses.length}</div>
            </div>
        }
        if (surveyStatus === 'history') {
            // add Completed later
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Publisher - {survey.publisherName}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserve - {surveyParams.reserved} microAlgos</div>
                <div>Completions - {survey.responses.length}</div>
            </div>
        }
        if (surveyStatus === 'search') {
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Publisher - {survey.publisherName}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserve - {surveyParams.reserved} microAlgos</div>
                <div>Completions - {survey.responses.length}</div>
            </div>
        }
    }
    
    // fetch 
    return <div>
        {info()}
        {buttons()}
        {isFunding ? (<div>
            <label htmlFor='funding'>Amount</label>
            <input type='number' required id='funding' ref={fundingRef}></input>
            <button onClick={() => {fund()}}>Submit</button>
            <button onClick={() => {setIsFunding(false)}}>Cancel</button>
        </div>) : null}
    </div>
}

export default SurveyItem;