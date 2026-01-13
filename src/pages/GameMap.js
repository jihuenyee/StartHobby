// src/pages/GameMap.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GameMap.css";

const STORY_FIRST =
  "A baby squirrel is lost in the forest. One brave step begins the journey home.";

const STORY_SECOND =
  "The squirrel feels braver now. A new challenge awaits deeper in the forest.";

const STORY_THIRD =
  "Only one final challenge remains. Home is close.";

export default function GameMap() {
  const navigate = useNavigate();
  const sceneRef = useRef(null);

  const [typedText, setTypedText] = useState("");
  const [phase, setPhase] = useState("story"); // story | walking | entering
  const [entry, setEntry] = useState("first"); // first | second | third

  const bgSound = useRef(null);
  const footstepSound = useRef(null);
  const clickSound = useRef(null);

  /* ✅ Stable game results */
  const gameResults = useMemo(() => {
    return (
      JSON.parse(localStorage.getItem("gameResults")) || {
        clawGame: { completed: false },
        game2: { completed: false },
        game3: { completed: false },
      }
    );
  }, []);

  /* 🔊 INIT SOUNDS */
  useEffect(() => {
    bgSound.current = new Audio("/sounds/GamemapBG.mp3");
    bgSound.current.loop = true;
    bgSound.current.volume = 0.9;
    bgSound.current.play().catch(() => {});

    footstepSound.current = new Audio("/sounds/footsteps.mp3");
    footstepSound.current.volume = 0.4;

    clickSound.current = new Audio("/sounds/click.mp3");
    clickSound.current.volume = 0.7;

    return () => {
      bgSound.current.pause();
      bgSound.current.currentTime = 0;
    };
  }, []);

  /* 🧠 Decide entry */
  useEffect(() => {
    if (gameResults.game2?.completed) {
      setEntry("third");
    } else if (gameResults.clawGame?.completed) {
      setEntry("second");
    } else {
      setEntry("first");
    }
  }, [gameResults]);

  /* ⌨️ Typing story */
  useEffect(() => {
    let text = STORY_FIRST;
    if (entry === "second") text = STORY_SECOND;
    if (entry === "third") text = STORY_THIRD;

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

  /* ▶️ Start */
  const startGame = () => {
    clickSound.current?.play();
    setPhase("walking");
    footstepSound.current?.play();

    setTimeout(() => {
      setPhase("entering");
      footstepSound.current.pause();
    }, 2600);

    setTimeout(() => {
      sceneRef.current?.classList.add("zoom");
    }, 3200);

    setTimeout(() => {
      bgSound.current.pause();
      bgSound.current.currentTime = 0;

      if (entry === "first") navigate("/claw-quiz-game");
      else if (entry === "second") navigate("/castle-game");
      else navigate("/result");
    }, 4000);
  };

  /* 🐿️ SQUIRREL CLASS LOGIC */
  const squirrelClass = [
    "map-squirrel",
    entry === "first" ? "start-forest" : "waiting-1",
    phase === "walking"
      ? entry === "first"
        ? "walking"
        : "second-walk"
      : "",
    phase === "entering" ? "entering" : "",
  ].join(" ");

  return (
    <div
      ref={sceneRef}
      className="map-scene"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/backgrounds/forest-map.png)`,
      }}
    >
      {/* 🐿️ SQUIRREL */}
      <div className={squirrelClass}>🐿️</div>

      {/* 🏠 BUILDING 1 */}
      <div
        className={`map-building building-1 ${
          gameResults.clawGame?.completed ? "completed" : "glow"
        }`}
      >
        <div
          className={`door ${
            phase === "entering" && entry === "first" ? "open" : ""
          }`}
        />
        🏠
      </div>

      {/* 🏰 BUILDING 2 */}
      <div
        className={`map-building building-2 ${
          gameResults.clawGame?.completed
            ? gameResults.game2?.completed
              ? "completed"
              : "glow"
            : "locked"
        }`}
      >
        <div
          className={`door ${
            phase === "entering" && entry === "second" ? "open" : ""
          }`}
        />
        🏰
      </div>

      {/* 🏯 BUILDING 3 */}
      <div
        className={`map-building building-3 ${
          gameResults.game2?.completed ? "glow" : "locked"
        }`}
      >
        <div
          className={`door ${
            phase === "entering" && entry === "third" ? "open" : ""
          }`}
        />
        🏯
      </div>

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
