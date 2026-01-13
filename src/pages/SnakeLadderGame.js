// src/pages/SnakeLadderGame.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SnakeGame.css";

// 🎲 5x5 Grid
const BOARD_SIZE = 25; 
const MAX_QUESTIONS = 5; // Game ends after 5 questions

// 🐍 SNAKES (Red)
const SNAKES = { 
  14: 4, 
  19: 8, 
  22: 20, 
  24: 16 
};

// 🪜 LADDERS (Green)
const LADDERS = { 
  3: 11, 
  6: 17, 
  9: 18, 
  10: 12 
};

// ❓ Question Bank
const QUESTIONS_DB = [
  { q: "What's your vibe?", options: ["Chilling 🛋️", "Partying 🎉", "Exploring 🗺️", "Creating 🎨"] },
  { q: "Pick a superpower:", options: ["Flying 🦅", "Telepathy 🧠", "Strength 💪", "Speed ⚡"] },
  { q: "Ideal vacation?", options: ["Beach 🏖️", "Snow ❄️", "City 🏙️", "Jungle 🌴"] },
  { q: "Favorite color?", options: ["Blue 🔵", "Red 🔴", "Green 🟢", "Yellow 🟡"] },
  { q: "Choose a companion:", options: ["Dog 🐶", "Cat 🐱", "Robot 🤖", "Dragon 🐉"] },
  { q: "Hobby tool:", options: ["Camera 📷", "Controller 🎮", "Pen 🖊️", "Shoes 👟"] }
];

const SnakeLadderGame = () => {
  const navigate = useNavigate();
  
  const [position, setPosition] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [diceNum, setDiceNum] = useState(1);
  const [modalData, setModalData] = useState(null); 
  const [answers, setAnswers] = useState([]);
  const [statusMsg, setStatusMsg] = useState("Roll the dice to start!");
  const [showWin, setShowWin] = useState(false);

  const clickSound = useRef(null);
  const slideSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => {
    clickSound.current = new Audio("/sounds/click.mp3");
    slideSound.current = new Audio("/sounds/slide.mp3");
    winSound.current = new Audio("/sounds/win.mp3");
  }, []);

  const handleRollDice = () => {
    if (isRolling || modalData || showWin) return;

    clickSound.current?.play().catch(() => {});
    setIsRolling(true);
    setStatusMsg("Rolling...");

    // Spin animation
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceNum(roll);
      
      let nextPos = position + roll;
      if (nextPos > BOARD_SIZE) nextPos = BOARD_SIZE;

      setPosition(nextPos);
      setIsRolling(false);

      // Wait a moment before checking tile (so player sees move)
      setTimeout(() => checkTile(nextPos), 600);
    }, 800);
  };

  const checkTile = (currentPos) => {
    // 1. Check Snake
    if (SNAKES[currentPos]) {
      setStatusMsg("🐍 Snake! Sliding down...");
      slideSound.current?.play().catch(()=>{});
      setTimeout(() => {
        setPosition(SNAKES[currentPos]);
        setStatusMsg(`Slid down to ${SNAKES[currentPos]}!`);
        setTimeout(triggerQuestion, 1000);
      }, 1000);
      return;
    }

    // 2. Check Ladder
    if (LADDERS[currentPos]) {
      setStatusMsg("🪜 Ladder! Climbing up...");
      slideSound.current?.play().catch(()=>{});
      setTimeout(() => {
        setPosition(LADDERS[currentPos]);
        setStatusMsg(`Climbed up to ${LADDERS[currentPos]}!`);
        setTimeout(triggerQuestion, 1000);
      }, 1000);
      return;
    }

    // 3. Normal Tile
    triggerQuestion();
  };

  const triggerQuestion = () => {
    if (answers.length >= MAX_QUESTIONS || position === BOARD_SIZE) {
      finishGame();
      return;
    }

    const randomIdx = Math.floor(Math.random() * QUESTIONS_DB.length);
    setModalData(QUESTIONS_DB[randomIdx]);
    setStatusMsg("❓ Choose an answer!");
  };

  const handleAnswer = (choice) => {
    clickSound.current?.play().catch(() => {});
    
    const newAnswers = [...answers, choice];
    setAnswers(newAnswers);
    setModalData(null);

    if (newAnswers.length >= MAX_QUESTIONS || position === BOARD_SIZE) {
      setTimeout(finishGame, 500);
    } else {
      setStatusMsg(`Progress: ${newAnswers.length}/${MAX_QUESTIONS}`);
    }
  };

  const finishGame = () => {
    setShowWin(true);
    winSound.current?.play().catch(()=>{});

    const storedData = JSON.parse(localStorage.getItem("gameResults")) || {};
    const finalData = {
      ...storedData,
      snakeGame: {
        completed: true,
        answers: answers,
        completedAt: Date.now()
      },
      userProfile: {
        clawChoice: storedData.clawGame?.answers?.[0] || "Unknown",
        castleChoice: storedData.castleGame?.answers?.[0] || "Unknown",
        snakeChoices: answers
      }
    };
    localStorage.setItem("gameResults", JSON.stringify(finalData));

    setTimeout(() => {
      navigate("/result");
    }, 3000);
  };

  const renderBoard = () => {
    let tiles = [];
    for (let i = BOARD_SIZE; i >= 1; i--) {
      const isSnake = SNAKES[i] !== undefined;
      const isLadder = LADDERS[i] !== undefined;
      const isPlayer = position === i;
      const target = isSnake ? SNAKES[i] : (isLadder ? LADDERS[i] : null);

      let classes = "tile";
      if (isSnake) classes += " snake-tile";
      if (isLadder) classes += " ladder-tile";
      if (i === BOARD_SIZE) classes += " finish-tile";

      tiles.push(
        <div key={i} className={classes}>
          <span className="tile-num">{i}</span>
          
          {/* Clean Text Indicators instead of Lines */}
          {isSnake && <span className="direction-text">To {target} ↘</span>}
          {isLadder && <span className="direction-text">To {target} ↗</span>}
          
          {isSnake && <span className="marker">🐍</span>}
          {isLadder && <span className="marker">🪜</span>}
          {i === BOARD_SIZE && <span className="marker">🏁</span>}

          {isPlayer && <div className="squirrel-token">🐿️</div>}
        </div>
      );
    }
    return tiles;
  };

  return (
    <div className="snake-game-container">
      <div className="game-header">
        <h2>Forest Adventure</h2>
        <div className="progress-bar">
          <div className="fill" style={{ width: `${(answers.length / MAX_QUESTIONS) * 100}%` }}></div>
        </div>
        <p className="status-text">{statusMsg}</p>
      </div>

      <div className="board-grid">
        {renderBoard()}
      </div>

      <div className="controls-area">
        <div className={`dice-display ${isRolling ? "animate-roll" : ""}`}>
          {diceNum}
        </div>
        <button 
          className="roll-btn" 
          onClick={handleRollDice} 
          disabled={isRolling || modalData || showWin}
        >
          {isRolling ? "..." : "ROLL DICE"}
        </button>
      </div>

      {modalData && (
        <div className="modal-overlay">
          <div className="question-card">
            <h3>{modalData.q}</h3>
            <div className="options-list">
              {modalData.options.map((opt, idx) => (
                <button key={idx} className="option-btn" onClick={() => handleAnswer(opt)}>
                  <span className="chest-icon">🎁</span> {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showWin && (
        <div className="modal-overlay">
          <div className="win-card">
            <h1>Adventure Complete!</h1>
            <p>Gathering your personality...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeLadderGame;