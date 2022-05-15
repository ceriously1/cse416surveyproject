import {useNavigate} from 'react-router-dom';
import {useState, useRef} from 'react';

import styles from './SurveyItem.module.css';
import './si.css';
import PieChart from './PieChart';

function SurveyItem(props) {
    const navigate = useNavigate();
    const [isFunding,setIsFunding] = useState(false);
    const fundingRef = useRef();
    
    // props.surveyState determine what buttons you should display
    const surveyStatus = props.surveyStatus;
    const survey = props.survey;
    const surveyParams = survey.surveyParams;
    const tags = (survey.surveyParams.tags.length > 0) ? survey.surveyParams.tags : 'None' ;

    // activate/deactivate survey
    function activate(toggle) {
        fetch(`${process.env.REACT_APP_SERVER_ADDR}/survey/activate/${survey._id}`, 
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
            } else if (response.no_balance === true) {
                alert("Your balance is too low to fund the survey reserves.");
            } else {
                alert(response.message);
            }
        });
    }

    // delete survey being built
    function deleteBuild() {
        fetch(`${process.env.REACT_APP_SERVER_ADDR}/survey/published/delete/${survey._id}`, 
        {
            method: 'Post',
            credentials: 'include',
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

    // delete response which is not completed
    function deleteResponse() {
        // affects a User and a Response
        fetch(`${process.env.REACT_APP_SERVER_ADDR}/survey/progress/delete/${survey._id}`, 
        {
            method: 'Post',
            credentials: 'include',
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
    };

    // download results based on type
    function download() {
        fetch(`${process.env.REACT_APP_SERVER_ADDR}/survey/download/${survey._id}`, 
        {
            method: 'Get',
            credentials: 'include',
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            if (response.message === 'Please log in.') {
                navigate('/user/login',{state:'/survey/published'});
                alert(response.message);
                return;
            }
            if (!response.success) {
                alert(response.message);
                return;
            }
            // name (id) -> title (question), names are the keys in answers[i]
            const question_map = response.surveyQuestions;
            const answers = response.surveyData;
            if (answers[0] === null) {
                alert('No responses.');
                return;
            };
            let exportArray = [[]];
            for (let i = 0; i < question_map.length; i++) {
                exportArray[0].push([question_map[i].title]);
            }
            for (let i = 0; i < answers.length; i++) {
                exportArray.push([]);
                for (let j = 0; j < question_map.length; j++) {
                    const entry = answers[i][question_map[j].name];
                    exportArray[i+1].push(Array.isArray(entry) ? "\""+ entry.toString()+"\"": "\""+[entry].toString()+"\"");
                }
            }
            // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
            let csvContent = "data:text/csv;charset=utf-8," + exportArray.map(e => e.join(",")).join("\n");
            console.log(csvContent);
            var encodedUri = encodeURI(csvContent);
            var link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "survey_data.csv");
            document.body.appendChild(link); 
            link.click();
            return;
        });
    }

    // funding active survey
    function fund() {
        const amountJSON = {
            amount: fundingRef.current.value
        }
        console.log(amountJSON);
        fetch(`${process.env.REACT_APP_SERVER_ADDR}/survey/fund/${survey._id}`, 
        {
            method: 'Post',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(amountJSON)
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            console.log(response);
            if (response.success) {
                setIsFunding(false);
                props.setToggle(!props.toggle);
            } else if (response.no_balance) {
                alert('Insufficient balance.');
            } else {
                alert(response.message);
            }
        });
    }

    function buttons() {
        if (surveyStatus === 'active') {
            return <div className={styles.footer}>
                <button onClick={() => {navigate(`/survey/view/${survey._id}`)}}>View</button>
                <button onClick={() => {activate('deactivate')}}>Deactivate</button>
                <button onClick={() => {download()}}>Download CSV</button>
                <button onClick={() => {setIsFunding(!isFunding);}}>Fund</button>
            </div>
        }
        if (surveyStatus === 'inactive') {
            return <div className={styles.footer}>
                <button onClick={() => {navigate(`/survey/view/${survey._id}`)}}>View</button>
                <button onClick={() => {download()}}>Download CSV</button>
            </div>
        }
        if (surveyStatus === 'building') {
            return <div className={styles.footer}>
                <button onClick={() => {navigate(`/survey/builder/${survey._id}`)}}>Continue</button>
                <button onClick={() => {activate('activate')}}>Activate</button>
                <button onClick={() => {deleteBuild()}}>Delete</button>
            </div>
        }
        if (surveyStatus === 'in-progress') {
            return <div className={styles.footer}>
                <button onClick={() => {navigate(`/survey/taker/${survey._id}`)}}>Continue</button>
                <button onClick={() => {deleteResponse()}}>Delete</button>
            </div>
        }
        if (surveyStatus === 'history') {
            return <div className={styles.footer}>
                <button onClick={() => {navigate(`/survey/view/${survey._id}`)}}>View</button>
            </div>
        }
        if (surveyStatus === 'search') {
            return <div className={styles.footer}>
                <button onClick={() => {navigate(`/survey/taker/${survey._id}`)}}>Take</button>
            </div>
        }
    }

    function info() {
        // can use switch, but that doesn't really matter because there aren't particulary many variations of surveyStatus
        const datePublished = new Date(survey.date_published);
        const datePublishedRead = datePublished.toLocaleDateString() + ' - ' + datePublished.toLocaleTimeString();
        const dateDeactivated = new Date(survey.date_deactivated);
        const dateDeactivateRead = dateDeactivated.toLocaleDateString() + ' - ' + dateDeactivated.toLocaleTimeString();
        const lastModified = new Date(survey.last_modified);
        const lastModifiedRead = lastModified.toLocaleDateString() + ' - ' + lastModified.toLocaleTimeString();
        const rLastModified = new Date(survey.r_last_modified);
        const rLastModifiedRead = rLastModified.toLocaleDateString() + ' - ' + rLastModified.toLocaleTimeString();
        const rDateCompleted = new Date(survey.r_date_completed);
        const rDateCompletedRead = rDateCompleted.toLocaleDateString() + ' - ' + rDateCompleted.toLocaleTimeString();
        if (surveyStatus === 'active') {
            return <div>
                <div className={styles.header}>
                    <div><i>Title:</i> {surveyParams.title}</div>
                    <div><i>Date Published:</i> {datePublishedRead}</div>
                </div>
                <div className={styles.desc}><i>Description:</i> {surveyParams.description}</div>
                <div className={styles.meta}>
                    <div><i>Payout:</i> {surveyParams.payout} mAlgos,   <i>Reserve:</i> {surveyParams.reserved} mAlgos</div>
                    <div><i>Completions:</i> {survey.responses.length}</div>
                </div>
            </div>
        }
        if (surveyStatus === 'inactive') {
            return <div>
                <div className={styles.header}>
                    <div><i>Title:</i> {surveyParams.title}</div>
                    <div><i>Date Published:</i> {datePublishedRead}</div>
                    <div><i>Date Deactivated:</i> {dateDeactivateRead}</div>
                </div>
                <div className={styles.desc}><i>Description:</i> {surveyParams.description}</div>
                <div className={styles.meta}>
                    <div><i>Payout:</i> {surveyParams.payout} mAlgos,   <i>Reserve:</i> {surveyParams.reserved} mAlgos</div>
                    <div><i>Completions:</i> {survey.responses.length}</div>
                </div>
            </div>
        }
        if (surveyStatus === 'building') {
            return <div>
                <div className={styles.header}><i>Title:</i> {surveyParams.title}</div>
                <div className={styles.desc}><i>Description:</i> {surveyParams.description}</div>
                <div className={styles.meta}>
                    <div><i>Payout:</i> {surveyParams.payout} mAlgos,   <i>Reserve:</i> {surveyParams.reserved} mAlgos</div>
                    <div><i>Completions:</i> {survey.responses.length}</div>
                    <div><i>Last Modified:</i> {lastModifiedRead}</div>
                </div>
            </div>
        }
        if (surveyStatus === 'in-progress') {
            return <div>
                <div className={styles.header}>
                    <div><i>Title:</i> {surveyParams.title}</div>
                    <div><i>Publisher:</i> {survey.publisherName}</div>
                    <div><i>Date Published:</i> {datePublishedRead}</div>
                </div>
                <div className={styles.desc}><i>Description:</i> {surveyParams.description}</div>
                <div className={styles.meta}>
                    <div><i>Payout:</i> {surveyParams.payout} mAlgos,   <i>Reserve:</i> {surveyParams.reserved} mAlgos</div>
                    <div><i>Completions:</i> {survey.responses.length}</div>
                    <div><i>Last Modified:</i> {rLastModifiedRead}</div>
                </div>
            </div>
        }
        if (surveyStatus === 'history') {
            // add Completed later
            return <div>
                <div className={styles.header}>
                    <div><i>Title:</i> {surveyParams.title}</div>
                    <div><i>Publisher:</i> {survey.publisherName}</div>
                    <div><i>Date Published:</i> {datePublishedRead}</div>
                    <div><i>Date Deactivated:</i> {dateDeactivateRead}</div>
                </div>
                <div className={styles.desc}><i>Description:</i> {surveyParams.description}</div>
                <div className={styles.meta}>
                    <div><i>Payout:</i> {surveyParams.payout} mAlgos,   <i>Reserve:</i> {surveyParams.reserved} mAlgos</div>
                    <div><i>Completions:</i> {survey.responses.length}</div>
                    <div><i>Last Modified:</i> {rLastModifiedRead}</div>
                    <div><i>Date Completed:</i> {rDateCompletedRead}</div>
                </div>
            </div>
        }
        if (surveyStatus === 'search') {
            return <div>
                <div className={styles.header}>
                    <div><i>Title:</i> {surveyParams.title}</div>
                    <div><i>Publisher:</i> {survey.publisherName}</div>
                    <div><i>Date Published:</i> {datePublishedRead}</div>
                </div>
                <div className={styles.desc}><i>Description:</i> {surveyParams.description}</div>
                <div className={styles.meta}>
                    <div><i>Payout:</i> {surveyParams.payout} mAlgos,   <i>Reserve:</i> {surveyParams.reserved} mAlgos</div>
                    <div><i>Completions:</i> {survey.responses.length}</div>
                </div>
            </div>
        }
    }
    
    function visualize() {
        fetch(`${process.env.REACT_APP_SERVER_ADDR}/survey/download/${survey._id}`, 
        {
            method: 'Get',
            credentials: 'include',
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            if (response.message === 'Please log in.') {
                navigate('/user/login',{state:'/survey/published'});
                alert(response.message);
                return;
            }
            if (!response.success) {
                alert(response.message);
                return;
            }
            const question_map = response.surveyQuestions;
            const answers = response.surveyData;
            if (answers[0] === null) {
                return;
            };
            let dataArray = [];
            for (let i = 0; i < question_map.length; i++) {
                dataArray.push({});
            }
            for (let i = 0; i < answers.length; i++) {
                for (let j = 0; j < question_map.length; j++) {
                    const entry = answers[i][question_map[j].name];
                    // group by unique response id
                    dataArray[j][j] = Array.isArray(entry) ? entry.toString() : [entry].toString();
                }
            }
            // visualize every possible question
            return <div>
                {dataArray.map(function(d,i) {return <PieChart data={d} title="Question ${i}"/>})}
            </div>;
        });
    }

    return <div>
        {info()}
        {buttons()}
        {visualize()}
        {isFunding ? (<div>
            <label htmlFor='funding'>Amount</label>
            <input type='number' min='0' required id='funding' ref={fundingRef}></input>
            <button onClick={() => {fund()}}>Submit</button>
            <button onClick={() => {setIsFunding(!isFunding)}}>Cancel</button>
        </div>) : null}
    </div>
}

export default SurveyItem;