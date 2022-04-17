import { useRef } from 'react';

function Question(props) {
    // question prop coming in will have the form props = {type, text, params, answer}
    const answerRef = useRef();

    function changeAnswer(event) {
        event.preventDefault();
        props.answer = answerRef.current.value;
    };

    return <li>
        <form onChange={changeAnswer}>
            <div>
                <label htmlFor='answer'>{props.text}</label>
                <input type={props.type} required id='answer' ref={answerRef}>

                </input>
            </div>
        </form>
    </li>
}

export default Question;