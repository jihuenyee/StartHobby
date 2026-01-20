import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ClawQuizGame.css";

/* =====================
   HOBBY DISCOVERY QUESTIONS
===================== */
const QUESTIONS = [
  {
    text: "It's a free Saturday! What is your first instinct?",
    options: [
      "Create something new 🎨",  
      "Go outside and move 🏃",   
      "Solve a tricky puzzle 🧩", 
      "Call some friends 📞"      
    ],
  },
  {
    text: "Pick an object to take on an adventure:",
    options: [
      "Sketchbook & Pen ✏️",     
      "Hiking Boots 🥾",         
      "Map & Compass 🧭",        
      "Camera to share 📸"       
    ],
  },
  {
    text: "What brings you the most satisfaction?",
    options: [
      "Expressing myself ✨",     
      "Breaking a sweat 💦",      
      "Learning how it works ⚙️", 
      "Helping others 🤝"         
    ],
  },
];

const ENDING_TEXTS = [
  "Interesting choices! I'm getting a vibe from you...",
  "Every answer brings you closer to your perfect hobby.",
  "Great job! Let’s head to the Castle next...",
];

export default function ClawQuizGame() {
  const navigate = useNavigate();

  /* STATE */
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
  const [miniInsight, setMiniInsight] = useState(null);

  const optionRefs = useRef([]);
  const clawRef = useRef(null);

  /* SAFE AUDIO */
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
    bgSound.current = createAudio("/sounds/ClawMachineBackground.mp3", true, 0.3);
    motorSound.current = createAudio("/sounds/clawdrop.mp3", false, 0.4);
    grabSound.current = createAudio("/sounds/grab.mp3", false, 0.5);
    winSound.current = createAudio("/sounds/win.mp3", false, 0.6);

    safePlay(bgSound);

    return () => {
      safePause(bgSound);
    };
  }, []);

  /* TYPEWRITER */
  useEffect(() => {
    if (showEnding || miniInsight) return;
    
    let i = 0;
    setTypedQuestion("");
    const text = QUESTIONS[questionIndex].text;

    const interval = setInterval(() => {
      setTypedQuestion((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 35);

    return () => clearInterval(interval);
  }, [questionIndex, showEnding, miniInsight]);

  /* GRAB LOGIC */
  const grabOption = async (index) => {
    if (grabbing || showEnding || miniInsight) return;
    setGrabbing(true);

    const option = optionRefs.current[index];
    const machine = document.querySelector(".machine-inner").getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();
    
    if (!machine || !optionRect) return;

    const targetX = ((optionRect.left + optionRect.width / 2 - machine.left) / machine.width) * 100;
    
    // Adjusted Calculation for the new CSS layout
    const clawHeadHeight = 60; 
    const distanceToDrop = (optionRect.top - machine.top) + (optionRect.height / 2) - clawHeadHeight;

    /* ANIMATION */
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

    /* RESET */
    setClosed(false);
    setGrabbedIndex(null);
    setGrabbing(false);

    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex((q) => q + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  /* FINISH */
  const finishQuiz = (finalAnswers) => {
    const raw = localStorage.getItem("gameResults");
    const gameResults = raw ? JSON.parse(raw) : {};

    const types = finalAnswers.map(a => {
        const text = a.answer;
        if(text.includes("Create") || text.includes("Sketchbook") || text.includes("Express")) return "Creative";
        if(text.includes("Move") || text.includes("Hiking") || text.includes("Sweat")) return "Active";
        if(text.includes("Call") || text.includes("Share") || text.includes("Helping")) return "Social";
        return "Strategic";
    });

    gameResults.clawGame = {
      completed: true,
      answers: finalAnswers,
      types: types,
      completedAt: Date.now(),
    };
    localStorage.setItem("gameResults", JSON.stringify(gameResults));

    const counts = {};
    types.forEach(t => counts[t] = (counts[t] || 0) + 1);
    const dominant = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    let message = "";
    if (dominant === "Creative") message = "Oh! I see you have a Creative soul! 🎨";
    else if (dominant === "Active") message = "Oh! I see you're a Sporty person! 🏃";
    else if (dominant === "Social") message = "Oh! I see you're a Social butterfly! 🦋";
    else message = "Oh! I see you have a Strategic mind! 🧠";

    safePlay(winSound);
    setMiniInsight(message);
  };

  const handleCloseInsight = () => {
    setMiniInsight(null);
    setShowEnding(true); 
    const msg = ENDING_TEXTS[Math.floor(Math.random() * ENDING_TEXTS.length)];
    typeEnding(msg);
  };

  const typeEnding = (text) => {
    let i = 0;
    setTypedEnding("");
    const interval = setInterval(() => {
      setTypedEnding((p) => p + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 35);
  };

  return (
    <div className="claw-page">
      <div className="machine-area">

        <div className="question-squirrel">
          🐿️
          <div className="speech-bubble">
            {showEnding ? typedEnding : typedQuestion}
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
            <div style={{ fontSize: "50px", margin: "10px 0" }}>💡</div>
            <h2>{miniInsight}</h2>
            <p>That was interesting... let's keep going!</p>
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