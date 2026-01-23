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
  "🐲 We need a distraction... Let's make a custom cake!",
  "🧁 Let's head to the pantry to find ingredients!"
];

const INGREDIENT_VISUALS = [
  { name: 'Milk', target: { x: '14%', y: '13%' }, bgAfter: '/pantry/milk_gone.jpg', image: '/pantry/milk.png' },
  { name: 'Eggs', target: { x: '26%', y: '39%' }, bgAfter: '/pantry/egg_gone.jpeg', image: '/pantry/egg.png' },
  { name: 'Frosting', target: { x: '54%', y: '51%' }, bgAfter: '/pantry/frosting_gone.jpeg', image: '/pantry/frosting.png' },
  { name: 'Flour', target: { x: '88%', y: '51%' }, bgAfter: '/pantry/flour_gone.jpeg', image: '/pantry/flour.png' },
  { name: 'Sugar', target: { x: '70%', y: '20%' }, bgAfter: '/pantry/sugar_gone.jpg', image: '/pantry/sugar.png' } 
];

const CastleGame = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scene, setScene] = useState('narrative'); 
  const [narrativeStep, setNarrativeStep] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [currentBg, setCurrentBg] = useState('/castle.jpg'); 
  const [squirrelPos, setSquirrelPos] = useState({ x: '50%', y: '70%' });
  const [showQuiz, setShowQuiz] = useState(false);
  const [isMoving, setIsMoving] = useState(false); 
  const [hasCake, setHasCake] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [userChoices, setUserChoices] = useState([]);
  const [miniInsight, setMiniInsight] = useState(null);

  const clickSound = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/quizzes/castle")
      .then((res) => res.json())
      .then((data) => {
        const actualData = Array.isArray(data) ? data : (data.questions || data.data || []);
        if (actualData.length > 0) {
          const formatted = actualData.map((q, index) => ({
            ...(INGREDIENT_VISUALS[index] || { name: 'Extra', target: {x:'50%', y:'50%'} }),
            question: q.question,
            options: [q.option_a, q.option_b, q.option_c, q.option_d]
          }));
          setQuestions(formatted);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    clickSound.current = new Audio("/sounds/click.mp3");
  }, []);

  const playSound = (filename) => {
    try {
      const audio = new Audio(`/sounds/${filename}`);
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleNextNarrative = () => {
    playSound('click.mp3');
    if (narrativeStep < 2) {
      setNarrativeStep(prev => prev + 1);
    } else {
      if (questions.length > 0) {
        setScene('pantry');
        setCurrentBg('/pantry/stocked.jpeg'); 
        setSquirrelPos({ x: '50%', y: '73%' });
      }
    }
  };

  const handleIngredientCollection = (optionIdx) => {
    playSound('click.mp3');
    const currentItem = questions[itemIndex];
    if (!currentItem) return;

    setUserChoices(prev => [...prev, optionIdx]);
    setShowQuiz(false);
    setIsMoving(true); 
    setSquirrelPos(currentItem.target);
    
    setTimeout(() => {
      if (currentItem.bgAfter) setCurrentBg(currentItem.bgAfter);
      
      setTimeout(() => {
        if (itemIndex < questions.length - 1) {
          setItemIndex(itemIndex + 1);
          setSquirrelPos({ x: '50%', y: '73%' }); 
          setTimeout(() => setIsMoving(false), 1200);
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
  };

  const calculateMiniInsight = () => {
    const counts = [0, 0, 0, 0];
    userChoices.forEach(idx => counts[idx]++);
    const maxIdx = counts.indexOf(Math.max(...counts));

    const messages = [
      "You have a vividly Creative mind! 🎨",
      "You seem like an energetic Doer! 🏃",
      "I see a sharp, Strategic thinker! 🧠",
      "You are a true People Person! 🤝"
    ];
    setMiniInsight(messages[maxIdx]);
  };

  const handleSneakPast = () => {
    playSound('click.mp3');
    setIsMoving(true);
    setSquirrelPos({ x: '115%', y: '75%' });
    setTimeout(() => {
        calculateMiniInsight();
    }, 1500);
  };

  const finalizeGame = () => {
    setMiniInsight(null);
    setScene('end');
    const raw = localStorage.getItem("gameResults");
    const gameResults = raw ? JSON.parse(raw) : {};
    gameResults.castleGame = { completed: true, choices: userChoices, completedAt: Date.now() };
    localStorage.setItem("gameResults", JSON.stringify(gameResults));
    
    const message = INSPIRATION_TEXTS[Math.floor(Math.random() * INSPIRATION_TEXTS.length)];
    typeEndingText(message);
  };

  const typeEndingText = (text) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTypedText("");
    let i = 0;
    const type = () => {
      if (i < text.length) {
        setTypedText(text.substring(0, i + 1));
        i++;
        typingTimeoutRef.current = setTimeout(type, 50);
      } else {
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => navigate("/game-map"), 800);
        }, 2000);
      }
    };
    type();
  };

  if (loading) return <div className="castle-scene">Loading...</div>;

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

      {(scene === 'narrative' || (scene === 'pantry' && !showQuiz && !isMoving) || scene === 'finale') && (
        <div className="story-chat">
          <div className="chat-bubble">
            
            {/* Conditional Icon Rendering */}
            {scene === 'pantry' && (
              <div className="icon-container">
                {questions[itemIndex]?.image ? (
                  <img src={process.env.PUBLIC_URL + questions[itemIndex].image} alt="item" className="bubble-item-img" />
                ) : (
                  <span className="squirrel-icon">🐿️</span>
                )}
              </div>
            )}

            <p>
                {scene === 'narrative' && STORY_STEPS[narrativeStep]}
                {scene === 'pantry' && `Help Bibble find the ${questions[itemIndex]?.name}`}
                {scene === 'finale' && "The Dragon loves your cake and fell asleep! Time to sneak past."}
            </p>
          </div>
          <button className="story-btn" onClick={scene === 'finale' ? handleSneakPast : (scene === 'pantry' ? () => setShowQuiz(true) : handleNextNarrative)}>
            {scene === 'finale' ? "Sneak Past" : (scene === 'pantry' ? `Get ${questions[itemIndex]?.name}` : "Next")}
          </button>
        </div>
      )}

      {showQuiz && (
        <div className="quiz-card">
          <h3>Getting {questions[itemIndex]?.name}</h3>
          <p>{questions[itemIndex]?.question}</p>
          <div className="options-grid">
            {questions[itemIndex]?.options.map((opt, idx) => (
              <button key={idx} className="option-btn" onClick={() => handleIngredientCollection(idx)}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      {scene === 'baking' && (
        <div className="overlay-baking">
          <div className="baking-loader">🧁 Baking your cake...</div>
        </div>
      )}

      {scene === 'end' && (
        <div className="story-chat">
          <div className="chat-bubble">
            {/* Removed squirrel span here too for a clean ending */}
            <p>{typedText}</p>
          </div>
        </div>
      )}

      {miniInsight && (
        <div className="modal-overlay">
          <div className="insight-card">
            <h1>Adventure Complete!</h1>
            <div className="insight-icon">🏰</div>
            <h2>{miniInsight}</h2>
            <button className="final-btn" onClick={finalizeGame}>
              Continue Adventure
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CastleGame;