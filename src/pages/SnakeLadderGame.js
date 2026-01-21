import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SnakeLadderGame.css";

// 🎲 CONFIGURATION
const BOARD_SIZE = 25;
const REQUIRED_QUESTIONS = 5; // Game ends EXACTLY after this many

// 🐍 SNAKES & LADDERS MAP
const SNAKES = { 14: 4, 19: 8, 22: 20, 24: 16 };
const LADDERS = { 3: 11, 6: 17, 9: 18, 10: 12 };

// ❓ QUESTION BANK
const QUESTIONS_DB = [
  { id: 1, q: "How do you prefer to spend a free weekend?", options: [{ text: "Drawing or Writing 🎨", type: "Creative" }, { text: "Hiking or Sports 🧗", type: "Active" }, { text: "Solving Puzzles 🧩", type: "Strategic" }, { text: "Hanging with Friends 🎉", type: "Social" }] },
  { id: 2, q: "Which environment energises you the most?", options: [{ text: "Quiet Studio 🤫", type: "Creative" }, { text: "Outdoors/Nature 🌲", type: "Active" }, { text: "Library/Office 📚", type: "Strategic" }, { text: "Crowded Party 🥳", type: "Social" }] },
  { id: 3, q: "When you face a new challenge, you usually...", options: [{ text: "Imagine new solutions 💡", type: "Creative" }, { text: "Dive right in! 🏃", type: "Active" }, { text: "Plan carefully 📝", type: "Strategic" }, { text: "Ask for help 🤝", type: "Social" }] },
  { id: 4, q: "What kind of task do you enjoy the most?", options: [{ text: "Creating things 🔨", type: "Creative" }, { text: "Physical tasks 💃", type: "Active" }, { text: "Analyzing data 📊", type: "Strategic" }, { text: "Leading a team 📢", type: "Social" }] },
  { id: 5, q: "How do you feel about being in the spotlight?", options: [{ text: "I prefer backstage 🎭", type: "Creative" }, { text: "I love the action! 🎬", type: "Active" }, { text: "Only if I'm right 🤓", type: "Strategic" }, { text: "I was born for it! 🌟", type: "Social" }] },
  { id: 6, q: "Which statement describes you best?", options: [{ text: "I am a Dreamer ☁️", type: "Creative" }, { text: "I am a Doer ⚡", type: "Active" }, { text: "I am a Thinker 🧠", type: "Strategic" }, { text: "I am a Connector ❤️", type: "Social" }] },
  { id: 7, q: "What type of learning excites you?", options: [{ text: "Visual / Artistic 🖌️", type: "Creative" }, { text: "Hands-on Practice 👐", type: "Active" }, { text: "Logic / Research 🔍", type: "Strategic" }, { text: "Group Discussion 🗣️", type: "Social" }] },
  { id: 8, q: "How do you usually relax after a long day?", options: [{ text: "Crafting/DIY 🧶", type: "Creative" }, { text: "Going for a run 👟", type: "Active" }, { text: "Strategy Games ♟️", type: "Strategic" }, { text: "Chatting/Texting 📱", type: "Social" }] },
  { id: 9, q: "If money and time were no issue, you would...", options: [{ text: "Open an Art Gallery 🖼️", type: "Creative" }, { text: "Climb Mt. Everest 🏔️", type: "Active" }, { text: "Study Science 🧪", type: "Strategic" }, { text: "Host Huge Events 🎆", type: "Social" }] },
  { id: 10, q: "Which group role do you naturally take?", options: [{ text: "The Idea Generator 💡", type: "Creative" }, { text: "The Heavy Lifter 💪", type: "Active" }, { text: "The Planner 📅", type: "Strategic" }, { text: "The Mediator 🕊️", type: "Social" }] },
  { id: 11, q: "What do you value most in a hobby?", options: [{ text: "Self-Expression 🎭", type: "Creative" }, { text: "Adrenaline/Action 🎢", type: "Active" }, { text: "Mental Mastery 🧠", type: "Strategic" }, { text: "Community 🏘️", type: "Social" }] },
  { id: 12, q: "How do you feel about physical activity in hobbies?", options: [{ text: "I prefer sitting/focusing 🧘", type: "Creative" }, { text: "I need to sweat! 💦", type: "Active" }, { text: "Only if it involves strategy 🤺", type: "Strategic" }, { text: "Fun if played with others 🏐", type: "Social" }] }
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

  // Tracks if we have met the movement requirements
  const [hasHitSnake, setHasHitSnake] = useState(false);
  const [hasHitLadder, setHasHitLadder] = useState(false);

  const clickSound = useRef(null);
  const slideSound = useRef(null);
  const winSound = useRef(null);

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

      // --- 😈 AGGRESSIVE GAME MASTER LOGIC ---
      // We FORCE snakes/ladders early so the game isn't boring
      let calculatedRoll = Math.floor(Math.random() * 6) + 1;

      // 1. If we haven't hit a LADDER, look for one close by and force it
      if (!hasHitLadder) {
        for (let i = 1; i <= 6; i++) {
          if (LADDERS[position + i]) {
            calculatedRoll = i; 
            break;
          }
        }
      } 
      // 2. If we haven't hit a SNAKE, look for one and force it
      else if (!hasHitSnake) {
         for (let i = 1; i <= 6; i++) {
          if (SNAKES[position + i]) {
            calculatedRoll = i; 
            break;
          }
        }
      }

      setDiceNum(calculatedRoll);
      let nextPos = position + calculatedRoll;
      if (nextPos > BOARD_SIZE) nextPos = BOARD_SIZE; // Cap at 25

      setPosition(nextPos);
      setIsRolling(false);

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
        // ALWAYS TRIGGER QUESTION
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
        // ALWAYS TRIGGER QUESTION
        setTimeout(triggerQuestion, 1000); 
      }, 800);
      return;
    }

    // 3. NORMAL TILE
    // NO SAFE SPOTS. ALWAYS TRIGGER QUESTION.
    triggerQuestion();
  };

  const triggerQuestion = () => {
    // If we've already answered 5, the game ends NOW.
    if (answers.length >= REQUIRED_QUESTIONS) {
      calculateMiniInsight();
      return;
    }

    const availableQuestions = QUESTIONS_DB.filter(q => !askedQuestionIds.includes(q.id));
    if (availableQuestions.length === 0) {
        calculateMiniInsight(); // Fallback end
        return;
    }

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

    // 🛑 HARD STOP CHECK: If 5 questions answered, END GAME.
    if (newAnswers.length >= REQUIRED_QUESTIONS) {
      setStatusMsg("Adventure Complete!");
      setTimeout(calculateMiniInsight, 500);
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