import globalStyles from './global.module.css';

function Home() {
    return <div>
        <h1>SurveU</h1>
        <img className={globalStyles.shift} src={require('../imgs/usmell.jpeg')} alt='u_smell'></img>
    </div>;
}

export default Home;