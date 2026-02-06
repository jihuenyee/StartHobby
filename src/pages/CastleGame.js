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
  "🏰 You've reached the Castle, but a giant dragon blocks the way!",
  "🐲 We need a distraction... Let's make a custom cake!",
  "🧁 Let's head to the pantry to find ingredients!"
];

const INGREDIENT_VISUALS = [
  { name: 'Milk', target: { x: '14%', y: '13%' }, bgAfter: '/pantry/milk_gone.jpg', image: '/pantry/milk.png' },
  { name: 'Eggs', target: { x: '26%', y: '39%' }, bgAfter: '/pantry/egg_gone.jpeg', image: '/pantry/egg.png' },
  { name: 'Frosting', target: { x: '54%', y: '51%' }, bgAfter: '/pantry/frosting_gone.jpeg', image: '/pantry/frosting.png' },
  { name: 'Flour', target: { x: '88%', y: '51%' }, bgAfter: '/pantry/flour_gone.jpeg', image: '/pantry/flour.png' },
  { name: 'Sugar', target: { x: '61%', y: '26%' }, bgAfter: '/pantry/sugar_gone.jpeg', image: '/pantry/sugar.png' } 
];

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://starthobbybackend-production.up.railway.app"
    : "http://localhost:5000";

const CastleGame = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scene, setScene] = useState('narrative'); 
  const [narrativeStep, setNarrativeStep] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [currentBg, setCurrentBg] = useState('/backgrounds/castle.jpg'); 
  const [squirrelPos, setSquirrelPos] = useState({ x: '50%', y: '70%' });
  const [showQuiz, setShowQuiz] = useState(false);
  const [isMoving, setIsMoving] = useState(false); 
  const [hasCake, setHasCake] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [userChoices, setUserChoices] = useState([]);
  
  // AI Insights States
  const [miniInsight, setMiniInsight] = useState(false);
  const [personalityType, setPersonalityType] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);

  const bgSound = useRef(null);
  const clickSound = useRef(null);
  const winSound = useRef(null); // Added win sound
  const typingTimeoutRef = useRef(null);

  const PANTRY_DEFAULT = '/pantry/stocked.jpeg';

  const changeBgSafely = (targetPath, fallbackPath = PANTRY_DEFAULT) => {
    const img = new Image();
    img.src = process.env.PUBLIC_URL + targetPath;
    img.onload = () => setCurrentBg(targetPath);
    img.onerror = () => {
      console.warn(`Failed to load ${targetPath}, falling back to ${fallbackPath}`);
      setCurrentBg(fallbackPath);
    };
  };

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
      } catch (e) {}
    }
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/quizzes/castle`)
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

    bgSound.current = createAudio("/sounds/castle.mp3", true, 0.4);
    clickSound.current = createAudio("/sounds/click.mp3", false, 0.5);
    winSound.current = createAudio("/sounds/win.mp3", false, 0.6); // Initialize win sound
    
    safePlay(bgSound);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      safePause(bgSound);
    };
  }, []);

  useEffect(() => {
    if (!bgSound.current) return;
    const targetTrack = scene === 'pantry' ? "/sounds/pantry.mp3" : "/sounds/castle.mp3";
    if (!bgSound.current.src.includes(targetTrack)) {
        bgSound.current.src = targetTrack;
        bgSound.current.load();
        safePlay(bgSound);
    }
  }, [scene]);

  const handleNextNarrative = () => {
    safePlay(clickSound);
    if (narrativeStep < 2) {
      setNarrativeStep(prev => prev + 1);
    } else {
      if (questions.length > 0) {
        setScene('pantry');
        changeBgSafely(PANTRY_DEFAULT, '/backgrounds/castle.jpg');
        setSquirrelPos({ x: '50%', y: '73%' });
      }
    }
  };

  const handleIngredientCollection = (optionIdx) => {
    safePlay(clickSound);
    const currentItem = questions[itemIndex];
    if (!currentItem) return;

    setUserChoices(prev => [
      ...prev,
      {
        question: currentItem.question,
        answer: currentItem.options[optionIdx]
      }
    ]);

    setShowQuiz(false);
    setIsMoving(true); 
    setSquirrelPos(currentItem.target);
    
    setTimeout(() => {
      if (currentItem.bgAfter) {
          changeBgSafely(currentItem.bgAfter, PANTRY_DEFAULT);
      }
      
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
            setCurrentBg('/backgrounds/castle.jpg');
            setSquirrelPos({ x: '10%', y: '75%' });
            setIsMoving(false);
          }, 3000);
        }
      }, 800);
    }, 1000);
  };

  // NEW: AI Analysis fetch logic
  const fetchAIAnalysis = async () => {
    setAnalyzingAI(true);
    setMiniInsight(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/quizzes/castle/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: userChoices }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analysis) {
          setAiAnalysis(data.analysis);
          setPersonalityType(data.analysis.personalityType || "The Royal Baker");
        }
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
      setPersonalityType("The Royal Baker! 🏰");
    } finally {
      setAnalyzingAI(false);
      safePlay(winSound);
    }
  };

  const handleSneakPast = () => {
    safePlay(clickSound);
    setIsMoving(true);
    setSquirrelPos({ x: '115%', y: '75%' });
    setTimeout(() => {
        fetchAIAnalysis(); // Call the AI logic
    }, 1500);
  };

  const finalizeGame = () => {
    setMiniInsight(false);
    setScene('end');
    const raw = localStorage.getItem("gameResults");
    const gameResults = raw ? JSON.parse(raw) : {};
    gameResults.castleGame = {
      completed: true,
      answers: userChoices,
      completedAt: Date.now()
    };

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
    <div 
      className={`castle-scene ${isExiting ? "exit" : ""}`} 
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL + currentBg})` }}
      onClick={() => safePlay(bgSound)}
    >
      
      {scene !== 'end' && (
        <div 
          className={`baby-squirrel ${scene === 'narrative' ? `walk-step-${narrativeStep}` : ''}`}
          style={(scene === 'pantry' || scene === 'finale' || scene === 'baking') ? 
            { left: squirrelPos.x, top: squirrelPos.y, transform: 'none' } : {}}
        >
          🐿️
        </div>
      )}

      {(scene === 'narrative' || scene === 'finale') && scene !== 'end' && (
        <div className="dragon-entity" style={{ right: hasCake ? '20%' : '35%' }}>
          {hasCake ? '💤🐲' : '🐲'}
          {hasCake && <div className="cake-placed">🎂</div>}
        </div>
      )}

      {(scene === 'narrative' || (scene === 'pantry' && !showQuiz && !isMoving) || scene === 'finale') && !miniInsight && (
        <div className="story-chat">
          <div className="chat-bubble">
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
          <div className="baking-loader">🎂 Baking your cake...</div>
        </div>
      )}

      {scene === 'end' && (
        <div className="story-chat">
          <div className="chat-bubble">
            <p>{typedText}</p>
          </div>
        </div>
      )}

      {/* NEW: Shared AI Insight Modal UI */}
      {miniInsight && (
        <div className="modal-overlay">
          <div className="insight-card">
            {analyzingAI ? (
              <div className="processing-container">
                <div className="insight-icon magical-glow">🔮</div>
                <h1>Reviewing Your Recipe</h1>
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
                <p className="analyzing-text">Our AI is analyzing your creative choices...</p>
              </div>
            ) : (
              <>
                <div className="success-header">
                  <div className="celebration-icons">
                    <span className="float-icon">🎉</span>
                    <span className="float-icon delay-1">✨</span>
                  </div>
                  <div className="insight-icon celebration">🏰</div>
                  <h1 className="success-title">Castle Cleared!</h1>
                </div>
                
                <div className="personality-badge">
                  <div className="badge-decoration">✨</div>
                  <h2 className="personality-type">{personalityType}</h2>
                  <div className="badge-decoration">✨</div>
                </div>
                
                {aiAnalysis?.encouragingMessage && (
                  <div className="encouraging-message">
                    <p className="encourage-text">{aiAnalysis.encouragingMessage}</p>
                  </div>
                )}

                <div className="next-game-hint">
                  <p><strong>Victory is yours!</strong><br/> Your final hobby recommendations are being prepared.</p>
                </div>

                <button className="final-btn" onClick={finalizeGame}>
                  <span>Continue Journey</span>
                  <span className="btn-shine"></span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CastleGame;