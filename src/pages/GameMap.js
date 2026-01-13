import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GameMap.css";

const STORY_1 =
  "The squirrel feels braver now. A new challenge awaits deeper in the forest.";
const STORY_2 =
  "You’re getting closer. One final path remains before reaching home.";

export default function GameMap() {
  const navigate = useNavigate();
  const sceneRef = useRef(null);

  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState("story"); 
  const [entry, setEntry] = useState("first"); 
  // first | second

  const footstepSound = useRef(null);
  const clickSound = useRef(null);

  const gameResults = JSON.parse(localStorage.getItem("gameResults"));

  /* 🧠 DETERMINE ENTRY TYPE */
  useEffect(() => {
    if (gameResults?.clawGame?.completed) {
      setEntry("second");
    } else {
      setEntry("first");
    }
  }, [gameResults]);

  /* ⌨️ TYPE STORY */
  useEffect(() => {
    const text = entry === "first" ? STORY_1 : STORY_2;
    let i = 0;
    setTypedText("");

    const interval = setInterval(() => {
      if (i < text.length) {
        setTypedText((p) => p + text[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [entry]);

  /* 🔊 INIT SOUNDS */
  useEffect(() => {
    footstepSound.current = new Audio("/sounds/footsteps.mp3");
    footstepSound.current.volume = 0.4;

    clickSound.current = new Audio("/sounds/click.mp3");
    clickSound.current.volume = 0.7;
  }, []);

  /* ▶️ START */
  const startGame = () => {
    clickSound.current?.play();
    setPhase("walking");
    footstepSound.current?.play();

    setTimeout(() => {
      setPhase("entering");
      footstepSound.current.pause();
    }, 2600);

    setTimeout(() => {
      sceneRef.current.classList.add("zoom");
    }, 3200);

    setTimeout(() => {
      navigate(
        entry === "first" ? "/claw-quiz-game" : "/squirrel-game"
      );
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
          ${entry === "first" ? "start-forest" : "start-building"}
          ${phase === "walking" ? entry + "-walk" : ""}
          ${phase === "entering" ? "entering" : ""}`}
      >
        🐿️
      </div>

      {/* 🏠 BUILDING 1 */}
      <div
        className={`map-building building-1 
        ${gameResults?.clawGame?.completed ? "completed" : "glow"}`}
      >
        <div className={`door ${phase === "entering" && entry === "first" ? "open" : ""}`} />
        🏠
      </div>

      {/* 🏰 BUILDING 2 */}
      <div
        className={`map-building building-2 
        ${gameResults?.clawGame?.completed ? "glow" : "locked"}`}
      >
        <div className={`door ${phase === "entering" && entry === "second" ? "open" : ""}`} />
        🏰
      </div>

      {/* 🏯 BUILDING 3 */}
      <div className="map-building building-3 locked">🏯</div>

      {/* 💬 STORY */}
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
