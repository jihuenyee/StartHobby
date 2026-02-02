import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GameMap.css";

const STORY_FIRST = "A baby squirrel is lost in the forest. One brave step begins the journey home.";
const STORY_SECOND = "The squirrel feels braver now. A new challenge awaits deeper in the forest.";
const STORY_THIRD = "Only one final challenge remains. Home is close.";

export default function GameMap() {
  const navigate = useNavigate();
  const sceneRef = useRef(null);

  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState("story"); 
  const [entry, setEntry] = useState("first"); 

  const bgSound = useRef(null);
  const footstepSound = useRef(null);
  const clickSound = useRef(null);

  const gameResults = useMemo(() => {
    return (
      JSON.parse(localStorage.getItem("gameResults")) || {
        clawGame: { completed: false },
        castleGame: { completed: false },
        snakeGame: { completed: false },
      }
    );
  }, []);

  useEffect(() => {
    bgSound.current = new Audio("/sounds/GamemapBG.mp3");
    bgSound.current.loop = true;
    bgSound.current.volume = 0.5;
    bgSound.current.play().catch(() => {});
    
    footstepSound.current = new Audio("/sounds/footsteps.mp3");
    clickSound.current = new Audio("/sounds/click.mp3");

    return () => {
      bgSound.current.pause();
      bgSound.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (gameResults.castleGame?.completed) {
      setEntry("third");
    } else if (gameResults.clawGame?.completed) {
      setEntry("second");
    } else {
      setEntry("first");
    }
  }, [gameResults]);

  useEffect(() => {
    let text = STORY_FIRST;
    if (entry === "second") text = STORY_SECOND;
    if (entry === "third") text = STORY_THIRD;

    setTypedText(""); 
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(text.slice(0, i)); 
      if (i === text.length) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [entry]);

  const startGame = () => {
    clickSound.current?.play().catch(() => {});
    setPhase("walking");
    footstepSound.current?.play().catch(() => {});

    setTimeout(() => {
      setPhase("entering");
      footstepSound.current?.pause();
    }, 2600);

    setTimeout(() => {
      sceneRef.current?.classList.add("zoom");
    }, 3200);

    setTimeout(() => {
      bgSound.current?.pause();
      if (entry === "first") navigate("/claw-quiz-game");
      else if (entry === "second") navigate("/castle-game");
      else if (entry === "third") navigate("/snake-ladder-game"); 
      else navigate("/result");
    }, 4000);
  };

  // UPDATED LOGIC FOR CORRECT ENTRY
  const getSquirrelClass = () => {
    let base = "map-squirrel";

    // 1. Entering Phase (The Fix)
    if (phase === "entering") {
      if (entry === "first") return `${base} entering-1`;
      if (entry === "second") return `${base} entering-2`;
      if (entry === "third") return `${base} entering-3`;
    }

    // 2. Walking Phase
    if (phase === "walking") {
      if (entry === "first") return `${base} walking`;
      if (entry === "second") return `${base} second-walk`;
      if (entry === "third") return `${base} third-walk`;
    }

    // 3. Story Phase (Static Waiting)
    if (entry === "first") return `${base} start-forest`;
    if (entry === "second") return `${base} waiting-1`;
    if (entry === "third") return `${base} waiting-2`;

    return base;
  };

  return (
    <div ref={sceneRef} className="map-scene">
      
      {/* 🐿️ SQUIRREL */}
      <div className={getSquirrelClass()}>🐿️</div>

      <div className={`map-building building-1 ${gameResults.clawGame?.completed ? "completed" : "glow"}`}>
        <div className={`door ${phase === "entering" && entry === "first" ? "open" : ""}`} />
        🏠
      </div>

      <div className={`map-building building-2 ${gameResults.clawGame?.completed ? (gameResults.castleGame?.completed ? "completed" : "glow") : "locked"}`}>
        <div className={`door ${phase === "entering" && entry === "second" ? "open" : ""}`} />
        🏰
      </div>

      <div className={`map-building building-3 ${gameResults.castleGame?.completed ? "glow" : "locked"}`}>
        <div className={`door ${phase === "entering" && entry === "third" ? "open" : ""}`} />
        🏯
      </div>

      {phase === "story" && (
        <div className="story-chat">
          <div className="chat-bubble">
            <span className="squirrel-icon">🐿️</span>
            <p>{typedText}</p>
          </div>
          <button className="start-btn" onClick={startGame}>Start Adventure</button>
        </div>
      )}
    </div>
  );
}