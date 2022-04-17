import BQuestion from './BQuestion.js';

function BPage(props) {
    return <ul>
        {props.page.map((question) => (
            <BQuestion 
                key={question.id}
                type={question.type} 
                text={question.text} 
                params={question.params}
            />
        ))}
    </ul>
}

export default BPage;