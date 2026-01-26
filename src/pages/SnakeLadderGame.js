import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SnakeLadderGame.css";

// 🎲 CONFIGURATION
const BOARD_SIZE = 25;
const REQUIRED_QUESTIONS = 5; 

// 🐍 SNAKES & LADDERS MAP
const SNAKES = { 14: 4, 19: 8, 22: 20, 24: 16 };
const LADDERS = { 3: 11, 6: 17, 9: 18, 10: 12 };

// 🌍 API BASE URL
const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://starthobbybackend-production.up.railway.app"
    : "http://localhost:5000";

const SnakeLadderGame = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [questions, setQuestions] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [position, setPosition] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [diceNum, setDiceNum] = useState(1);
  const [statusMsg, setStatusMsg] = useState("Roll to start!");
  
  const [modalData, setModalData] = useState(null); 
  const [answers, setAnswers] = useState([]); 
  const [answerTypes, setAnswerTypes] = useState([]);
  const [askedQuestionIds, setAskedQuestionIds] = useState([]); 
  const [miniInsight, setMiniInsight] = useState(null); 

  const [hasHitSnake, setHasHitSnake] = useState(false);
  const [hasHitLadder, setHasHitLadder] = useState(false);

  // --- AUDIO ---
  const clickSound = useRef(null);
  const slideSound = useRef(null);
  const winSound = useRef(null);

  const createAudio = (path, loop = false, volume = 1.0) => {
    const audio = new Audio(path);
    audio.loop = loop;
    audio.volume = volume;
    audio.onerror = () => console.warn(`Audio missing: ${path}`);
    return audio;
  };

  const safePlay = (audioRef) => {
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {}); 
      }
    }
  };

  const safePause = (audioRef) => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
    }
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Fetch Quiz Data (With Fallback)
    fetch(`${API_BASE}/api/quizzes/snake`)
      .then((res) => {
        if (!res.ok) throw new Error("Server Error");
        return res.json();
      })
      .then((data) => {
        const actualData = Array.isArray(data) ? data : (data.questions || data.data || []);
        
        if (actualData.length > 0) {
          // Format API data
          const formatted = actualData.map((q) => ({
            id: q.id,
            q: q.question,
            options: [
              { text: q.option_a, type: "Active" },
              { text: q.option_b, type: "Strategic" },
              { text: q.option_c, type: "Creative" },
              { text: q.option_d, type: "Social" }
            ]
          }));
          setQuestions(formatted);}
        setLoading(false);
      })
      .catch((err) => {
        // API failed? Use fallback
        console.error("Fetch error, using backup questions:", err);
        setLoading(false);
      });

    // 2. Setup Audio
    clickSound.current = createAudio("/sounds/click.mp3");
    slideSound.current = createAudio("/sounds/slide.mp3");
    winSound.current = createAudio("/sounds/win.mp3");

    return () => {
      safePause(clickSound);
      safePause(slideSound);
      safePause(winSound);
    };
  }, []);

  // --- GAME LOGIC ---

  const handleRollDice = () => {
    if (isRolling || modalData || miniInsight || loading) return;

    safePlay(clickSound);
    setIsRolling(true);
    setStatusMsg("Rolling...");

    const rollInterval = setInterval(() => {
        setDiceNum(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);

      let calculatedRoll = Math.floor(Math.random() * 6) + 1;

      // Force mechanics
      if (answers.length < REQUIRED_QUESTIONS) {
          if (!hasHitLadder) {
             for(let i=1; i<=6; i++) if(LADDERS[position+i]) { calculatedRoll = i; break; }
          } else if (!hasHitSnake) {
             for(let i=1; i<=6; i++) if(SNAKES[position+i]) { calculatedRoll = i; break; }
          }
          if (position + calculatedRoll >= BOARD_SIZE) calculatedRoll = 1; 
      } else {
          calculatedRoll = BOARD_SIZE - position;
      }

      setDiceNum(calculatedRoll);
      let nextPos = position + calculatedRoll;
      if (nextPos > BOARD_SIZE) nextPos = BOARD_SIZE; 

      setPosition(nextPos);
      setIsRolling(false);

      setTimeout(() => checkTile(nextPos), 800);
    }, 800);
  };

  const checkTile = (currentPos) => {
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

    if (currentPos === BOARD_SIZE) {
        setTimeout(() => calculateMiniInsight(), 1500);
        return;
    }

    triggerQuestion();
  };

  const triggerQuestion = () => {
    if (answers.length >= REQUIRED_QUESTIONS) {
      setStatusMsg("Head to the Castle!");
      return;
    }

    // Ensure we don't ask duplicates
    const availableQuestions = questions.filter(q => !askedQuestionIds.includes(q.id));
    
    // If we run out (or fetch failed completely), use anything available
    const pool = availableQuestions.length > 0 ? availableQuestions : questions;
    
    if (pool.length === 0) return; // Should be impossible with fallback

    const randomIdx = Math.floor(Math.random() * pool.length);
    setModalData(pool[randomIdx]);
    setStatusMsg("❓ Quick Question!");
  };

  const handleAnswer = (option, questionId) => {
    safePlay(clickSound);
    
    const newAnswers = [...answers, { q: modalData.q, a: option.text }];
    setAnswers(newAnswers);
    setAnswerTypes([...answerTypes, option.type]);
    setAskedQuestionIds([...askedQuestionIds, questionId]);
    
    setModalData(null);

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
        completedAt: Date.now()
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

  if (loading) return <div className="snake-game-container"><h1 style={{color:'white'}}>Loading...</h1></div>;

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
};

export default SnakeLadderGame;