import {Link} from 'react-router-dom';

function Published() {
    return <div>
        <div>Published Page</div>
        <div><Link to='/survey/builder/0'>Create New Survey</Link></div>
    </div>;
}

export default Published;