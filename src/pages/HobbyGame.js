import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/HobbyGame.css";
import { API_BASE_URL } from "../api";

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

  return (
    <div className="hobby-game-page">
      {/* Animated floating background */}
      <div className="floating-bg">
        <div className="float-circle c1" />
        <div className="float-circle c2" />
        <div className="float-circle c3" />
        <div className="float-circle c4" />
        <div className="float-circle c5" />
      </div>

      {/* Main Card - Minimal Transparent */}
      <motion.div
        className="hobby-game-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Top Descriptive Text */}
        <p className="hg-sub">
          What's your hobby? <strong>The more people share, the bigger the bubble!</strong>
        </p>

        {/* Bubble Arena - FULL SCREEN */}
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
                    // Get position for this bubble
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
                          }}
                          title={`${it.hobby} — ${it.count} ${it.count === 1 ? "person" : "people"}`}
                          whileHover={{
                            scale: 1.15,
                            boxShadow: "0 0 40px rgba(255, 255, 255, 0.3), 0 20px 60px rgba(0,0,0,0.5)",
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

          {/* Stats - Top Right */}
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

        {/* Bottom Input Form - Minimal */}
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

        {/* Submission feedback */}
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

        {/* Done Button - Bottom */}
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
