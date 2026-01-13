import React, { useState, useRef } from "react";
import "../styles/ClawQuizGame.css";

const OPTIONS = [
  "DIY projects",
  "Outdoor fun",
  "Reading",
  "Group activities",
];

export default function ClawQuizGame() {
  const [clawX, setClawX] = useState(50);
  const [ropeHeight, setRopeHeight] = useState(60);
  const [closed, setClosed] = useState(false);
  const [grabbing, setGrabbing] = useState(false);
  const [grabbedIndex, setGrabbedIndex] = useState(null);

  const optionRefs = useRef([]);
  const clawRef = useRef(null);

  const grabOption = async (index) => {
    if (grabbing) return;
    setGrabbing(true);

    const option = optionRefs.current[index];
    const machine = document
      .querySelector(".machine-inner")
      .getBoundingClientRect();

    const optionRect = option.getBoundingClientRect();
    const clawRect = clawRef.current.getBoundingClientRect();

    /* === CALCULATE TARGET X === */
    const targetX =
      ((optionRect.left + optionRect.width / 2 - machine.left) /
        machine.width) *
      100;

    /* === CALCULATE TARGET ROPE LENGTH === */
    const targetRope =
      optionRect.top +
      optionRect.height / 2 -
      clawRect.top -
      40; // offset for hinge + prongs

    /* 1️⃣ MOVE */
    setClawX(targetX);
    await wait(500);

    /* 2️⃣ DROP (EXACT) */
    setRopeHeight(targetRope);
    await wait(600);

    /* 3️⃣ CLOSE */
    setClosed(true);
    await wait(300);

    /* 4️⃣ LIFT */
    setGrabbedIndex(index);
    setRopeHeight(60);
    await wait(700);

    /* RESET */
    setClosed(false);
    setGrabbedIndex(null);
    setGrabbing(false);
  };

  return (
    <div className="claw-page">
      <div className="machine-frame">
        <div className="machine-inner">

          {/* CLAW */}
          <div
            className="claw-wrapper"
            ref={clawRef}
            style={{ left: `${clawX}%` }}
          >
            <div
              className="rope"
              style={{ height: `${ropeHeight}px` }}
            />

            <div className="hinge" />

            <div className="hinge-arm" />

            <div className={`claw ${closed ? "closed" : ""}`}>
              <div className="prong left" />
              <div className="prong right" />
            </div>
          </div>

          {/* OPTIONS */}
          <div className="options">
            {OPTIONS.map((opt, i) => (
              <button
                key={i}
                ref={(el) => (optionRefs.current[i] = el)}
                className={`option ${
                  grabbedIndex === i ? "grabbed" : ""
                }`}
                onClick={() => grabOption(i)}
                disabled={grabbing}
              >
                {opt}
              </button>
            ))}
          </div>

        </div>
      </div>

      <p className="question-count">Question 1 / 3</p>
    </div>
  );
}

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
