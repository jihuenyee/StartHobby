import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ClawQuizGame.css";

const OPTIONS = [
  "DIY projects",
  "Outdoor fun",
  "Reading",
  "Group activities",
];

const INSPIRATION_TEXTS = [
  "Nice choice. Sometimes curiosity leads us to unexpected paths.",
  "Every small preference shapes who we are becoming.",
  "You’re discovering what excites you — keep going.",
  "This journey is just getting interesting…"
];

export default function ClawQuizGame() {
  const navigate = useNavigate();

  /* =====================
     STATE
  ===================== */
  const [clawX, setClawX] = useState(50);
  const [ropeHeight, setRopeHeight] = useState(60);
  const [closed, setClosed] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const [grabbedIndex, setGrabbedIndex] = useState(null);

  const [answers, setAnswers] = useState([]);
  const [showEnding, setShowEnding] = useState(false);
  const [typedText, setTypedText] = useState("");

  const optionRefs = useRef([]);
  const clawRef = useRef(null);

  /* =====================
     CORE GRAB SEQUENCE
  ===================== */
  const grabOption = async (index) => {
    if (grabbing || showEnding) return;
    setGrabbing(true);

    const option = optionRefs.current[index];
    const machine = document
      .querySelector(".machine-inner")
      .getBoundingClientRect();

    const optionRect = option.getBoundingClientRect();
    const clawRect = clawRef.current.getBoundingClientRect();

    // 🎯 Horizontal alignment
    const targetX =
      ((optionRect.left + optionRect.width / 2 - machine.left) /
        machine.width) *
      100;

    // 🎯 Vertical alignment (rope length)
    const targetRope =
      optionRect.top +
      optionRect.height / 2 -
      clawRect.top -
      30;

    /* 1️⃣ MOVE */
    setClawX(targetX);
    await wait(500);

    /* 2️⃣ DROP */
    setRopeHeight(targetRope);
    await wait(600);

    /* 3️⃣ CLOSE */
    setClosed(true);
    await wait(350);

    /* 4️⃣ LIFT */
    setGrabbedIndex(index);
    setRopeHeight(60);
    await wait(700);

    /* SAVE ANSWER */
    const newAnswers = [...answers, OPTIONS[index]];
    setAnswers(newAnswers);

    /* RESET CLAW */
    setClosed(false);
    setGrabbedIndex(null);
    setGrabbing(false);

    /* FINISH QUIZ */
    if (newAnswers.length === OPTIONS.length) {
      finishQuiz(newAnswers);
    }
  };

  /* =====================
     FINISH QUIZ
  ===================== */
  const finishQuiz = (finalAnswers) => {
    // Save raw answers (for AI later)
    localStorage.setItem("clawQuiz", JSON.stringify(finalAnswers));

    // ✅ MARK GAME AS COMPLETED (IMPORTANT)
    const raw = localStorage.getItem("gameResults");
    const gameResults = raw ? JSON.parse(raw) : {};

    gameResults.clawGame = {
      completed: true,
      answers: finalAnswers,
      completedAt: Date.now()
    };

    localStorage.setItem("gameResults", JSON.stringify(gameResults));

    setShowEnding(true);

    const message =
      INSPIRATION_TEXTS[
        Math.floor(Math.random() * INSPIRATION_TEXTS.length)
      ];

    typeText(message, () => {
      setTimeout(() => {
        navigate("/game-map");
      }, 1400);
    });
  };

  /* =====================
     TYPEWRITER EFFECT
  ===================== */
  const typeText = (text, done) => {
    let i = 0;
    setTypedText("");

    const interval = setInterval(() => {
      setTypedText((prev) => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        done && done();
      }
    }, 35);
  };

  return (
    <div className="claw-page">
      <div className="machine-frame">
        <div className="machine-inner">

          {/* =====================
              CLAW
          ===================== */}
          <div
            className="claw-wrapper"
            ref={clawRef}
            style={{ left: `${clawX}%` }}
          >
            <div
              className="rope"
              style={{ height: `${ropeHeight}px` }}
            />
            <div className="hinge" />
            <div className="hinge-arm" />
            <div className={`claw ${closed ? "closed" : ""}`}>
              <div className="prong left" />
              <div className="prong right" />
            </div>
          </div>

          {/* =====================
              OPTIONS
          ===================== */}
          {!showEnding && (
            <div className="options">
              {OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  ref={(el) => (optionRefs.current[i] = el)}
                  className={`option ${
                    grabbedIndex === i ? "grabbed" : ""
                  }`}
                  onClick={() => grabOption(i)}
                  disabled={grabbing}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* =====================
              ENDING MESSAGE
          ===================== */}
          {showEnding && (
            <div className="ending-message">
              <p>{typedText}</p>
            </div>
          )}

        </div>
      </div>

      {!showEnding && (
        <p className="question-count">
          Choices made: {answers.length} / {OPTIONS.length}
        </p>
      )}
    </div>
  );
}

/* =====================
   UTILITY
===================== */
function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
