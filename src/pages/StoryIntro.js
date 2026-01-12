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
    backgroundImage: `url(${process.env.PUBLIC_URL}/backgrounds/forest-bg.png)`,
    backgroundSize: "cover",
    backgroundPosition: "center bottom"
  };

  const storyTexts = [
    "🌲 Deep in the forest, a baby squirrel has wandered away from home...",
    "🐿️ The forest is full of fun places, but also tricky challenges.",
    "💡 Answer hobby questions to help the squirrel reach its family."
  ];

  useEffect(() => {
    forestSound.current = new Audio("/sounds/forest.mp3");
    forestSound.current.loop = true;
    forestSound.current.volume = 0.35;

    clickSound.current = new Audio("/sounds/click.mp3");
    clickSound.current.volume = 0.6;

    forestSound.current.play().catch(() => {});

    return () => {
      forestSound.current.pause();
      forestSound.current.currentTime = 0;
    };
  }, []);

  const nextStep = () => {
    clickSound.current?.play();

    if (step < storyTexts.length - 1) {
      setStep(step + 1);
    } else {
      exitScene();
    }
  };

  const exitScene = () => {
    forestSound.current?.pause();
    setIsExiting(true);

    setTimeout(() => {
      navigate("/game-map");
    }, 900);
  };

  return (
    <div
      className={`story-scene ${isExiting ? "exit" : ""}`}
      style={bgStyle}
    >
      <button className="skip-btn" onClick={exitScene}>Skip</button>

      {/* ROAD-FOLLOWING SQUIRREL */}
      <div className={`baby-squirrel walk-step-${step}`}>🐿️</div>

      {/* FIXED TEXT */}
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
