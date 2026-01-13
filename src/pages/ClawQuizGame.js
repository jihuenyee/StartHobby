import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ClawQuizGame.css";

const QUESTIONS = [
  { options: ["Making things", "Moving around", "Quiet learning", "Meeting people"] },
  { options: ["DIY projects", "Outdoor fun", "Reading", "Group activities"] },
  { options: ["Hands-on", "Energetic", "Focused", "Social"] }
];

function ClawQuizGame() {
  const navigate = useNavigate();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [grabIndex, setGrabIndex] = useState(null);
  const [clawDown, setClawDown] = useState(false);
  const [answers, setAnswers] = useState([]);

  const handleGrab = (text, index) => {
    if (grabIndex !== null) return;

    setGrabIndex(index);
    setClawDown(true);

    setTimeout(() => {
      setAnswers(prev => [...prev, text]);

      setTimeout(() => {
        if (questionIndex < QUESTIONS.length - 1) {
          setQuestionIndex(prev => prev + 1);
          setGrabIndex(null);
          setClawDown(false);
        } else {
          // Save ONLY raw answers
          const stored = JSON.parse(localStorage.getItem("gameResults"));
          stored.game1 = [...answers, text];
          localStorage.setItem("gameResults", JSON.stringify(stored));
          navigate("/game-map");
        }
      }, 600);
    }, 900);
  };

  return (
    <div className="claw-page">
      <div className="machine">
        {/* CLAW */}
        <div
          className={`claw ${clawDown ? "down" : ""}`}
          style={{
            left: grabIndex !== null ? `${20 + grabIndex * 20}%` : "50%"
          }}
        >
          🪝
        </div>

        {/* OPTIONS */}
        <div className="items">
          {QUESTIONS[questionIndex].options.map((text, i) => (
            <div
              key={i}
              className={`item ${grabIndex === i ? "grabbed" : ""}`}
              onClick={() => handleGrab(text, i)}
            >
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className="progress">
        Question {questionIndex + 1} / {QUESTIONS.length}
      </div>
    </div>
  );
}

export default ClawQuizGame;
