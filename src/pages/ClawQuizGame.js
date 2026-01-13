import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ClawQuizGame.css";

const QUESTIONS = [
  {
    options: ["Making things", "Moving around", "Quiet learning", "Meeting people"]
  },
  {
    options: ["DIY projects", "Outdoor fun", "Reading", "Group activities"]
  },
  {
    options: ["Hands-on", "Energetic", "Focused", "Social"]
  }
];

function ClawQuizGame() {
  const navigate = useNavigate();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [clawDown, setClawDown] = useState(false);
  const [clawX, setClawX] = useState(50);

  const [answers, setAnswers] = useState([]);

  const handleSelect = (answer, index) => {
    if (selectedIndex !== null) return;

    setSelectedIndex(index);
    setClawX(25 + index * 25);
    setClawDown(true);

    setTimeout(() => {
      setAnswers(prev => [...prev, answer]);
      setClawDown(false);

      setTimeout(() => {
        if (questionIndex < QUESTIONS.length - 1) {
          setQuestionIndex(prev => prev + 1);
          setSelectedIndex(null);
        } else {
          // ✅ SAVE RAW ANSWERS ONLY
          const stored =
            JSON.parse(localStorage.getItem("gameResults")) || {};

          stored.game1 = answers.concat(answer);

          localStorage.setItem("gameResults", JSON.stringify(stored));

          navigate("/game-map");
        }
      }, 700);
    }, 900);
  };

  return (
    <div className="claw-page">
      <div className="machine">
        {/* 🪝 CLAW */}
        <div
          className="claw"
          style={{
            left: `${clawX}%`,
            top: clawDown ? "55%" : "0%"
          }}
        >
          🪝
        </div>

        {/* 🎯 OPTIONS */}
        <div className="balls">
          {QUESTIONS[questionIndex].options.map((text, i) => (
            <div
              key={i}
              className={`ball ${selectedIndex === i ? "grabbed" : ""}`}
              onClick={() => handleSelect(text, i)}
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
