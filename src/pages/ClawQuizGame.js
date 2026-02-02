import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api";
import "../styles/ClawQuizGame.css";

export default function ClawQuizGame() {
  const navigate = useNavigate();

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
  const [personalityType, setPersonalityType] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);

  const optionRefs = useRef([]);
  const clawRef = useRef(null);

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

  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes/claw")
      .then((res) => res.json())
      .then((data) => {
        const formatted = (data.questions || []).map((q) => ({
          id: q.question_id,
          text: q.question,
          options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
        }));

        setQUESTIONS(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load quiz questions", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    bgSound.current = createAudio("/sounds/ClawMachineBackground.mp3", true, 0.3);
    motorSound.current = createAudio("/sounds/clawdrop.mp3", false, 0.4);
    grabSound.current = createAudio("/sounds/grab.mp3", false, 0.5);
    winSound.current = createAudio("/sounds/win.mp3", false, 0.6);

    safePlay(bgSound);
    return () => safePause(bgSound);
  }, []);

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

  const finishQuiz = async (finalAnswers) => {
    const raw = localStorage.getItem("gameResults");
    const gameResults = raw ? JSON.parse(raw) : {};

    gameResults.clawGame = {
      completed: true,
      answers: finalAnswers,
      completedAt: Date.now(),
    };

    localStorage.setItem("gameResults", JSON.stringify(gameResults));

    // Show modal and start AI analysis
    setAnalyzingAI(true);
    setMiniInsight(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/quizzes/claw/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: finalAnswers }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analysis) {
          setAiAnalysis(data.analysis);
          setPersonalityType(data.analysis.personalityType || "Unique Individual");
        }
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
      // Fallback to simple personality
      const personalities = [
        "You are a true People Person! 🤝",
        "You are a Creative Soul! 🎨",
        "You are an Adventurous Spirit! 🌍",
        "You are a Knowledge Seeker! 📚",
        "You are a Nature Lover! 🌿"
      ];
      setPersonalityType(personalities[Math.floor(Math.random() * personalities.length)]);
    } finally {
      setAnalyzingAI(false);
      safePlay(winSound);
    }
  };

  const handleCloseInsight = () => {
    setMiniInsight(null);
    setShowEnding(true);
  };

  if (loading) return <div className="claw-page">Loading game...</div>;
  if (!QUESTIONS.length) return <div className="claw-page">No questions found.</div>;

  return (
    <div className="claw-page">
      <div className="machine-area">
        <div className="question-squirrel">
          🐿️
          <div className="speech-bubble">
            {showEnding
              ? "Great job! Let's head to the Castle next..."
              : QUESTIONS[questionIndex].text}
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
                    className={`option ${grabbedIndex === i ? "grabbed" : ""}`}
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
                <div
                  className="portal-button"
                  onClick={() => navigate("/game-map")}
                >
                  <span>Continue Journey</span>
                </div>
              </div>
            )}
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
            {analyzingAI ? (
              <>
                <div className="processing-container">
                  <div className="insight-icon magical-glow">🔮</div>
                  <h1>Analyzing Your Choices</h1>
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                  </div>
                  <p className="analyzing-text">Our AI is reading your personality...</p>
                  <div className="sparkles">
                    <span>✨</span>
                    <span>⭐</span>
                    <span>✨</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="success-header">
                  <div className="celebration-icons">
                    <span className="float-icon">🎉</span>
                    <span className="float-icon delay-1">✨</span>
                    <span className="float-icon delay-2">🎊</span>
                  </div>
                  <div className="insight-icon celebration">🏆</div>
                  <h1 className="success-title">Amazing Work!</h1>
                </div>
                
                <div className="personality-badge">
                  <div className="badge-decoration">✨</div>
                  <h2 className="personality-type">{personalityType}</h2>
                  <div className="badge-decoration">✨</div>
                </div>
                
                {aiAnalysis?.encouragingMessage && (
                  <div className="encouraging-message">
                    <div className="message-icon">💫</div>
                    <p className="encourage-text">{aiAnalysis.encouragingMessage}</p>
                  </div>
                )}

                <div className="next-game-hint">
                  <div className="hint-icon">🎮</div>
                  <p>
                    <strong>Keep the momentum going!</strong><br/>
                    Your complete personality profile and hobby recommendations await at the final stage.
                  </p>
                  <div className="hint-arrow">→</div>
                </div>

                <button className="final-btn" onClick={handleCloseInsight}>
                  <span className="btn-icon">🚀</span>
                  <span>Continue to Next Game</span>
                  <span className="btn-shine"></span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
