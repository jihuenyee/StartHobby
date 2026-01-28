import React, { useState } from 'react';
import "../styles/Game.css";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
  {
    id: 0,
    title: "The Arcade Claw Machine",
    type: "claw",
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
    title: "The Deep Fishing Pond",
    type: "fish",
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
    title: "The Golden Acorn Tree",
    type: "tree",
    btnText: "Shake the Tree!",
    questions: [
      { q: "Walking up mountains is called?", a: ["Hiking", "Bowling", "Napping"], c: 0 },
      { q: "Making bread or cakes is called?", a: ["Sculpting", "Baking", "Cycling"], c: 1 },
      { q: "What is Japanese paper folding?", a: ["Origami", "Sushi", "Yoga"], c: 0 },
      { q: "Which hobby uses a sewing machine?", a: ["Acting", "Sewing", "Coding"], c: 1 },
    ]
  }
];

const BACKSTORY = [
  "One day, Bibble was playing with Mommy Squirrel near the flowers...",
  "But suddenly, a giant gust of wind blew Bibble far away!",
  "Mommy Squirrel searched everywhere, but Bibble was nowhere to be found.",
  "Bibble is lost in the unknown woods. Will you help him get home?"
];

const Game = () => {
  const [gameState, setGameState] = useState('start'); // start, backstory, choice, playing, transition, win
  const [backstoryIndex, setBackstoryIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const stageData = STAGES[currentStage] || STAGES[0];
  const progress = ((currentStage * 4) + currentQ) / 12;

  // --- HANDLERS ---
  const nextBackstory = () => {
    if (backstoryIndex < BACKSTORY.length - 1) setBackstoryIndex(backstoryIndex + 1);
    else setGameState('choice');
  };

  const handleAction = () => {
    setIsAnimating(true);
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
        if (currentStage < 2) setGameState('transition');
        else setGameState('win');
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

  // --- RENDER BACKSTORY ---
  const renderBackstoryScene = () => (
    <div className="backstory-fullscreen" style={{ backgroundImage: `url('/bg.png')` }}>
      <div className="illustration-area">
        <AnimatePresence mode="wait">
          {backstoryIndex === 0 && (
            <motion.div key="s0" className="scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <img src="/squirrel.png" className="mommy-img" alt="Mommy" />
               <img src="/squirrel.png" className="baby-img" alt="Bibble" />
            </motion.div>
          )}
          {backstoryIndex === 1 && (
            <motion.div key="s1" className="scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <img src="/squirrel.png" className="mommy-img" alt="Mommy" />
              <motion.img 
                src="/squirrel.png" className="baby-img"
                animate={{ x: 1000, y: -500, rotate: 1080, scale: 0.2 }}
                transition={{ duration: 3 }}
              />
              {[...Array(8)].map((_, i) => (
                <motion.div key={i} className="wind-line" animate={{ x: [-100, 1200] }} transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} style={{ top: 100 + i * 50 }} />
              ))}
            </motion.div>
          )}
          {backstoryIndex === 2 && (
            <motion.div key="s2" className="scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.img src="/squirrel.png" className="mommy-img" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} />
            </motion.div>
          )}
          {backstoryIndex === 3 && (
            <motion.div key="s3" className="scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="dark-overlay" />
              <motion.img src="/squirrel.png" className="baby-img-center" animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="story-ui-overlay">
        <AnimatePresence mode="wait"><motion.h2 key={backstoryIndex} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>{BACKSTORY[backstoryIndex]}</motion.h2></AnimatePresence>
        <button className="next-btn" onClick={nextBackstory}>Next →</button>
      </div>
    </div>
  );

  return (
    <div className="game-wrap">
      <div className="game-contain" style={{ backgroundImage: `url('/bg.png')`, backgroundSize: 'cover' }}>
        
        {/* HUD */}
        {gameState === 'playing' && (
          <div className="hud">
            <span>Stage {currentStage + 1}: {stageData.title}</span>
            <span>Questions: {currentQ}/4</span>
          </div>
        )}

        {/* 1. START */}
        {gameState === 'start' && (
          <div className="overlay start-screen" style={{ backgroundImage: `url('/bg.png')`, backgroundSize: 'cover' }}>
            <h1 className="game-title">Find Your Ideal Hobbies <br></br> Through Bibble's Adventure</h1>
            <button className="next-btn" onClick={() => setGameState('backstory')}>Start Adventure</button>
          </div>
        )}

        {/* 2. BACKSTORY */}
        {gameState === 'backstory' && renderBackstoryScene()}

        {/* 3. CHOICE */}
        {gameState === 'choice' && (
          <div className="overlay choice-screen">
            <h2>Which path should Bibble take?</h2>
            <div className="choice-container">
              <button className="choice-btn" onClick={() => setGameState('playing')}>🌲 Forest Path</button>
              <button className="choice-btn" onClick={() => setGameState('playing')}>🌻 Meadow Path</button>
              <button className="choice-btn" onClick={() => setGameState('playing')}>💧 River Side</button>
            </div>
          </div>
        )}

        {/* 4. TRANSITION */}
        {gameState === 'transition' && (
          <div className="overlay">
            <h2>Area Cleared!</h2>
            <p>Bibble is getting closer to home...</p>
            <button className="next-btn" onClick={nextStage}>Continue</button>
          </div>
        )}

        {/* 5. WIN */}
        {gameState === 'win' && (
          <div className="overlay win-screen">
            <div className="reunited-visual">
                <img src="/squirrel.png" style={{width: '150px'}} alt="Mommy" />
                <img src="/squirrel.png" style={{width: '80px'}} alt="Baby" />
            </div>
            <h1>Family Reunited!</h1>
            <button className="next-btn" onClick={() => window.location.reload()}>Play Again</button>
          </div>
        )}

        {/* --- GAME WORLD --- */}
        <div className="world" style={{ visibility: gameState === 'playing' ? 'visible' : 'hidden' }}>
          <img src="/squirrel.png" className="mommy-game" alt="Mommy" />
          <motion.img 
             src="/squirrel.png" 
             className="baby-game" 
             animate={{ 
               left: `${10 + (progress * 70)}%`, 
               bottom: `${15 + (progress * 50)}%` 
             }}
             transition={{ type: 'spring', stiffness: 50 }}
          />

          <div className={`stage-visual type-${stageData.type}`}>
            {stageData.type === 'claw' && <div className={`claw-arm ${isAnimating ? 'animate-claw' : ''}`}>🏗️</div>}
            {stageData.type === 'fish' && <div className={`fishing-line ${isAnimating ? 'animate-fish' : ''}`}>🪝</div>}
            {stageData.type === 'tree' && (
                <div className="tree-container">
                    <div className={`tree-icon ${isAnimating ? 'shake' : ''}`}>🌳</div>
                    {isAnimating && <motion.div initial={{y:0}} animate={{y:300}} className="falling-acorn">🌰</motion.div>}
                </div>
            )}
          </div>

          {!showQuiz && (
            <button className="action-btn" disabled={isAnimating} onClick={handleAction}>
              {stageData.btnText}
            </button>
          )}

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

export default Game;