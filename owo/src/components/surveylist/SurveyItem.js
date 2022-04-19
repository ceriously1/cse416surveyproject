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
            </div>
        }
        if (surveyStatus === 'in-progress') {
            return <div>
                <button onClick={() => {navigate(`/survey/taker/${survey._id}`)}}>Continue</button>
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
        if (surveyStatus === 'active') {
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserved - {surveyParams.reserved} microAlgos</div>
                <div>Hits - {survey.answers.length}</div>
            </div>
        }
        if (surveyStatus === 'inactive') {
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserved - {surveyParams.reserved} microAlgos</div>
                <div>Hits - {survey.answers.length}</div>
            </div>
        }
        if (surveyStatus === 'building') {
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserved - {surveyParams.reserved} microAlgos</div>
            </div>
        }
        if (surveyStatus === 'in-progress') {
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserved - {surveyParams.reserved} microAlgos</div>
                <div>Hits - {survey.answers.length}</div>
            </div>
        }
        if (surveyStatus === 'history') {
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserved - {surveyParams.reserved} microAlgos</div>
                <div>Hits - {survey.answers.length}</div>
            </div>
        }
        if (surveyStatus === 'search') {
            return <div>
                <div>Title - {surveyParams.title}</div>
                <div>Description - {surveyParams.description}</div>
                <div>Tags - {tags}</div>
                <div>Payout - {surveyParams.payout} microAlgos</div>
                <div>Reserved - {surveyParams.reserved} microAlgos</div>
                <div>Hits - {survey.answers.length}</div>
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