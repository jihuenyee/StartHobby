import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ClawQuizGame.css";

export default function ClawQuizGame() {
  const navigate = useNavigate();

  /* =====================
     STATE
  ===================== */
  const [QUESTIONS, setQUESTIONS] = useState([]);
  const [loading, setLoading] = useState(true);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [clawX, setClawX] = useState(50);
  const [ropeHeight, setRopeHeight] = useState(60);
  const [closed, setClosed] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const [grabbedIndex, setGrabbedIndex] = useState(null);
  const [showEnding, setShowEnding] = useState(false);
  const [miniInsight, setMiniInsight] = useState(null);

  const optionRefs = useRef([]);
  const clawRef = useRef(null);

  /* =====================
     AUDIO
  ===================== */
  const bgSound = useRef(null);
  const motorSound = useRef(null);
  const grabSound = useRef(null);
  const winSound = useRef(null);

  const createAudio = (path, loop = false, volume = 1.0) => {
    const audio = new Audio(path);
    audio.loop = loop;
    audio.volume = volume;
    audio.onerror = () => console.warn(`Missing audio: ${path}`);
    return audio;
  };

  const safePlay = (audioRef) => {
    if (audioRef.current) audioRef.current.play().catch(() => {});
  };

  const safePause = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  /* =====================
     FETCH QUESTIONS FROM DB
  ===================== */
  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes/claw")
      .then((res) => res.json())
      .then((data) => {
        setQUESTIONS(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load quiz questions", err);
        setLoading(false);
      });
  }, []);

  /* =====================
     AUDIO INIT
  ===================== */
  useEffect(() => {
    bgSound.current = createAudio("/sounds/ClawMachineBackground.mp3", true, 0.3);
    motorSound.current = createAudio("/sounds/clawdrop.mp3", false, 0.4);
    grabSound.current = createAudio("/sounds/grab.mp3", false, 0.5);
    winSound.current = createAudio("/sounds/win.mp3", false, 0.6);

    safePlay(bgSound);
    return () => safePause(bgSound);
  }, []);



  /* =====================
     GRAB LOGIC
  ===================== */
  const grabOption = async (index) => {
    if (grabbing || showEnding || miniInsight) return;
    setGrabbing(true);

    const option = optionRefs.current[index];
    const machine = document
      .querySelector(".machine-inner")
      .getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();

    const targetX =
      ((optionRect.left + optionRect.width / 2 - machine.left) /
        machine.width) *
      100;

    const clawHeadHeight = 60;
    const distanceToDrop =
      optionRect.top - machine.top + optionRect.height / 2 - clawHeadHeight;

    safePlay(motorSound);
    setClawX(targetX);
    await wait(800);

    setRopeHeight(distanceToDrop);
    await wait(1000);

    safePlay(grabSound);
    setClosed(true);
    await wait(400);

    setGrabbedIndex(index);
    setRopeHeight(60);
    await wait(1000);

    safePause(motorSound);

    const newAnswers = [
      ...answers,
      {
        question: QUESTIONS[questionIndex].text,
        answer: QUESTIONS[questionIndex].options[index],
      },
    ];
    setAnswers(newAnswers);

    setClosed(false);
    setGrabbedIndex(null);
    setGrabbing(false);

    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((q) => q + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  /* =====================
     FINISH QUIZ
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

    safePlay(winSound);
    setMiniInsight("Claw Machine Cleared! 🎉");
  };

  const handleCloseInsight = () => {
    setMiniInsight(null);
    setShowEnding(true);

  };

  /* =====================
     LOADING GUARD
  ===================== */
  if (loading) {
    return <div className="claw-page">Loading game...</div>;
  }

  if (!QUESTIONS.length) {
    return <div className="claw-page">No questions found.</div>;
  }

  /* =====================
     RENDER
  ===================== */
  return (
    <div className="claw-page">
      <div className="machine-area">
        <div className="question-squirrel">
          🐿️
          <div className="speech-bubble">
            {showEnding ? "Great job! Let's head to the Castle next..." : QUESTIONS[questionIndex]?.text}
          </div>
        </div>

        <div className="machine-frame">
          <div className="machine-inner">
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

            {showEnding && (
              <div className="ending-message">
                <button
                  className="start-btn"
                  onClick={() => navigate("/game-map")}
                >
                  Continue Journey
                </button>
              </div>
            )}
          </div>

          {/* Corner Bolts */}
          <div className="corner-bolt top-left" />
          <div className="corner-bolt top-right" />
          <div className="corner-bolt bottom-left" />
          <div className="corner-bolt bottom-right" />

          {/* Control Panel */}
          <div className="control-panel">
            <div className="coin-slot">
              <div className="coin-label">INSERT COIN</div>
              <div className="slot" />
            </div>
            <div className="joystick-indicator">🕹️</div>
            <div className="prize-chute">
              <div className="chute-label">PRIZE</div>
              <div className="chute-door" />
            </div>
          </div>
        </div>
      </div>

      {!showEnding && (
        <p className="question-count">
          Question {questionIndex + 1} / {QUESTIONS.length}
        </p>
      )}

      {miniInsight && (
        <div className="modal-overlay">
          <div className="insight-card">
            <h1>Claw Machine Cleared!</h1>
            <button className="start-btn" onClick={handleCloseInsight}>
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
