function SurveyItem(props) {

    function handleClick(event) {
        event.preventDefault();
    }

    return <li onClick={handleClick()}>
        <div>
            <h2>{props.title}</h2>
        </div>
        <div>Tage: {props.tags}</div>
        <div>Description: {props.description}</div>
        <div>Payout (MicroAlgos): {props.payout}</div>
    </li>
}

export default SurveyItem;