import Question from './Question.js';

function Page(props) {
    return <ul>
        {props.page.map((question) => (
            <Question 
                key={question.id}
                type={question.type} 
                text={question.text} 
                params={question.params}
                answer={question.answer}
            />
        ))}
    </ul>
}

export default Page;