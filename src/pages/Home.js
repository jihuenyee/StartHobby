import React from "react";
import { Link } from "react-router-dom";
import '../styles/Home.css';

function Home() {
  return (
    <div className="homepage">
      <br></br>
    <img src="/squirrel.png" alt="squirrel" style={{ width: '100%', maxWidth: '500px', height: 'auto' }} /> 
    <Link to="/squirrel-game" className="gamebtn">Test</Link>
    <Link to="/game" className="gamebtn">Start</Link>
    {/* <div className="quiz">
      <div className="quiz-content">
        <div className="quiz-header">
          <div className="quizqn">Looking for a Hobby?</div>
          <Link to="/quiz" className="quizbtn">Start Now</Link>
        </div>
        <div className="quizbio">
          Do our StartHobby Quiz to find out which hobby is for you!
        </div>
      </div>
    </div> */}
  </div>
  );
}
export default Home;