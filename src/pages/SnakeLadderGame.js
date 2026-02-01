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
  const [isFinished, setIsFinished] = useState(false);

  // --- AUDIO REFS ---
  const bgSound = useRef(null);
  const clickSound = useRef(null);
  const slideUpSound = useRef(null);
  const slideDownSound = useRef(null);

  const safePlay = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    fetch(`${API_BASE}/api/quizzes/snake`)
      .then((res) => {
        if (!res.ok) throw new Error("Server Error");
        return res.json();
      })
      .then((data) => {
        const actualData = Array.isArray(data) ? data : (data.questions || data.data || []);
        if (actualData.length > 0) {
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
          const shuffled = formatted.sort(() => Math.random() - 0.5);
          setQuestions(shuffled);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });

    bgSound.current = new Audio("/sounds/SnakeLadder.mp3");
    bgSound.current.loop = true;
    bgSound.current.volume = 0.4;
    bgSound.current.play().catch(() => {});

    clickSound.current = new Audio("/sounds/click.mp3");
    slideUpSound.current = new Audio("/sounds/slideUP.mp3");
    slideDownSound.current = new Audio("/sounds/slideDOWN.mp3");

    return () => {
      if (bgSound.current) {
        bgSound.current.pause();
        bgSound.current = null;
      }
    };
  }, []);

  // --- 🎲 THE GUARANTEED SCRIPT LOGIC ---
  const handleRollDice = () => {
    if (isRolling || modalData || miniInsight || loading || isFinished || position === BOARD_SIZE) return;

    safePlay(clickSound);
    setIsRolling(true);
    setStatusMsg("Rolling...");

    const rollInterval = setInterval(() => {
      setDiceNum(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);

      // SCRIPTED PATH LOGIC
      let targetTile = 1;
      const turnIndex = answers.length;

      if (turnIndex === 0) {
        targetTile = 3;  // Roll 1: Hits Ladder (3 -> 11)
      } else if (turnIndex === 1) {
        targetTile = 14; // Roll 2: Hits Snake (14 -> 4)
      } else if (turnIndex === 2) {
        targetTile = 9;  // Roll 3: Hits Ladder (9 -> 18)
      } else if (turnIndex === 3) {
        targetTile = 20; // Roll 4: Lands on 20
      } else if (turnIndex === 4) {
        targetTile = 23; // Roll 5: Lands on 23
      } else if (turnIndex === 5) {
        targetTile = 25; // Roll 6: Lands on 25 (Dice will show 2 because 25-23=2)
      } else {
        targetTile = 25;
      }

      // Calculate Dice number based on target
      let movesNeeded = targetTile - position;
      
      // If movesNeeded isn't standard (1-6) due to teleportation, 
      // we still set the visual dice to something logical for the script
      if (movesNeeded <= 0 || movesNeeded > 6) {
          // Fallback visual only
          setDiceNum(Math.floor(Math.random() * 6) + 1);
      } else {
          setDiceNum(movesNeeded);
      }

      // Update position to the target
      setPosition(targetTile);

      setTimeout(() => checkTile(targetTile), 800);
    }, 800);
  };

  const checkTile = (currentPos) => {
    // 1. Check Snake
    if (SNAKES[currentPos]) {
      setStatusMsg("🐍 Oh no! Snake!");
      safePlay(slideDownSound);
      setTimeout(() => {
        const afterSnakePos = SNAKES[currentPos];
        setPosition(afterSnakePos);
        setStatusMsg(`Slid down to tile ${afterSnakePos}...`);
        setTimeout(() => {
          setIsRolling(false);
          triggerQuestion();
        }, 800);
      }, 800);
      return;
    }

    // 2. Check Ladder
    if (LADDERS[currentPos]) {
      setStatusMsg("🪜 Awesome! Ladder!");
      safePlay(slideUpSound);
      setTimeout(() => {
        const afterLadderPos = LADDERS[currentPos];
        setPosition(afterLadderPos);
        setStatusMsg(`Climbed up to tile ${afterLadderPos}!`);
        setTimeout(() => {
          setIsRolling(false);
          triggerQuestion();
        }, 800);
      }, 800);
      return;
    }

    // 3. Check Finish
    if (currentPos === BOARD_SIZE) {
      setStatusMsg("You reached the Castle! 🏰");
      setIsRolling(false);
      setIsFinished(true);
      setTimeout(() => calculateMiniInsight(), 1500);
      return;
    }

    // 4. Normal Tile
    setIsRolling(false);
    triggerQuestion();
  };

  const triggerQuestion = () => {
    if (answers.length >= REQUIRED_QUESTIONS) {
      if (position !== BOARD_SIZE) {
        setStatusMsg("Roll to reach the Castle!");
      }
      return;
    }

    const nextQuestion = questions[answers.length];
    if (nextQuestion) {
      setModalData(nextQuestion);
      setStatusMsg("❓ Quick Question!");
    }
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
    setMiniInsight(insightMessage);
  };

  const finalizeGame = () => {
    const storedData = JSON.parse(localStorage.getItem("gameResults")) || {};
    const normalizedAnswers = answers.map(item => ({
      question: item.q,
      answer: item.a
    }));

    const finalData = {
      ...storedData,
      snakeGame: {
        completed: true,
        answers: normalizedAnswers,
        completedAt: Date.now()
      },
    };

    localStorage.setItem("gameResults", JSON.stringify(finalData));
    navigate("/finalize");
  };

  // --- GRID GENERATION ---
  const gridCells = [];
  for (let r = 0; r < 5; r++) {
    const logicRow = 4 - r;
    const isEven = logicRow % 2 === 0;
    const rowNumbers = [];
    for (let c = 0; c < 5; c++) {
      let num = isEven ? (logicRow * 5) + 1 + c : (logicRow * 5) + 5 - c;
      rowNumbers.push(num);
    }
    gridCells.push(...rowNumbers);
  }

  const getPlayerStyle = () => {
    const getGridIndex = (tileNum) => {
      const row = Math.floor((tileNum - 1) / 5);
      const col = (tileNum - 1) % 5;
      let actualCol = (row % 2 !== 0) ? 4 - col : col;
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
            let classes = `tile ${isSnake ? 'snake-tile' : ''} ${isLadder ? 'ladder-tile' : ''} ${isFinish ? 'finish-tile' : ''}`;
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
        <div className={`dice-display ${isRolling ? "animate-roll" : ""}`}>{diceNum}</div>
        <button 
          className="roll-btn" 
          onClick={handleRollDice} 
          disabled={isRolling || modalData || miniInsight || isFinished}
        >
          {isFinished ? "FINISHED" : (isRolling ? "..." : "ROLL")}
        </button>
      </div>

      {modalData && (
        <div className="modal-overlay">
          <div className="sl-question-card">
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
            <button className="final-btn" onClick={finalizeGame}>Reveal My Hobby</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeLadderGame;