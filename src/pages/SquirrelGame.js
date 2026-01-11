import React, { useState, useEffect } from 'react';
import '../styles/SquirrelGame.css';

const STAGES = [
  {
    id: 0,
    title: "Arcade Claw Machine",
    type: "claw",
    bgColor: "#fce4ec",
    btnText: "Lower the Claw!",
    questions: [
      { q: "What hobby involves moving to music?", a: ["Dancing", "Sleeping", "Math"], c: 0 },
      { q: "Which hobby uses a board and 64 squares?", a: ["Chess", "Soccer", "Cooking"], c: 0 },
      { q: "Collecting what is called Philately?", a: ["Coins", "Stamps", "Rocks"], c: 1 },
      { q: "Which is a yarn-based hobby?", a: ["Knitting", "Hiking", "Swimming"], c: 0 },
    ]
  },
  {
    id: 1,
    title: "The Fishing Pond",
    type: "fish",
    bgColor: "#e3f2fd",
    btnText: "Cast the Line!",
    questions: [
      { q: "Which hobby involves a rod and bait?", a: ["Fishing", "Painting", "Karate"], c: 0 },
      { q: "What instrument has 88 keys?", a: ["Guitar", "Piano", "Flute"], c: 1 },
      { q: "Taking photos is called what?", a: ["Photography", "Baking", "Hiking"], c: 0 },
      { q: "In which hobby do you use goggles?", a: ["Reading", "Swimming", "Chess"], c: 1 },
    ]
  },
  {
    id: 2,
    title: "The Golden Oak Tree",
    type: "tree",
    bgColor: "#e8f5e9",
    btnText: "Shake the Tree!",
    questions: [
      { q: "Walking up mountains is called?", a: ["Hiking", "Bowling", "Napping"], c: 0 },
      { q: "Making bread or cakes is called?", a: ["Sculpting", "Baking", "Cycling"], c: 1 },
      { q: "What is Japanese paper folding?", a: ["Origami", "Sushi", "Yoga"], c: 0 },
      { q: "Which hobby uses a sewing machine?", a: ["Acting", "Sewing", "Coding"], c: 1 },
    ]
  }
];

const SquirrelGame = () => {
  const [gameState, setGameState] = useState('start'); // start, playing, transition, win
  const [currentStage, setCurrentStage] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const stageData = STAGES[currentStage];
  const progress = ((currentStage * 4) + currentQ) / 12;

  const handleAction = () => {
    setIsAnimating(true);
    // Simulate animation time before showing quiz
    setTimeout(() => {
      setShowQuiz(true);
      setIsAnimating(false);
    }, 1000);
  };

  const checkAnswer = (index) => {
    if (index === stageData.questions[currentQ].c) {
      if (currentQ < 3) {
        setCurrentQ(currentQ + 1);
        setShowQuiz(false);
      } else {
        setShowQuiz(false);
        if (currentStage < 2) {
          setGameState('transition');
        } else {
          setGameState('win');
        }
      }
    } else {
      alert("Wrong answer! Try again.");
    }
  };

  const nextStage = () => {
    setCurrentStage(currentStage + 1);
    setCurrentQ(0);
    setGameState('playing');
  };

  // Squirrel Position Calculation
  const babyStyle = {
    left: `${10 + (progress * 70)}%`,
    bottom: `${10 + (progress * 60)}%`
  };

  return (
    <div className="game-wrapper">
      <div className="game-container" style={{ backgroundColor: stageData.bgColor }}>
        
        {/* HUD */}
        <div className="hud">
          <span>Stage {currentStage + 1}: {stageData.title}</span>
          <span>Questions: {currentQ}/4</span>
        </div>

        {/* Start Screen */}
        {gameState === 'start' && (
          <div className="overlay">
            <h1>🐿️ Squirrel Rescue</h1>
            <p>Help the baby squirrel reach mommy by answering hobby questions!</p>
            <button onClick={() => setGameState('playing')}>Start Adventure</button>
          </div>
        )}

        {/* Transition Screen */}
        {gameState === 'transition' && (
          <div className="overlay">
            <h2>Area Cleared!</h2>
            <p>The baby squirrel is moving fast!</p>
            <button onClick={nextStage}>Go to Next Stage</button>
          </div>
        )}

        {/* Win Screen */}
        {gameState === 'win' && (
          <div className="overlay">
            <h1 style={{fontSize: '5rem'}}>🐿️❤️🐿️</h1>
            <h2>Family Reunited!</h2>
            <button onClick={() => window.location.reload()}>Play Again</button>
          </div>
        )}

        {/* Game World */}
        <div className="world">
          <div className="mommy">🐿️</div>
          <div className="baby" style={babyStyle}>🐿️‍❄️</div>

          {/* Dynamic Stage Visuals */}
          <div className={`stage-visual type-${stageData.type}`}>
            {stageData.type === 'claw' && (
              <div className={`claw-arm ${isAnimating ? 'animate-claw' : ''}`}>🏗️</div>
            )}
            {stageData.type === 'fish' && (
              <div className={`fishing-line ${isAnimating ? 'animate-fish' : ''}`}>🪝</div>
            )}
            {stageData.type === 'tree' && (
                <div className="tree-container">
                    <div className={`tree-icon ${isAnimating ? 'shake' : ''}`}>🌳</div>
                    {isAnimating && <div className="falling-acorn">🌰</div>}
                </div>
            )}
          </div>

          {!showQuiz && gameState === 'playing' && (
            <button 
              className="action-btn" 
              disabled={isAnimating}
              onClick={handleAction}
            >
              {stageData.btnText}
            </button>
          )}

          {/* Quiz Modal */}
          {showQuiz && (
            <div className="quiz-modal">
              <h3>{stageData.questions[currentQ].q}</h3>
              <div className="options">
                {stageData.questions[currentQ].a.map((opt, i) => (
                  <button key={i} onClick={() => checkAnswer(i)}>{opt}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SquirrelGame;