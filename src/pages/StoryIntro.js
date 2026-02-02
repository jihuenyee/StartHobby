import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/StoryIntro.css";

function StoryIntro() {
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const forestSound = useRef(null);
  const clickSound = useRef(null);

  const bgStyle = {
    // Uses process.env to ensure it works on all deployments
    backgroundImage: `url(${process.env.PUBLIC_URL}/backgrounds/forest-bg.png)`,
    backgroundSize: "cover",
    backgroundPosition: "center bottom"
  };

  const storyTexts = [
    "🌲 Deep in the forest, a baby squirrel has wandered away from home...",
    "🐿️ The forest is full of fun places, but also tricky challenges.",
    "💡 Answer hobby questions to help the squirrel reach its family."
  ];

  // --- 🛡️ SAFE AUDIO HELPERS ---
  const createAudio = (path, loop = false, volume = 1.0) => {
    const audio = new Audio(path);
    audio.loop = loop;
    audio.volume = volume;
    // THIS LINE PREVENTS THE CRASH:
    audio.onerror = () => console.warn(`Audio missing or not supported: ${path}`);
    return audio;
  };

  const safePlay = (audioRef) => {
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Audio play blocked (interaction needed) or missing:", error);
        });
      }
    }
  };

  const safePause = (audioRef) => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {
        // Ignore pause errors
      }
    }
  };

  useEffect(() => {
    // Initialize audio safely
    forestSound.current = createAudio("/sounds/forest.mp3", true, 0.35);
    clickSound.current = createAudio("/sounds/click.mp3", false, 0.6);

    // Attempt to play BG music
    safePlay(forestSound);

    // Cleanup when leaving page
    return () => {
      safePause(forestSound);
    };
  }, []);

  const nextStep = () => {
    safePlay(clickSound);
    if (step < storyTexts.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      exitScene();
    }
  };

  const exitScene = () => {
    safePause(forestSound);
    setIsExiting(true);

    // Reset game state for a fresh start
    localStorage.setItem(
      "gameResults",
      JSON.stringify({
        clawGame: { completed: false, answers: [] },
        castleGame: { completed: false, answers: [] },
        snakeGame: { completed: false, answers: [] }
      })
    );

    // Wait for fade out animation (1s) then navigate
    setTimeout(() => {
        navigate("/game-map");
    }, 1000);
  };

  return (
    <div className={`story-scene ${isExiting ? "exit" : ""}`} style={bgStyle}>
      <button className="skip-btn" onClick={exitScene}><h2>Skip</h2></button>
      
      {/* Squirrel Animation */}
      <div className={`intro-squirrel intro-walk-step-${step}`}>🐿️</div>
      
      {/* Story Box */}
      <div className="story-box">
        <p>{storyTexts[step]}</p>
        <button className="story-btn" onClick={nextStep}>
          {step < storyTexts.length - 1 ? "Next" : "Enter the Forest"}
        </button>
      </div>
    </div>
  );
}

export default StoryIntro;