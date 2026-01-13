import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-page">
      {/* 🌿 Decorative background */}
      <div className="home-bg" />

      {/* 🐿️ Main Card */}
      <div className="home-card">
        <div className="squirrel-hero">🐿️</div>

        <h1 className="home-title">
          Squirrel Rescue Adventure
        </h1>

        <p className="home-subtitle">
          Help a lost baby squirrel find its way home by answering
          simple hobby questions.
        </p>

        <div className="home-rules">
          <div className="rule-item">❓ Simple multiple-choice questions</div>
          <div className="rule-item">🕒 No time pressure</div>
          <div className="rule-item">🌲 Story-driven journey</div>
        </div>

        <Link to="/story" className="home-start-btn">
          Begin Adventure
        </Link>
      </div>

      {/* 🌼 Footer hint */}
      <p className="home-hint">
        Your answers will shape the hobbies suggested to you ✨
      </p>
    </div>
  );
}

export default Home;
