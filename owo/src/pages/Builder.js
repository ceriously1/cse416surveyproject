import {useParams, useNavigate} from 'react-router-dom';
import {Survey} from 'survey-react-ui';
import {Model} from 'survey-core';
import {useEffect, useState} from 'react';


function Builder() {
    const navigate = useNavigate();
    // 'survey_id' identifies the survey being built
    // a special case is when survey_id is 0, which indicates that a completely new survey is being created
    // in any case, the client will attempt to GET the surveyJSON from the server once
    const {survey_id} = useParams();
    const [isLoading, setIsLoading] = useState(true);   // ensures that we don't attempt to access anything we're not ready to access
    const [surveyJSON, setSurveyJSON] = useState({});  // there might be a better way of storing the result from the GET request
    const [surveyParams, setSurveyParams] = useState({title: 'Placeholder Title', description: 'No Description', tags:[], payout: 0, reserved: 0});
    const [pageIndex, setPageIndex] = useState(0);
    const [addingQuestion, setAddingQuestion] = useState(false);
    const [editingSurveyParams, setEditingSurveyParams] = useState(false);

    useEffect(() => {
        // setIsLoading(false); // comment this out when connected to db
        fetch(`http://localhost:4000/survey/builder/${survey_id}`, 
        {
            method: 'Get', 
            credentials: 'include',
        }
        ).then(res => {
            return res.json()
        })
        .then(response => {
            setIsLoading(false);
            console.log(response.message);
            if (survey_id !== '0') {
                setSurveyJSON(response.surveyJSON);
                setSurveyParams(response.surveyParams);
            }
        });
    }, [survey_id]);
    // question: does useEffect wait for everything inside of it to finish before continuing?
    // the subsequent code assumes so

    if (isLoading) return <div>Builder Loading</div>;

    if (typeof surveyJSON === 'undefined' || typeof surveyParams === 'undefined') {
        return <div>Cannot access survey.</div>
    }

    // This is a long block of code cause I don't want to deal with props and states in children
    if (addingQuestion) {
        const qSurvey = new Model();
        qSurvey.showNavigationButtons = false;
        const qPage = qSurvey.addNewPage();
        const textQuestion = qPage.addNewQuestion('text', 'text');
        textQuestion.title = 'Question';
        textQuestion.isRequired = true;
        const typeQuestion = qPage.addNewQuestion('dropdown', 'type');
        typeQuestion.title = 'Type';
        typeQuestion.isRequired = true;
        typeQuestion.choices = ['text', 'dropdown', 'checkbox'];
        const choices = qPage.addNewQuestion('multipletext', 'choices');
        choices.title = 'Add choices';
        choices.isRequired = true;
        choices.visibleIf = "{type} = 'dropdown' or {type} = 'checkbox'";
        choices.items = [];
        for (let i = 0; i < 6; i++) {
            choices.addItem(`choice${i}`, `Choice ${i+1}`);
        }
        const reqQuestion = qPage.addNewQuestion('checkbox', 'isRequired');
        reqQuestion.title = 'Required?';
        reqQuestion.choices = ['Yes'];
        // saves question being added
        function saveQuestion() {
            // can edit surveyJSON and surveyParams here! (I'm not going to use this as a component)
            const data = qSurvey.getPlainData();
            console.log(data);
            if (typeof data[0].value === 'undefined' || typeof data[1].value === 'undefined') {
                console.log('Required entries not filled.');
                return;
            }
            if (data[1].value === 'dropdown' || data[1].value === 'checkbox') {
                // https://stackoverflow.com/questions/6756104/get-size-of-json-object
                if (typeof data[2].value === 'undefined' || (Object.keys(data[2].value).length < 2 && data[1].value === 'dropdown')) {
                    console.log('Not enough choices.');
                    return;
                }
            }
            const survey = new Model(surveyJSON);
            survey.currentPageNo = pageIndex;
            const currentPage = survey.activePage;
            const question = currentPage.addNewQuestion(`${data[1].value}`);
            question.title = data[0].value;
            if (data[1].value === 'dropdown' || data[1].value === 'checkbox') {
                question.choices = Object.values(data[2].value);
            }
            if (data[3].value.length > 0) question.isRequired = true;
            else question.isRequired = false;
            console.log(data[3].value);
            setSurveyJSON(survey.toJSON());
            setAddingQuestion(false);
        }
        function cancel() {
            setAddingQuestion(false);
        }
        return <div>
            <Survey model={qSurvey}/>
            <button onClick={() => {saveQuestion()}}>Save</button>
            <button onClick={() => {cancel()}}>Cancel</button>
        </div>
    };

    if (editingSurveyParams) {
        const pSurvey = new Model();
        pSurvey.showNavigationButtons = false;
        const pPage = pSurvey.addNewPage();
        const titleQuestion = pPage.addNewQuestion('text');
        titleQuestion.title = 'Survey Title';
        titleQuestion.isRequired = true;
        const descQuestion = pPage.addNewQuestion('text');
        descQuestion.title = 'Decription';
        const tagQuestion = pPage.addNewQuestion('dropdown');
        tagQuestion.title = 'Tag 1';
        tagQuestion.choices = ['Garble', 'Goo', 'Wobble', 'Squabble'];
        const payQuestion = pPage.addNewQuestion('text');
        payQuestion.inputType = 'number';
        payQuestion.title = 'Payout (microAlgos)';
        const reservedQuestion = pPage.addNewQuestion('text');
        reservedQuestion.inputType = 'number';
        reservedQuestion.title = 'Reserved (microAlgos)';
        function saveParams() {
            const data = pSurvey.getPlainData();
            if (data[0].value === null) {
                console.log('Survey title required.');
                return;
            }
            if (data[3].value === null) {
                data[3].value = 0;
            }
            if (data[3].value < 0) {
                console.log('Payout must be positive or 0.');
                return;
            }
            if (data[4].value === null) {
                data[4].value = 0;
            }
            if (data[4].value < 0) {
                console.log('Reserved microAlgos must be positive or 0.');
                return;
            }
            const params = {
                title: data[0].value,
                // does the following short-circuit?
                description: ((data[1].value === null) ? 'No Description' : data[1].value),
                tags: ((typeof data[2].value === 'undefined') ? [] : [data[2].value]),
                payout: data[3].value,
                reserved: data[4].value
            }
            setSurveyParams(params);
            setEditingSurveyParams(false);
        }
        function cancel() {
            setEditingSurveyParams(false);
        }
        return <div>
            <Survey model={pSurvey}/>
            <button onClick={() => {saveParams()}}>Save</button>
            <button onClick={() => {cancel()}}>Cancel</button>
        </div>
    };
    
    // Constructing survey to-be rendered
    const survey = new Model(surveyJSON);
    survey.currentPageNo = pageIndex;   // to restore the page after filling form
    if (survey.pageCount < 1) {
        // initialize survey
        survey.pageNextText = 'Next Page';
        survey.pagePrevText = 'Prev Page';
        survey.showQuestionNumbers = 'off';
        survey.showProgressBar = 'bottom';
        survey.showCompletedPage = false;
    }

    // creating our own custom nav buttons
    survey.showNavigationButtons = 'none';

    // https://surveyjs.io/Examples/Library/?id=survey-afterrender&platform=Reactjs&theme=default#content-js
    survey.onAfterRenderPage.add((survey, options) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerHTML = 'Add Question';
        btn.onclick = () => {
            // bring up modal to add question
            setSurveyJSON(survey.toJSON());
            setPageIndex(survey.currentPageNo);
            setAddingQuestion(true);
        };
        // options: {htmlElement, page}
        // surveyjs changes pages by replacing the page, but not appended elements
        // scuffed way of dealing with this:
        while (options.htmlElement.firstChild.innerHTML === 'Add Question') {
            options.htmlElement.removeChild(options.htmlElement.firstChild);
        }
        options.htmlElement.appendChild(btn);
    });

    survey.onAfterRenderQuestion.add((survey, options) => {
        const btn = document.createElement('button');
        const btn2 = document.createElement('button');
        btn.type = 'button';
        btn2.type = 'button';
        btn.innerHTML = 'Edit Question';
        btn2.innerHTML = 'Delete Question';
        btn.onclick = () => {
            // Edit question (may or may not do)

        };
        btn2.onclick = () => {
            // Delete question
            if (options.question.parent.questions.length === 1) {
                removePage();
            } else {
                options.question.parent.removeQuestion(options.question);
            }
        };
        //options.htmlElement.appendChild(btn); // I may or may not implement this
        options.htmlElement.appendChild(btn2);
        const up = document.createElement('button');
        const down = document.createElement('button');
        up.type = 'button';
        down.type = 'button';
        up.innerHTML = 'Up';
        down.innerHTML = 'Down';
        up.onclick = () => {
            let page = options.question.parent;
            const currentIndex = page.questions.indexOf(options.question);
            if (currentIndex > 0) {
                page.removeQuestion(options.question);
                page.addQuestion(options.question, currentIndex-1);
            }
        }
        down.onclick = () => {
            let page = options.question.parent;
            const currentIndex = page.questions.indexOf(options.question);
            if (currentIndex < page.questions.length-1) {
                page.removeQuestion(options.question);
                page.addQuestion(options.question, currentIndex+1);
            }
        }
        options.htmlElement.appendChild(up);
        options.htmlElement.appendChild(down);
    });

    function addNewPage() {
        const new_page = survey.addNewPage();
        const placeholder_question = new_page.addNewQuestion('text');
        placeholder_question.title = 'Placeholder Question';
        survey.currentPage = new_page;
    }

    function removePage() {
        const page = survey.currentPage;
        survey.prevPage();
        survey.removePage(page);
    }

    function saveSurvey() {
        const full_json = {
            surveyJSON: survey.toJSON(),
            surveyParams: surveyParams
        };

        // if survey_id is 0, we will create a new survey
        fetch(`http://localhost:4000/survey/builder/${survey_id}`, 
            {
                method: 'Post', 
                headers: {'Content-Type': 'application/json'},
                withCredentials: true,
                credentials: 'include',
                body: JSON.stringify(full_json)
            }
            ).then(res => {
                return res.json()
            })
            .then(response => {
                console.log(response);
                if (survey_id === '0') navigate(`/survey/builder/${response.survey_id}`);
            });
    }

    function editSurveyParams() {
        setSurveyJSON(survey.toJSON());
        setPageIndex(survey.currentPageNo);
        setEditingSurveyParams(true);
    }

    return <div>
        <div>Survey Title: {surveyParams.title}</div>
        <div>Description: {surveyParams.description}</div>
        <div>Tags: {(surveyParams.tags.length < 1) ? 'None' : surveyParams.tags}</div>
        <div>Payout: {surveyParams.payout} microAlgos</div>
        <div>Reserved: {surveyParams.reserved} microAlgos</div>
        <div><Survey model={survey}/></div>
        <div>
            <button onClick={() => {survey.prevPage()}}>Prev Page</button>
            <button onClick={() => {survey.nextPage()}}>Next Page</button>
        </div>
        <div>
            <button onClick={() => {removePage()}}>Remove Page</button>
            <button onClick={() => {addNewPage()}}>Add Page</button>
        </div>
        <div>
            <button onClick={() => {editSurveyParams()}}>Edit Survey Attributes</button>
            <button onClick={() => {saveSurvey()}}>Save Survey</button>
        </div>
    </div>;
}

export default Builder;