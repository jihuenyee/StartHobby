import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SnakeLadderGame.css";

const BOARD_SIZE = 25;
const REQUIRED_QUESTIONS = 5;
const SNAKES = { 14: 4, 19: 8, 22: 20, 24: 16 };
const LADDERS = { 3: 11, 6: 17, 9: 18, 10: 12 };

const API_BASE = process.env.NODE_ENV === "production"
    ? "https://starthobbybackend-production.up.railway.app"
    : "http://localhost:5000";

const SnakeLadderGame = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState(1); // Starts at 1
  const [isRolling, setIsRolling] = useState(false);
  const [diceNum, setDiceNum] = useState(1);
  const [statusMsg, setStatusMsg] = useState("Roll to start!");
  const [modalData, setModalData] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerTypes, setAnswerTypes] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [miniInsight, setMiniInsight] = useState(null);

  // Audio refs
  const sounds = {
    click: useRef(new Audio("/sounds/click.mp3")),
    up: useRef(new Audio("/sounds/slideUP.mp3")),
    down: useRef(new Audio("/sounds/slideDOWN.mp3")),
    bg: useRef(new Audio("/sounds/SnakeLadder.mp3")),
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/quizzes/snake`)
      .then(res => res.json())
      .then(data => {
        const qData = Array.isArray(data) ? data : (data.questions || []);
        const formatted = qData.map(q => ({
          id: q.id, q: q.question,
          options: [
            { text: q.option_a, type: "Active" },
            { text: q.option_b, type: "Strategic" },
            { text: q.option_c, type: "Creative" },
            { text: q.option_d, type: "Social" }
          ]
        }));
        setQuestions(formatted.sort(() => Math.random() - 0.5));
        setLoading(false);
      }).catch(() => setLoading(false));

    sounds.bg.current.loop = true;
    sounds.bg.current.volume = 0.3;
    sounds.bg.current.play().catch(() => {});
    return () => sounds.bg.current.pause();
  }, []);

  const handleRollDice = () => {
    if (isRolling || modalData || isFinished) return;
    sounds.click.current.play();
    setIsRolling(true);
    setStatusMsg("Rolling...");

    const rollInt = setInterval(() => setDiceNum(Math.floor(Math.random() * 6) + 1), 80);

    setTimeout(() => {
      clearInterval(rollInt);
      let targetTile = 1;
      const turn = answers.length;

      // STRICT PATH SCRIPT
      if (turn === 0) targetTile = 3;  
      else if (turn === 1) targetTile = 14; 
      else if (turn === 2) targetTile = 9;  
      else if (turn === 3) targetTile = 20; 
      else if (turn === 4) targetTile = 23; 
      else if (turn === 5) targetTile = 25; // 6th Roll always finishes
      
      setDiceNum(targetTile - position > 0 ? targetTile - position : 1);
      setPosition(targetTile);
      setTimeout(() => checkTile(targetTile), 800);
    }, 800);
  };

  const checkTile = (curr) => {
    if (SNAKES[curr]) {
      setStatusMsg("🐍 Oops! A snake!");
      sounds.down.current.play();
      setTimeout(() => {
        setPosition(SNAKES[curr]);
        setTimeout(() => { setIsRolling(false); triggerQuestion(); }, 800);
      }, 800);
    } else if (LADDERS[curr]) {
      setStatusMsg("🪜 Yay! A ladder!");
      sounds.up.current.play();
      setTimeout(() => {
        setPosition(LADDERS[curr]);
        setTimeout(() => { setIsRolling(false); triggerQuestion(); }, 800);
      }, 800);
    } else if (curr === 25) {
      setStatusMsg("Castle Reached! 🏰");
      setIsRolling(false);
      setIsFinished(true);
      setTimeout(calculateInsight, 1000);
    } else {
      setIsRolling(false);
      triggerQuestion();
    }
  };

  const triggerQuestion = () => {
    if (answers.length < REQUIRED_QUESTIONS) {
      setModalData(questions[answers.length]);
      setStatusMsg("❓ Answer to continue!");
    } else {
      setStatusMsg("Final Stretch! Roll for the Castle!");
    }
  };

  const calculateInsight = () => {
    const counts = {};
    answerTypes.forEach(t => counts[t] = (counts[t] || 0) + 1);
    const top = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "Creative");
    const msgs = {
      Creative: "You have a vivid Imagination! 🎨",
      Active: "You are a bundle of Energy! 🏃",
      Strategic: "You are a master Planner! 🧠",
      Social: "You are a People Person! 🤝"
    };
    setMiniInsight(msgs[top]);
  };

  // --- BOARD GRID GENERATION (Zig-Zag) ---
  const rows = [];
  for (let r = 4; r >= 0; r--) {
    const rowTiles = [];
    for (let c = 0; c < 5; c++) {
      // Logic for zig-zag numbering
      let num = (r % 2 === 0) ? (r * 5) + (c + 1) : (r * 5) + (5 - c);
      rowTiles.push(num);
    }
    rows.push(rowTiles);
  }

  const getPlayerStyle = () => {
    const r = Math.floor((position - 1) / 5);
    const c = (position - 1) % 5;
    const x = (r % 2 === 0) ? c : 4 - c;
    return { bottom: `${r * 20}%`, left: `${x * 20}%` };
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="snake-game-container">
      <div className="game-header">
        <div className="progress-bar">
          <div className="fill" style={{ width: `${(answers.length / REQUIRED_QUESTIONS) * 100}%` }}></div>
        </div>
        <p className="status-text">{statusMsg}</p>
      </div>

      <div className="board-wrapper">
        <div className="board-grid">
          {rows.map((row, ridx) => row.map(num => (
            <div key={num} className={`tile ${SNAKES[num]?'snake-tile':''} ${LADDERS[num]?'ladder-tile':''}`}>
              <span className="tile-num">{num}</span>
              {SNAKES[num] && <span className="marker">🐍</span>}
              {LADDERS[num] && <span className="marker">🪜</span>}
              {num === 25 && <span className="castle-icon">🏰</span>}
            </div>
          )))}
        </div>
        <div className="player-token" style={getPlayerStyle()}>🐿️</div>
      </div>

      <div className="controls-area">
        <div className={`dice-display ${isRolling?"animate-roll":""}`}>{diceNum}</div>
        <button className="roll-btn" onClick={handleRollDice} disabled={isRolling || modalData || isFinished}>
          {isFinished ? "WINNER!" : "ROLL"}
        </button>
      </div>

      {modalData && (
        <div className="modal-overlay">
          <div className="sl-question-card">
            <h3>{modalData.q}</h3>
            {modalData.options.map((opt, i) => (
              <button key={i} className="option-btn" onClick={() => {
                setAnswers([...answers, {q: modalData.q, a: opt.text}]);
                setAnswerTypes([...answerTypes, opt.type]);
                setModalData(null);
              }}>{opt.text}</button>
            ))}
          </div>
        </div>
      )}

      {miniInsight && (
        <div className="modal-overlay">
          <div className="insight-card">
            <h1>Adventure Complete!</h1>
            <h2>{miniInsight}</h2>
            <button className="roll-btn" onClick={() => navigate("/finalize")}>Show My Hobby</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeLadderGame;