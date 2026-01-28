import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ResultScreen.css";

export default function ResultScreen() {
  const navigate = useNavigate();

  return (
    <div className="result-page">
      <h1>✨ First Clue Discovered!</h1>
      <p>
        The squirrel learned something new about you.
        <br />
        Let’s continue the journey.
      </p>

      <button onClick={() => navigate("/game-map")}>
        Return to Forest Map
      </button>
    </div>
  );
}
