import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GameMap.css";

const STORY_TEXT =
  "A baby squirrel is lost in the forest. Help guide it through challenges and reunite it with its family.";

function GameMap() {
  const navigate = useNavigate();

  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState("story"); // story | walking

  /* 🔊 Sounds */
  const footstepSound = useRef(null);
  const clickSound = useRef(null);

  /* ⌨️ Typing effect */
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

  /* ▶️ Start game */
  const startGame = () => {
    setPhase("walking");

    clickSound.current?.play();
    footstepSound.current?.play();

    setTimeout(() => {
      document.querySelector(".map-scene").classList.add("zoom");

      setTimeout(() => {
        footstepSound.current.pause();
        navigate("/quiz");
      }, 900);
    }, 2600);
  };

  /* 🔊 Init sounds ONCE */
  useEffect(() => {
    footstepSound.current = new Audio("/sounds/footsteps.mp3");
    footstepSound.current.loop = true;
    footstepSound.current.volume = 0.5;

    clickSound.current = new Audio("/sounds/click.mp3");
    clickSound.current.volume = 0.7;
  }, []);

  return (
    <div
      className="map-scene"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/backgrounds/forest-map.png)`
      }}
    >
      {/* 🐿️ SQUIRREL */}
      <div className={`map-squirrel ${phase === "walking" ? "walking" : ""}`}>
        🐿️
      </div>

      {/* 🏠 BUILDINGS */}
      <div className="map-building building-1">🏠</div>
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

export default GameMap;
