import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GameMap.css";

const STORY_TEXT =
  "A baby squirrel is lost in the forest. Help guide it through challenges and reunite it with its family.";

export default function GameMap() {
  const navigate = useNavigate();
  const sceneRef = useRef(null);

  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState("story"); 
  // story → walking → entering

  const footstepSound = useRef(null);
  const clickSound = useRef(null);

  /* ⌨️ Typing animation */
  useEffect(() => {
    let index = 0;
    setTypedText("");

    const interval = setInterval(() => {
      if (index < STORY_TEXT.length) {
        setTypedText((prev) => prev + STORY_TEXT.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, []);

  /* 🔊 Init sounds */
  useEffect(() => {
    footstepSound.current = new Audio("/sounds/footsteps.mp3");
    footstepSound.current.loop = true;
    footstepSound.current.volume = 0.4;

    clickSound.current = new Audio("/sounds/click.mp3");
    clickSound.current.volume = 0.7;
  }, []);

  /* ▶️ Start sequence */
  const startGame = () => {
    setPhase("walking");
    clickSound.current?.play();
    footstepSound.current?.play();

    // Reach building → open door
    setTimeout(() => {
      setPhase("entering");
      footstepSound.current.pause();
    }, 2600);

    // Camera zoom
    setTimeout(() => {
      sceneRef.current.classList.add("zoom");
    }, 3200);

    // Enter quiz
    setTimeout(() => {
      navigate("/claw-quiz-game");
    }, 4000);
  };

  return (
    <div
      ref={sceneRef}
      className="map-scene"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/backgrounds/forest-map.png)`
      }}
    >
      {/* 🐿️ SQUIRREL */}
      <div
        className={`map-squirrel 
          ${phase === "walking" ? "walking" : ""} 
          ${phase === "entering" ? "entering" : ""}`}
      >
        🐿️
      </div>

      {/* 🏠 BUILDING 1 (ACTIVE) */}
      <div className="map-building building-1 glow">
        <div className={`door ${phase === "entering" ? "open" : ""}`} />
        🏠
      </div>

      {/* 🔒 LOCKED BUILDINGS */}
      <div className="map-building building-2 locked">🏰</div>
      <div className="map-building building-3 locked">🏯</div>

      {/* 💬 STORY CHAT */}
      {phase === "story" && (
        <div className="story-chat">
          <div className="chat-bubble">
            <span className="squirrel-icon">🐿️</span>
            <p>{typedText}</p>
          </div>

          <button className="start-btn" onClick={startGame}>
            Start Game
          </button>
        </div>
      )}
    </div>
  );
}
