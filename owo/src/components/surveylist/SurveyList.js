import SurveyItem from './SurveyItem.js';

function SurveyList(props) {
    // props: {surveys: [...], surveyStatus: String}
    return <div>
        Survey List:
        {(props.surveys.length < 1) ? <div>{`No '${props.surveyStatus}' surveys`}</div> : null}
        {props.surveys.map(survey => <SurveyItem key={survey._id} survey={survey} surveyStatus={props.surveyStatus} toggle={props.toggle} setToggle={props.setToggle}/>)}
    </div>
}

export default SurveyList;