import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import "../styles/CastleGame.css";

const INSPIRATION_TEXTS = [
  "Nice choice. Your intuition reveals a creative spirit.",
  "Every preference tells a story of who you are becoming.",
  "You follow your heart rather than the rules — that is a gift.",
  "The dragon senses your unique energy through the choices you made."
];

const STORY_STEPS = [
  "🏰 You've reached the Ancient Castle, but a giant dragon blocks the way!",
  "🐲 We need a distraction... Let's make a cake!",
  "🧁 Let's head to the pantry to find ingredients!"
];

const INGREDIENTS = [
  { 
    name: 'Milk', 
    target: { x: '14%', y: '13%' },
    bgAfter: '/pantry/milk_gone.jpg', 
    question: "What kind of energy should the base of this cake have?",
    options: ["Pure & Traditional", "Wild & Magical", "Sweet & Gentle", "Bold & Rich"],
  },
  { 
    name: 'Eggs', 
    target: { x: '26%', y: '39%' }, 
    bgAfter: '/pantry/egg_gone.jpeg', 
    question: "How do you usually approach a big challenge?",
    options: ["Crack right into it!", "Handle with extreme care", "Look for the golden opportunity", "Ask for a friend's help"],
  },
  { 
    name: 'Frosting', 
    target: { x: '54%', y: '51%' }, 
    bgAfter: '/pantry/frosting_gone.jpeg', 
    question: "What's the 'flavor' of your personality?",
    options: ["Classic & Reliable", "Sparkly & Dramatic", "Dark & Mysterious", "Zesty & Adventurous"],
  },
  { 
    name: 'Flour', 
    target: { x: '88%', y: '51%' }, 
    bgAfter: '/pantry/flour_gone.jpeg', 
<<<<<<< HEAD
    question: "When you create something, what is most important?",
    options: ["The final result", "The fun of the process", "Making others happy", "Learning something new"],
=======
    question: "In baking, what makes bread rise?",
    options: ["Sugar", "Salt", "Yeast", "Butter"],
    correct: 2,
    type: "Strategic"
>>>>>>> bd91329 (final result)
  }
];

const CastleGame = () => {
  const navigate = useNavigate();
  const [scene, setScene] = useState('narrative'); 
  const [narrativeStep, setNarrativeStep] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [currentBg, setCurrentBg] = useState('/castle.jpg'); // Ensure this image exists in public/
  const [squirrelPos, setSquirrelPos] = useState({ x: '50%', y: '70%' });
  const [showQuiz, setShowQuiz] = useState(false);
<<<<<<< HEAD
  const [isMoving, setIsMoving] = useState(false);
  const [hasCake, setHasCake] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [userChoices, setUserChoices] = useState([]); 
=======
  const [isMoving, setIsMoving] = useState(false); 
  const [hasCake, setHasCake] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [collectedTypes, setCollectedTypes] = useState([]);
>>>>>>> bd91329 (final result)

  const clickSound = useRef(null);

  // --- SAFE AUDIO HELPER ---
  const createAudio = (path) => {
    const audio = new Audio(path);
    audio.onerror = () => console.warn(`Missing audio: ${path}`);
    return audio;
  };

  const safePlay = (audioRef) => {
    if (audioRef.current) audioRef.current.play().catch(() => {});
  };

  useEffect(() => {
    clickSound.current = createAudio("/sounds/click.mp3");
  }, []);

  const handleNextNarrative = () => {
    safePlay(clickSound);
    if (narrativeStep < STORY_STEPS.length - 1) {
      setNarrativeStep(prev => prev + 1);
    } else {
      setScene('pantry');
      setCurrentBg('/pantry/stocked.jpeg'); // Ensure this image exists
      setSquirrelPos({ x: '45%', y: '85%' });
    }
  };

  const handleIngredientCollection = (optionIdx) => {
    safePlay(clickSound);
    const currentItem = INGREDIENTS[itemIndex];
<<<<<<< HEAD
    const choice = currentItem.options[optionIdx];
    setUserChoices(prev => [...prev, choice]);

    setShowQuiz(false);
    setIsMoving(true); 
    setSquirrelPos(currentItem.target);
    
    setTimeout(() => {
      setCurrentBg(currentItem.bgAfter);
      setTimeout(() => {
        if (itemIndex < INGREDIENTS.length - 1) {
          setItemIndex(itemIndex + 1);
          setSquirrelPos({ x: '45%', y: '85%' }); 
          
          setTimeout(() => {
            setIsMoving(false); 
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
=======
    if (optionIdx === currentItem.correct) {
      // Save type
      setCollectedTypes([...collectedTypes, currentItem.type]);

      setShowQuiz(false);
      setIsMoving(true); 
      setSquirrelPos(currentItem.target);
      
      setTimeout(() => {
        // Change background if you have individual images, else keep current
        if (currentItem.bgAfter) setCurrentBg(currentItem.bgAfter);
        
        setTimeout(() => {
          if (itemIndex < INGREDIENTS.length - 1) {
            setItemIndex(itemIndex + 1);
            setSquirrelPos({ x: '45%', y: '85%' }); // Move back to floor
            
            setTimeout(() => {
              setIsMoving(false); 
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
>>>>>>> bd91329 (final result)
  };

  const handleSneakPast = () => {
    safePlay(clickSound);
    setIsMoving(true);
    setSquirrelPos({ x: '115%', y: '75%' });
    setTimeout(() => triggerEndingSequence(), 1500);
  };

  const triggerEndingSequence = () => {
    setScene('end');
    const raw = localStorage.getItem("gameResults");
    const gameResults = raw ? JSON.parse(raw) : {};
<<<<<<< HEAD
    gameResults.castleGame = { 
      completed: true, 
      personalityChoices: userChoices, 
      completedAt: Date.now() 
    };
=======
    
    gameResults.castleGame = { 
        completed: true, 
        answers: [], 
        types: collectedTypes,
        completedAt: Date.now() 
    };
    
>>>>>>> bd91329 (final result)
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
    <div className={`castle-scene ${isExiting ? "exit" : ""}`} style={{ backgroundImage: `url(${process.env.PUBLIC_URL + currentBg})` }}>
      
      {scene !== 'end' && (
        <div 
          className={`baby-squirrel ${scene === 'narrative' ? `walk-step-${narrativeStep}` : ''}`}
          style={(scene === 'pantry' || scene === 'finale' || scene === 'baking') ? 
            { left: squirrelPos.x, top: squirrelPos.y, transform: 'none' } : {}}
        >
          {hasCake ? '🐿️' : '🐿️'}
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

<<<<<<< HEAD
      {/* CHANGED: Dynamic button text here */}
=======
      {/* Button only appears when NOT moving */}
>>>>>>> bd91329 (final result)
      {scene === 'pantry' && !showQuiz && !isMoving && (
        <div className="story-box">
          <p>Help Bibble find the <b>{INGREDIENTS[itemIndex].name}</b></p>
          <button className="story-btn" onClick={() => setShowQuiz(true)}>
            Get {INGREDIENTS[itemIndex].name}
          </button>
        </div>
      )}

      {showQuiz && (
        <div className="quiz-card">
          <h3>Selecting {INGREDIENTS[itemIndex].name}</h3>
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
          <p>The Dragon loves your cake and fell asleep! Time to sneak past.</p>
          <button className="story-btn" onClick={handleSneakPast}>Continue Journey</button>
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