import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/HobbyGame.css";
import { API_BASE_URL } from "../api";
// Mascot SVG (simple squirrel)
const Mascot = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ filter: `drop-shadow(0 0 ${size / 6}px #fff6)` }}>
    <ellipse cx="40" cy="60" rx="18" ry="10" fill="#b97a56" />
    <ellipse cx="40" cy="40" rx="20" ry="22" fill="#e2a76f" />
    <ellipse cx="55" cy="35" rx="8" ry="10" fill="#b97a56" />
    <ellipse cx="30" cy="35" rx="8" ry="10" fill="#b97a56" />
    <ellipse cx="40" cy="50" rx="10" ry="8" fill="#fff" />
    <ellipse cx="36" cy="38" rx="2.5" ry="3.5" fill="#222" />
    <ellipse cx="44" cy="38" rx="2.5" ry="3.5" fill="#222" />
    <ellipse cx="40" cy="46" rx="3" ry="1.5" fill="#222" />
    <ellipse cx="48" cy="60" rx="7" ry="4" fill="#b97a56" />
    <ellipse cx="32" cy="60" rx="7" ry="4" fill="#b97a56" />
    <ellipse cx="60" cy="25" rx="4" ry="7" fill="#e2a76f" />
    <ellipse cx="20" cy="25" rx="4" ry="7" fill="#e2a76f" />
    <ellipse cx="40" cy="70" rx="12" ry="3" fill="#000" opacity="0.08" />
  </svg>
);
// Sparkle component
const Sparkle = ({ style }) => (
  <div className="magic-sparkle" style={style} />
);

function HobbyGame() {
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userHobby, setUserHobby] = useState("");
  const [bubblePositions, setBubblePositions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
    const iv = setInterval(fetchEntries, 2500);
    return () => clearInterval(iv);
  }, []);

  // Generate random positions for bubbles - biggest one centered, others spread out
  useEffect(() => {
    const positions = {};
    
    // Find the bubble with the highest count
    let maxCountIdx = -1;
    let maxCount = 0;
    entries.forEach((entry, idx) => {
      if (entry.count > maxCount) {
        maxCount = entry.count;
        maxCountIdx = idx;
      }
    });

    // Create grid-based positioning to avoid overlaps
    const cols = Math.ceil(Math.sqrt(entries.length));
    let gridIdx = 0;

    entries.forEach((entry, idx) => {
      if (!bubblePositions[entry.key]) {
        // Center the biggest bubble, grid others
        if (idx === maxCountIdx) {
          positions[entry.key] = {
            top: 50,
            left: 50,
          };
        } else {
          // Distribute across grid with randomness to look natural
          const row = Math.floor(gridIdx / cols);
          const col = gridIdx % cols;
          
          // Create 4x4 grid zones (0-100 range divided)
          const cellHeight = 100 / cols;
          const cellWidth = 100 / cols;
          
          const top = row * cellHeight + Math.random() * (cellHeight - 20) + 10;
          const left = col * cellWidth + Math.random() * (cellWidth - 20) + 10;
          
          // Avoid centering area (40-60% zone reserved for largest bubble)
          if ((top > 35 && top < 65) && (left > 35 && left < 65)) {
            positions[entry.key] = {
              top: top > 50 ? Math.min(top + 30, 90) : Math.max(top - 30, 10),
              left: left > 50 ? Math.min(left + 30, 90) : Math.max(left - 30, 10),
            };
          } else {
            positions[entry.key] = { top, left };
          }
          gridIdx++;
        }
      } else {
        positions[entry.key] = bubblePositions[entry.key];
      }
    });
    setBubblePositions(positions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  async function fetchEntries() {
    try {
      const res = await fetch(`${API_BASE_URL}/hobby-game/hobby-entries`);
      if (!res.ok) throw new Error("Failed to load entries");
      const data = await res.json();
      setEntries(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    setSubmitting(true);
    setUserHobby(val);
    try {
      await fetch(`${API_BASE_URL}/hobby-game/hobby-entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hobby: val }),
      });
      setInput("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      await fetchEntries();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function sizeForCount(count) {
    const min = 80;
    const max = 500;
    const capped = Math.min(count, 12);
    return Math.round(min + (max - min) * (capped / 12));
  }

  // Dreamy color palette with transparency
  const bubbleColors = [
    "linear-gradient(135deg, rgba(255, 107, 157, 0.6) 0%, rgba(192, 108, 132, 0.6) 100%)",
    "linear-gradient(135deg, rgba(192, 108, 132, 0.6) 0%, rgba(106, 91, 123, 0.6) 100%)",
    "linear-gradient(135deg, rgba(106, 91, 123, 0.6) 0%, rgba(53, 92, 125, 0.6) 100%)",
    "linear-gradient(135deg, rgba(53, 92, 125, 0.6) 0%, rgba(26, 77, 109, 0.6) 100%)",
    "linear-gradient(135deg, rgba(169, 139, 168, 0.6) 0%, rgba(192, 108, 132, 0.6) 100%)",
    "linear-gradient(135deg, rgba(255, 107, 157, 0.5) 0%, rgba(169, 139, 168, 0.5) 100%)",
    "linear-gradient(135deg, rgba(106, 91, 123, 0.5) 0%, rgba(169, 139, 168, 0.5) 100%)",
    "linear-gradient(135deg, rgba(53, 92, 125, 0.5) 0%, rgba(26, 77, 109, 0.5) 100%)",
  ];

  const getBubbleColor = (index) => bubbleColors[index % bubbleColors.length];

  // Animated start overlay
  const [showStart, setShowStart] = useState(true);
  const [showStoryline, setShowStoryline] = useState(false);
  useEffect(() => {
    if (showStart) {
      const t = setTimeout(() => setShowStart(false), 1800);
      return () => clearTimeout(t);
    }
  }, [showStart]);

  useEffect(() => {
    if (!showStart && !showStoryline) {
      setShowStoryline(true);
    }
  }, [showStart, showStoryline]); // Added showStoryline here

  // Sparkle positions
  const sparkles = Array.from({ length: 18 }).map((_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
  }));

  return (
    <div className="hobby-game-page">
      {/* Animated floating background */}
      <div className="floating-bg">
        <div className="float-circle c1" />
        <div className="float-circle c2" />
        <div className="float-circle c3" />
        <div className="float-circle c4" />
        <div className="float-circle c5" />
        {/* Magical sparkles */}
        {sparkles.map((s, i) => <Sparkle key={i} style={s} />)}
      </div>

      {/* Animated mascot */}
      <motion.div
        className="mascot-container"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
      >
        <Mascot />
      </motion.div>

      {/* Start overlay */}
      <AnimatePresence>
        {showStart && (
          <motion.div
            className="start-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            onClick={() => setShowStart(false)}
          >
            <div className="start-content">
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, type: 'spring', bounce: 0.5 }}
              >
                <Mascot size={380} />
              </motion.div>
              <motion.h2
                className="start-title"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Let the Hobby Magic Begin!
              </motion.h2>
              <motion.button
                className="start-button"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStart(false)}
              >
                Start ✨
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Storyline overlay */}
      <AnimatePresence>
        {showStoryline && !showStart && (
          <motion.div
            className="storyline-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="storyline-content">
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
              >
                <Mascot size={280} />
              </motion.div>
              <motion.h2
                className="storyline-title"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Welcome to the Hobby Garden! 🌸
              </motion.h2>
              <motion.p
                className="storyline-text"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Every hobby is like a magical bubble floating in our garden. <br />
                Watch your interests grow and connect with others who share your passions!
              </motion.p>
              <motion.button
                className="storyline-button"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStoryline(false)}
              >
                Enter the Garden ✨
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Card - Minimal Transparent */}
      <motion.div
        className="hobby-game-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <p className="hg-sub">
          What's your hobby? <strong>The more people share, the bigger the bubble!</strong>
        </p>
        <div className="hg-bubble-container">
          <div className="hg-bubble-area">
            {entries.length === 0 ? (
              <motion.div
                className="hg-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="empty-icon">💭</div>
                <p>No hobbies yet — be the first!</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {entries
                  .sort((a, b) => b.count - a.count)
                  .map((it, idx) => {
                    const pos = bubblePositions[it.key] || { top: 50, left: 50 };
                    return (
                      <motion.div
                        key={it.key}
                        className="hobby-bubble-wrapper"
                        initial={{ opacity: 0, scale: 0.2, y: 50 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: [0, -15, 0],
                        }}
                        exit={{ opacity: 0, scale: 0.2, y: 50 }}
                        transition={{
                          scale: { type: "spring", stiffness: 150, damping: 18, delay: idx * 0.1 },
                          opacity: { delay: idx * 0.08, duration: 0.6 },
                          y: { duration: 4 + idx * 0.3, repeat: Infinity, ease: "easeInOut", delay: idx * 0.1 },
                        }}
                        style={{
                          position: "absolute",
                          top: `${pos.top}%`,
                          left: `${pos.left}%`,
                          transform: "translate(-50%, -50%)",
                          filter: idx === 0 ? "drop-shadow(0 0 30px rgba(255, 107, 157, 0.4))" : "none",
                        }}
                      >
                        <motion.div
                          className="hobby-bubble"
                          style={{
                            width: sizeForCount(it.count),
                            height: sizeForCount(it.count),
                            background: getBubbleColor(idx),
                            boxShadow: idx % 2 === 0 ? '0 0 32px #fff6, 0 0 80px #ff6b9d33' : undefined,
                          }}
                          title={`${it.hobby} — ${it.count} ${it.count === 1 ? "person" : "people"}`}
                          whileHover={{
                            scale: 1.15,
                            boxShadow: "0 0 40px #fff, 0 20px 60px #ff6b9d55",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="bubble-inner">
                            <div className="bubble-text">{it.hobby}</div>
                            {it.count > 1 && (
                              <div className="bubble-count">
                                <motion.span
                                  key={it.count}
                                  initial={{ scale: 1.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                >
                                  {it.count}
                                </motion.span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            )}
          </div>
          {entries.length > 0 && (
            <motion.div
              className="hg-stats"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="stat-item">
                <span className="stat-label">Total Hobbies</span>
                <span className="stat-value">{entries.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total People</span>
                <span className="stat-value">{entries.reduce((sum, e) => sum + e.count, 0)}</span>
              </div>
            </motion.div>
          )}
        </div>
        <form className="hg-form" onSubmit={handleSubmit}>
          <div className="hg-input-wrapper">
            <input
              className="hg-input"
              placeholder="Photography, Gaming, Cooking..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={submitting}
              autoFocus
            />
            <motion.button
              className="hg-submit"
              disabled={submitting || !input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
            >
              {submitting ? "✨" : "✨"}
            </motion.button>
          </div>
        </form>
        <AnimatePresence>
          {submitted && userHobby && (
            <motion.div
              className="hg-feedback"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              ✅ "<strong>{userHobby}</strong>" added!
            </motion.div>
          )}
        </AnimatePresence>
        <div className="hg-actions">
          <motion.button
            className="hg-skip"
            onClick={() => {
              navigate("/");
            }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Done <span className="arrow">→</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default HobbyGame;
