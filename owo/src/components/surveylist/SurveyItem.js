import {useNavigate} from 'react-router-dom';

function SurveyItem(props) {
    const navigate = useNavigate();
    
    // props.surveyState determine what buttons you should display
    const surveyStatus = props.surveyStatus;
    const survey = props.survey;
    const surveyParams = survey.surveyParams;
    const tags = (survey.surveyParams.tags.length > 0) ? survey.surveyParams.tags : 'None' ;

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
            }
        });
    }

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

    function buttons() {
        if (surveyStatus === 'active') {
            return <div>
                <button onClick={() => {navigate(`/survey/view/${survey._id}`)}}>View</button>
                <button onClick={() => {activate('deactivate')}}>Deactivate</button>
            </div>
        }
        if (surveyStatus === 'inactive') {
            return <div>
                <button onClick={() => {navigate(`/survey/view/${survey._id}`)}}>View</button>
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
    </div>
}

export default SurveyItem;