import SurveyItem from './SurveyItem.js';

function SurveyList(props) {
    return <ul>
        {props.page.map((survey) => (
            <SurveyItem 
                key={survey.id}
                surveyClass={props.surveyClass}
                title={survey.title}
                tags={survey.tags}
                description={survey.description}
                payout={survey.payout} 
            />
        ))}
    </ul>
}

export default SurveyList;