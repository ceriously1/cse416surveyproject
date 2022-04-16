import Question from './Question.js';

function Page(props) {
    return <ul>
        {props.page.map((question) => (
            <Question 
                key={question.id}
                type={question.type} 
                question_text={question.question_text} 
                answer={question.answer} 
            />
        ))}
    </ul>
}

export default Page;