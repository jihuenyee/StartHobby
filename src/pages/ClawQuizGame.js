import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ClawQuizGame.css";

/* =====================
   QUESTIONS
===================== */
const QUESTIONS = [
  {
    text: "What kind of activities do you enjoy most?",
    options: ["DIY projects", "Outdoor fun", "Reading", "Group activities"],
  },
  {
    text: "How do you usually spend your free time?",
    options: ["Relaxing alone", "Being active", "Learning new things", "Socialising"],
  },
  {
    text: "Which environment feels most comfortable to you?",
    options: ["Home", "Nature", "Libraries / cafés", "Crowded places"],
  },
];

const ENDING_TEXTS = [
  "Nice choices. You’re learning more about yourself.",
  "Every answer brings you closer to your perfect hobby.",
  "Great job! Let’s see what fits you best…",
];

export default function ClawQuizGame() {
  const navigate = useNavigate();

  /* =====================
     STATE
  ===================== */
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);

  const [clawX, setClawX] = useState(50);
  const [ropeHeight, setRopeHeight] = useState(60);
  const [closed, setClosed] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const [grabbedIndex, setGrabbedIndex] = useState(null);

  const [typedQuestion, setTypedQuestion] = useState("");
  const [showEnding, setShowEnding] = useState(false);
  const [typedEnding, setTypedEnding] = useState("");

  const optionRefs = useRef([]);
  const clawRef = useRef(null);

  /* =====================
     SOUNDS
  ===================== */
  const bgSound = useRef(null);
  const motorSound = useRef(null);
  const grabSound = useRef(null);

  useEffect(() => {
    bgSound.current = new Audio("/sounds/ClawMachineBackground.mp3");
    bgSound.current.loop = true;
    bgSound.current.volume = 0.35;
    bgSound.current.play().catch(() => {});

    motorSound.current = new Audio("/sounds/clawdrop.mp3");
    motorSound.current.volume = 0.4;

    grabSound.current = new Audio("/sounds/grab.mp3");
    grabSound.current.volume = 0.5;

    return () => {
      bgSound.current.pause();
      bgSound.current.currentTime = 0;
    };
  }, []);

  /* =====================
     TYPE QUESTION
  ===================== */
  useEffect(() => {
    let i = 0;
    setTypedQuestion("");
    const text = QUESTIONS[questionIndex].text;

    const interval = setInterval(() => {
      if (i < text.length) {
        setTypedQuestion((prev) => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [questionIndex]);

  /* =====================
     GRAB SEQUENCE
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

    const targetX =
      ((optionRect.left + optionRect.width / 2 - machine.left) /
        machine.width) *
      100;

    const targetRope =
      optionRect.top + optionRect.height / 2 - clawRect.top - 30;

    /* MOVE */
    motorSound.current.play();
    setClawX(targetX);
    await wait(500);

    /* DROP */
    setRopeHeight(targetRope);
    await wait(600);

    /* GRAB */
    grabSound.current.play();
    setClosed(true);
    await wait(300);

    /* LIFT (THIS WAS MISSING BEFORE) */
    setGrabbedIndex(index);
    setRopeHeight(60);
    await wait(700);

    motorSound.current.pause();
    motorSound.current.currentTime = 0;

    const newAnswers = [
      ...answers,
      {
        question: QUESTIONS[questionIndex].text,
        answer: QUESTIONS[questionIndex].options[index],
      },
    ];
    setAnswers(newAnswers);

    /* RESET */
    setClosed(false);
    setGrabbedIndex(null);
    setGrabbing(false);

    /* NEXT */
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((q) => q + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  /* =====================
     FINISH
  ===================== */
  const finishQuiz = (finalAnswers) => {
    const raw = localStorage.getItem("gameResults");
    const gameResults = raw ? JSON.parse(raw) : {};

    gameResults.clawGame = {
      completed: true,
      answers: finalAnswers,
      completedAt: Date.now(),
    };

    localStorage.setItem("gameResults", JSON.stringify(gameResults));

    setShowEnding(true);

    const msg =
      ENDING_TEXTS[Math.floor(Math.random() * ENDING_TEXTS.length)];

    typeEnding(msg);
  };

  const typeEnding = (text) => {
    let i = 0;
    setTypedEnding("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setTypedEnding((p) => p + text[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 35);
  };

  return (
    <div className="claw-page">
      <div className="machine-area">

        {/* 🐿️ QUESTION SQUIRREL (LEFT SIDE) */}
        <div className="question-squirrel">
          🐿️
          <div className="speech-bubble">
            {showEnding ? typedEnding : typedQuestion}
          </div>
        </div>

        <div className="machine-frame">
          {/* Corner bolts */}
          <div className="corner-bolt top-left"></div>
          <div className="corner-bolt top-right"></div>
          <div className="corner-bolt bottom-left"></div>
          <div className="corner-bolt bottom-right"></div>

          <div className="machine-inner">

            {/* CLAW */}
            <div
              className="claw-wrapper"
              ref={clawRef}
              style={{ left: `${clawX}%` }}
            >
              <div className="rope" style={{ height: `${ropeHeight}px` }} />
              <div className="hinge" />
              <div className="hinge-arm" />
              <div className={`claw ${closed ? "closed" : ""}`}>
                <div className="prong left" />
                <div className="prong right" />
              </div>
            </div>

            {/* OPTIONS */}
            {!showEnding && (
              <div className="options">
                {QUESTIONS[questionIndex].options.map((opt, i) => (
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

            {/* END */}
            {showEnding && (
              <div className="ending-message">
                <button
                  className="start-btn"
                  onClick={() => navigate("/game-map")}
                >
                  Continue
                </button>
              </div>
            )}

          </div>

          {/* Control Panel */}
          <div className="control-panel">
            <div className="coin-slot">
              <div className="coin-label">INSERT COIN</div>
              <div className="slot"></div>
            </div>
            <div className="joystick-indicator">🕹️</div>
            <div className="prize-chute">
              <div className="chute-label">PRIZE CHUTE</div>
              <div className="chute-door"></div>
            </div>
          </div>
        </div>

      </div>

      {!showEnding && (
        <p className="question-count">
          Question {questionIndex + 1} / {QUESTIONS.length}
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
