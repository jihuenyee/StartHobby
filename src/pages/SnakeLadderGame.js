const handleRollDice = () => {
    // 1. Block interactions if busy/done
    if (isRolling || modalData || miniInsight || loading || isFinished || position === BOARD_SIZE) return;

    safePlay(clickSound);
    setIsRolling(true);
    setStatusMsg("Rolling...");

    // 2. Visual Animation
    const rollInterval = setInterval(() => {
        setDiceNum(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);

      // --- 🧠 RIGGED LOGIC START ---
      let calculatedRoll = Math.floor(Math.random() * 6) + 1;
      let projectedPos = position + calculatedRoll;

      // SCENARIO A: FINISH GAME (You have all 5 answers)
      // Force roll to land exactly on 25.
      if (answers.length >= REQUIRED_QUESTIONS) {
          calculatedRoll = BOARD_SIZE - position;
      }

      // SCENARIO B: SETUP FINAL QUESTION (You have 4 answers)
      // We want to land on Tile 23 (Safe spot) to trigger the 5th question.
      else if (answers.length === 4) {
          const targetTile = 23;
          // If we are close enough (1-6 tiles away), force the roll.
          if (position < targetTile && (targetTile - position) <= 6) {
              calculatedRoll = targetTile - position;
          } 
          // If too far, roll max (6) to get closer, but cap at 23.
          else {
              calculatedRoll = 6;
              if (position + calculatedRoll > 23) calculatedRoll = 23 - position;
          }
      }

      // SCENARIO C: MID GAME (You have 2 or 3 answers)
      // "Don't meet snakes anymore" logic.
      else if (answers.length >= 2) {
          projectedPos = position + calculatedRoll;
          
          // 1. Prevent finishing too early
          if (projectedPos >= BOARD_SIZE) {
              calculatedRoll = 1;
              projectedPos = position + 1;
          }

          // 2. ANTI-SNAKE GUARD
          // If the random roll hits a snake, force a safe move (usually +1 or -1)
          if (SNAKES[projectedPos]) {
             // Try adding 1. If that's also a snake or too far, subtract 1.
             if (!SNAKES[projectedPos + 1] && (projectedPos + 1 < BOARD_SIZE)) {
                 calculatedRoll += 1;
             } else {
                 calculatedRoll = (calculatedRoll > 1) ? calculatedRoll - 1 : 1;
             }
          }
      }

      // SCENARIO D: START GAME (0 or 1 Answer)
      // "First 2 spins can meet snake" -> Normal Random Logic
      else {
          // Just prevent hitting the castle early
          if (position + calculatedRoll >= BOARD_SIZE) {
             calculatedRoll = 1;
          }
      }

      // --- EXECUTE MOVE ---
      setDiceNum(calculatedRoll);
      let nextPos = position + calculatedRoll;

      // Final safety bounds check
      if (nextPos > BOARD_SIZE) nextPos = BOARD_SIZE;

      setPosition(nextPos);
      setIsRolling(false);

      // Trigger tile check (Snake/Ladder/Question)
      setTimeout(() => checkTile(nextPos), 800);
    }, 800);
  };