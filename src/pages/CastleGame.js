import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";

import "../styles/CastleGame.css";

const INSPIRATION_TEXTS = [
  "Nice choice. Sometimes curiosity leads us to unexpected paths.",
  "Every small preference shapes who we are becoming.",
  "You’re discovering what excites you — keep going.",
  "This journey is just getting interesting…"
];

const STORY_STEPS = [
  "🏰 You've reached the Ancient Castle, but a giant dragon blocks the way!",
  "🐲 He looks grumpy because he's hungry... maybe a cake will cheer him up?",
  "🧁 Let's head to the pantry and find the ingredients!"
];

const INGREDIENTS = [
  { 
    name: 'Milk', 
    target: { x: '10%', y: '15%' },
    bgAfter: '/pantry/milk_gone.jpg', 
    question: "Which hobby involves 'Philately'?",
    options: ["Stamp Collecting", "Star Gazing", "Bird Watching", "Coin Collecting"],
    correct: 0 
  },
  { 
    name: 'Eggs', 
    target: { x: '26%', y: '39%' }, 
    bgAfter: '/pantry/egg_gone.jpeg', 
    question: "What is the standard number of strings on a guitar?",
    options: ["4", "5", "6", "8"],
    correct: 2 
  },
  { 
    name: 'Frosting', 
    target: { x: '54%', y: '51%' }, 
    bgAfter: '/pantry/frosting_gone.jpeg', 
    question: "Which art form uses 'Bokeh' as a common term?",
    options: ["Painting", "Photography", "Sculpting", "Dance"],
    correct: 1 
  },
  { 
    name: 'Flour', 
    target: { x: '88%', y: '51%' }, 
    bgAfter: '/pantry/flour_gone.jpeg', 
    question: "In baking, what makes bread rise?",
    options: ["Sugar", "Salt", "Yeast", "Butter"],
    correct: 2 
  }
];

const CastleGame = () => {
  const navigate = useNavigate();
  const [scene, setScene] = useState('narrative'); 
  const [narrativeStep, setNarrativeStep] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [currentBg, setCurrentBg] = useState('/castle.jpg');
  const [squirrelPos, setSquirrelPos] = useState({ x: '50%', y: '70%' });
  const [showQuiz, setShowQuiz] = useState(false);
  const [isMoving, setIsMoving] = useState(false); // NEW: Track movement
  const [hasCake, setHasCake] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [typedText, setTypedText] = useState("");

  const clickSound = useRef(null);

  useEffect(() => {
    clickSound.current = new Audio("/sounds/click.mp3");
  }, []);

  const handleNextNarrative = () => {
    clickSound.current?.play();
    if (narrativeStep < STORY_STEPS.length - 1) {
      setNarrativeStep(prev => prev + 1);
    } else {
      setScene('pantry');
      setCurrentBg('/pantry/stocked.jpeg');
      setSquirrelPos({ x: '45%', y: '85%' });
    }
  };

  const handleIngredientCollection = (optionIdx) => {
    const currentItem = INGREDIENTS[itemIndex];
    if (optionIdx === currentItem.correct) {
      setShowQuiz(false);
      setIsMoving(true); // START MOVING
      setSquirrelPos(currentItem.target);
      
      setTimeout(() => {
        setCurrentBg(currentItem.bgAfter);
        setTimeout(() => {
          if (itemIndex < INGREDIENTS.length - 1) {
            setItemIndex(itemIndex + 1);
            setSquirrelPos({ x: '45%', y: '85%' }); // Move back to floor
            
            // Wait for return transition (1.2s) before showing button again
            setTimeout(() => {
              setIsMoving(false); // FINISHED MOVING
            }, 1200);
            
          } else {
            setScene('baking');
            setTimeout(() => {
              setHasCake(true);
              setScene('finale');
              setCurrentBg('/castle.jpg');
              setSquirrelPos({ x: '10%', y: '75%' });
              setIsMoving(false);
            }, 3000);
          }
        }, 800);
      }, 1000);
    } else {
      alert("Wrong answer! The squirrel is confused.");
    }
  };

  const handleSneakPast = () => {
    clickSound.current?.play();
    setIsMoving(true);
    setSquirrelPos({ x: '115%', y: '75%' });
    setTimeout(() => triggerEndingSequence(), 1500);
  };

  const triggerEndingSequence = () => {
    setScene('end');
    const raw = localStorage.getItem("gameResults");
    const gameResults = raw ? JSON.parse(raw) : {};
    gameResults.castleGame = { completed: true, answers: [], completedAt: Date.now() };
    localStorage.setItem("gameResults", JSON.stringify(gameResults));
    const message = INSPIRATION_TEXTS[Math.floor(Math.random() * INSPIRATION_TEXTS.length)];
    typeEndingText(message);
  };

  const typeEndingText = (text) => {
    let i = 0;
    setTypedText("");
    const interval = setInterval(() => {
      setTypedText(prev => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => navigate("/game-map"), 800);
        }, 2000);
      }
    }, 45);
  };

  return (
    <div className={`castle-scene ${isExiting ? "exit" : ""}`} style={{ backgroundImage: `url(${currentBg})` }}>
      
      {scene !== 'end' && (
        <div 
          className={`baby-squirrel ${scene === 'narrative' ? `walk-step-${narrativeStep}` : ''}`}
          style={(scene === 'pantry' || scene === 'finale' || scene === 'baking') ? 
            { left: squirrelPos.x, top: squirrelPos.y, transform: 'none' } : {}}
        >
          {hasCake ? '🐿️🎂' : '🐿️'}
        </div>
      )}

      {(scene === 'narrative' || scene === 'finale') && scene !== 'end' && (
        <div className="dragon-entity" style={{ right: hasCake ? '20%' : '35%' }}>
          {hasCake ? '💤🐲' : '🐲'}
          {hasCake && <div className="cake-placed">🎂</div>}
        </div>
      )}

      {scene === 'narrative' && (
        <div className="story-box">
          <p>{STORY_STEPS[narrativeStep]}</p>
          <button className="story-btn" onClick={handleNextNarrative}>
            {narrativeStep < STORY_STEPS.length - 1 ? "Next" : "Go to Pantry"}
          </button>
        </div>
      )}

      {/* MODIFIED: Added !isMoving condition here */}
      {scene === 'pantry' && !showQuiz && !isMoving && (
        <div className="story-box">
          <p>Help Bibble find the <b>{INGREDIENTS[itemIndex].name}</b></p>
          <button className="story-btn" onClick={() => setShowQuiz(true)}>Search Shelf</button>
        </div>
      )}

      {showQuiz && (
        <div className="quiz-card">
          <h3>Collecting {INGREDIENTS[itemIndex].name}</h3>
          <p>{INGREDIENTS[itemIndex].question}</p>
          <div className="options-grid">
            {INGREDIENTS[itemIndex].options.map((opt, idx) => (
              <button key={idx} className="option-btn" onClick={() => handleIngredientCollection(idx)}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      {scene === 'baking' && (
        <div className="overlay-baking">
          <div className="baking-loader">🧁 Baking...</div>
        </div>
      )}

      {scene === 'finale' && (
        <div className="story-box">
          <p>The Dragon is asleep! Now is our chance to sneak past.</p>
          <button className="story-btn" onClick={handleSneakPast}>Sneak Past</button>
        </div>
      )}

      {scene === 'end' && (
        <div className="story-box">
          <p>{typedText}</p>
        </div>
      )}
    </div>
  );
};

export default CastleGame;