import { useRef } from 'react';

function Question(props) {
    // question prop coming in will have the form props = {type, question_text, answer}
    const answerRef = useRef();

    function changeAnswer(event) {
        event.preventDefault();
        props.answer = answerRef.current.value;
    };

    return <li>
        <div>
            <h2>{props.question_text}</h2>
        </div>
        <form onChange={changeAnswer}>
            <div>
                <label htmlFor='answer'>User</label>
                <input type={props.type} required id='answer' ref={answerRef}></input>
            </div>
        </form>
    </li>
}

export default Question;