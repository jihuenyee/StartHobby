import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SnakeLadderGame.css";

// 🎲 CONFIGURATION
const BOARD_SIZE = 25;
const REQUIRED_QUESTIONS = 5; 

// 🐍 SNAKES & LADDERS MAP
const SNAKES = { 14: 4, 19: 8, 22: 20, 24: 16 };
const LADDERS = { 3: 11, 6: 17, 9: 18, 10: 12 };

// ❓ QUESTION BANK (From your SQL)
const QUESTIONS_DB = [
  { 
    id: 1, 
    q: "You land near a ladder. What do you do?", 
    options: [
      { text: "Take the risk and climb 🪜", type: "Active" },
      { text: "Check the odds carefully 🤔", type: "Strategic" },
      { text: "Wait for the right moment ⏳", type: "Creative" },
      { text: "Ask others for advice 🗣", type: "Social" }
    ] 
  },
  { 
    id: 2, 
    q: "You hit a snake and slide down!", 
    options: [
      { text: "Laugh it off 😄", type: "Creative" },
      { text: "Get competitive 💪", type: "Active" },
      { text: "Analyze what went wrong 📊", type: "Strategic" },
      { text: "Encourage others anyway ❤️", type: "Social" }
    ] 
  },
  { 
    id: 3, 
    q: "How do you usually handle setbacks?", 
    options: [
      { text: "Turn it into inspiration ✨", type: "Creative" },
      { text: "Push harder next time 🔥", type: "Active" },
      { text: "Reflect and improve 🧠", type: "Strategic" },
      { text: "Seek support 🤝", type: "Social" }
    ] 
  },
  { 
    id: 4, 
    q: "Which reward motivates you most?", 
    options: [
      { text: "Personal achievement 🏆", type: "Active" },
      { text: "Mastery of skills 📚", type: "Strategic" },
      { text: "Shared success 🎊", type: "Social" },
      { text: "Recognition 🎖", type: "Creative" }
    ] 
  },
  { 
    id: 5, 
    q: "What keeps you going in long games?", 
    options: [
      { text: "Imagination 🌈", type: "Creative" },
      { text: "Energy & movement ⚡️", type: "Active" },
      { text: "Clear goals 🎯", type: "Strategic" },
      { text: "Team spirit 🤜🤛", type: "Social" }
    ] 
  }
];

export default function SnakeLadderGame() {
  const navigate = useNavigate();
  
  const [position, setPosition] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [diceNum, setDiceNum] = useState(1);
  const [statusMsg, setStatusMsg] = useState("Roll to start!");
  
  const [modalData, setModalData] = useState(null); 
  const [answers, setAnswers] = useState([]); 
  const [answerTypes, setAnswerTypes] = useState([]);
  const [askedQuestionIds, setAskedQuestionIds] = useState([]); 
  const [miniInsight, setMiniInsight] = useState(null); 

  // Tracks requirements
  const [hasHitSnake, setHasHitSnake] = useState(false);
  const [hasHitLadder, setHasHitLadder] = useState(false);

  const clickSound = useRef(null);
  const slideSound = useRef(null);
  const winSound = useRef(null);

  // --- SAFE AUDIO FUNCTIONS ---
  const createAudio = (path) => {
    const audio = new Audio(path);
    audio.onerror = () => console.warn(`Audio missing: ${path}`);
    return audio;
  };

  const safePlay = (audioRef) => {
    if (audioRef.current) audioRef.current.play().catch(() => {});
  };

  useEffect(() => {
    clickSound.current = createAudio("/sounds/click.mp3");
    slideSound.current = createAudio("/sounds/slide.mp3");
    winSound.current = createAudio("/sounds/win.mp3");
  }, []);

  const handleRollDice = () => {
    if (isRolling || modalData || miniInsight) return;

    safePlay(clickSound);
    setIsRolling(true);
    setStatusMsg("Rolling...");

    const rollInterval = setInterval(() => {
        setDiceNum(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);

      // --- 🧠 RIGGED LOGIC FOR PROGRESSION ---
      let calculatedRoll = Math.floor(Math.random() * 6) + 1;

      // 1. If nearing end but haven't finished questions, prevent winning
      if (answers.length < REQUIRED_QUESTIONS) {
          // Force hit ladder/snake if available
          if (!hasHitLadder) {
             for(let i=1; i<=6; i++) if(LADDERS[position+i]) { calculatedRoll = i; break; }
          } else if (!hasHitSnake) {
             for(let i=1; i<=6; i++) if(SNAKES[position+i]) { calculatedRoll = i; break; }
          }
          
          // Prevent hitting 25
          if (position + calculatedRoll >= BOARD_SIZE) {
              calculatedRoll = 1; // Just nudge forward slowly
          }
      } 
      // 2. If questions are DONE, force land on 25
      else {
          calculatedRoll = BOARD_SIZE - position;
      }

      setDiceNum(calculatedRoll);
      let nextPos = position + calculatedRoll;
      if (nextPos > BOARD_SIZE) nextPos = BOARD_SIZE; 

      setPosition(nextPos);
      setIsRolling(false);

      // Wait for squirrel move animation before checking tile
      setTimeout(() => checkTile(nextPos), 800);
    }, 800);
  };

  const checkTile = (currentPos) => {
    // 1. SNAKE
    if (SNAKES[currentPos]) {
      setHasHitSnake(true);
      setStatusMsg("🐍 Oh no! Snake!");
      safePlay(slideSound);
      setTimeout(() => {
        setPosition(SNAKES[currentPos]);
        setStatusMsg(`Slid down to tile ${SNAKES[currentPos]}...`);
        setTimeout(triggerQuestion, 1000); 
      }, 800);
      return;
    }

    // 2. LADDER
    if (LADDERS[currentPos]) {
      setHasHitLadder(true);
      setStatusMsg("🪜 Awesome! Ladder!");
      safePlay(slideSound);
      setTimeout(() => {
        setPosition(LADDERS[currentPos]);
        setStatusMsg(`Climbed up to tile ${LADDERS[currentPos]}!`);
        setTimeout(triggerQuestion, 1000); 
      }, 800);
      return;
    }

    // 3. FINAL TILE (Home)
    if (currentPos === BOARD_SIZE) {
        // If we are here, we MUST have answered 5 questions due to logic above.
        // Wait a moment for player to see squirrel on the castle
        setTimeout(() => {
            calculateMiniInsight();
        }, 1500);
        return;
    }

    // 4. NORMAL TILE
    triggerQuestion();
  };

  const triggerQuestion = () => {
    // If we've already answered 5, DO NOT ask more. Just keep rolling.
    if (answers.length >= REQUIRED_QUESTIONS) {
      setStatusMsg("Head to the Castle!");
      return;
    }

    const availableQuestions = QUESTIONS_DB.filter(q => !askedQuestionIds.includes(q.id));
    if (availableQuestions.length === 0) return;

    const randomIdx = Math.floor(Math.random() * availableQuestions.length);
    setModalData(availableQuestions[randomIdx]);
    setStatusMsg("❓ Quick Question!");
  };

  const handleAnswer = (option, questionId) => {
    safePlay(clickSound);
    
    const newAnswers = [...answers, { q: modalData.q, a: option.text }];
    setAnswers(newAnswers);
    setAnswerTypes([...answerTypes, option.type]);
    setAskedQuestionIds([...askedQuestionIds, questionId]);
    
    setModalData(null);

    // Update status
    if (newAnswers.length >= REQUIRED_QUESTIONS) {
      setStatusMsg("All questions done! Race to the Castle! 🏰");
    } else {
      setStatusMsg(`Progress: ${newAnswers.length}/${REQUIRED_QUESTIONS} Answers`);
    }
  };

  const calculateMiniInsight = () => {
    const counts = {};
    let maxType = "Creative";
    let maxCount = 0;

    answerTypes.forEach(type => {
      counts[type] = (counts[type] || 0) + 1;
      if (counts[type] > maxCount) {
        maxCount = counts[type];
        maxType = type;
      }
    });

    let insightMessage = "";
    switch(maxType) {
      case "Creative": insightMessage = "You have a vividly Creative mind! 🎨"; break;
      case "Active": insightMessage = "You seem like an energetic Doer! 🏃"; break;
      case "Strategic": insightMessage = "I see a sharp, Strategic thinker! 🧠"; break;
      case "Social": insightMessage = "You are a true People Person! 🤝"; break;
      default: insightMessage = "You have a perfectly Balanced vibe! ⚖️";
    }

    safePlay(winSound);
    setMiniInsight(insightMessage);
  };

  const finalizeGame = () => {
    const storedData = JSON.parse(localStorage.getItem("gameResults")) || {};
    const finalData = {
      ...storedData,
      snakeGame: {
        completed: true,
        answers: answers,
        types: answerTypes,
        completedAt: new Date().toISOString()
      },
    };
    localStorage.setItem("gameResults", JSON.stringify(finalData));
    navigate("/personality-reveal");
  };

  // 📐 ZIG-ZAG GRID
  const gridCells = [];
  for (let r = 0; r < 5; r++) { 
    const logicRow = 4 - r; 
    const isEven = logicRow % 2 === 0; 
    const rowNumbers = [];
    for (let c = 0; c < 5; c++) {
      let num;
      if (isEven) num = (logicRow * 5) + 1 + c;
      else num = (logicRow * 5) + 5 - c;
      rowNumbers.push(num);
    }
    gridCells.push(...rowNumbers);
  }

  const getPlayerStyle = () => {
    const getGridIndex = (tileNum) => {
        const row = Math.floor((tileNum - 1) / 5); 
        const col = (tileNum - 1) % 5;
        let actualCol = col;
        if (row % 2 !== 0) actualCol = 4 - col;
        const visualRow = 4 - row;
        return visualRow * 5 + actualCol;
    };
    const gridIndex = getGridIndex(position);
    const row = Math.floor(gridIndex / 5);
    const col = gridIndex % 5;
    return { top: `${row * 20}%`, left: `${col * 20}%` };
  };

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
            {gridCells.map((num) => {
                const isSnake = SNAKES[num] !== undefined;
                const isLadder = LADDERS[num] !== undefined;
                const isFinish = num === BOARD_SIZE;
                
                let classes = "tile";
                if (isSnake) classes += " snake-tile";
                if (isLadder) classes += " ladder-tile";
                if (isFinish) classes += " finish-tile";

                return (
                    <div key={num} className={classes}>
                        <span className="tile-num">{num}</span>
                        {isSnake && <span className="marker">🐍</span>}
                        {isLadder && <span className="marker">🪜</span>}
                        {isFinish && <span className="castle-icon">🏰</span>}
                    </div>
                );
            })}
        </div>
        
        <div className="player-token" style={getPlayerStyle()}>🐿️</div>
      </div>

      <div className="controls-area">
        <div className={`dice-display ${isRolling ? "animate-roll" : ""}`}>
          {diceNum}
        </div>
        <button 
          className="roll-btn" 
          onClick={handleRollDice} 
          disabled={isRolling || modalData || miniInsight}
        >
          {isRolling ? "..." : "ROLL"}
        </button>
      </div>

      {modalData && (
        <div className="modal-overlay">
          <div className="question-card">
            <h3>{modalData.q}</h3>
            <div className="options-list">
              {modalData.options.map((opt, idx) => (
                <button key={idx} className="option-btn" onClick={() => handleAnswer(opt, modalData.id)}>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {miniInsight && (
        <div className="modal-overlay">
          <div className="insight-card">
            <h1>Adventure Complete!</h1>
            <div className="insight-icon">✨</div>
            <h2>{miniInsight}</h2>
            <p>Gathering all your answers...</p>
            <button className="final-btn" onClick={finalizeGame}>
              Reveal My Hobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}