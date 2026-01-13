import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="start-quiz">

      <h1>🐿️ Squirrel Rescue Quiz</h1>

      <p className="intro-text">
        You will answer simple hobby-related questions.
        Each correct answer helps a baby squirrel move closer to home.
      </p>

      <div className="rules">
        <div>❓ Multiple-choice questions</div>
        <div>🕒 No time limit</div>
        <div>🌲 Story-driven adventure</div>
      </div>

      <Link to="/story" className="begin-btn">
        Begin Adventure
      </Link>

    </div>
  );
}

export default Home;
