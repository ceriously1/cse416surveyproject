
function BQuestion(props) {
    // Bquestion prop coming in will have the form props = {type, text, params}

    return <li>
        <form>
            <div>
                <label>{props.text}</label>
                <input type={props.type}>

                </input>
            </div>
        </form>
    </li>
}

export default BQuestion;