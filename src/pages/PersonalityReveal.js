import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/PersonalityReveal.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://starthobbybackend-production.up.railway.app"
    : "http://localhost:5000";

const PersonalityReveal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasSavedRef = useRef(false);

  const [profile, setProfile] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  });
  const [animateStats, setAnimateStats] = useState(false);

  /* =========================
     LOAD AI PROFILE
  ========================= */
  useEffect(() => {
    const rawProfile = localStorage.getItem("aiProfile");
    const email = localStorage.getItem("userEmail");

    if (!rawProfile || !email) {
      navigate("/");
      return;
    }

    try {
      const parsedProfile = JSON.parse(rawProfile);
      setProfile(parsedProfile);

      setTimeout(() => setAnimateStats(true), 500);

      // Save to DB only once
      if (!hasSavedRef.current) {
        hasSavedRef.current = true;
        saveAIProfile(email, parsedProfile);
      }
    } catch (err) {
      console.error("Invalid AI profile:", err);
      navigate("/");
    }
  }, [navigate]);

  /* =========================
     SAVE AI PROFILE TO DB
  ========================= */
  const saveAIProfile = async (email, profile) => {
    try {
      await fetch(`${API_BASE}/api/ai-profile/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          profile,
        }),
      });
    } catch (err) {
      console.error("Failed to save AI profile:", err);
    }
  };

  /* =========================
     TOOLTIP HANDLERS
  ========================= */
  const handleTagHover = (e, tag) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      visible: true,
      content: getTagDescription(tag),
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleTagLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  /* =========================
     HELPERS
  ========================= */
  const getTagDescription = (tag) => {
    const descriptions = {
      Creative: "Express yourself through art and imagination",
      Physical: "Stay active with movement and sports",
      Intellectual: "Expand your mind through learning",
      Social: "Connect with others and build community",
      Solo: "Find fulfillment in independent pursuits",
      Outdoor: "Embrace nature and fresh air",
      Indoor: "Enjoy comfortable indoor activities",
      Relaxing: "Reduce stress and find calm",
      Challenging: "Grow through overcoming obstacles",
    };
    return descriptions[tag] || "Discover new possibilities";
  };

  const getPersonalityIcon = (summary) => {
    const s = summary.toLowerCase();
    if (s.includes("creative")) return "🎨";
    if (s.includes("analytical")) return "🧠";
    if (s.includes("adventurous")) return "🌟";
    if (s.includes("social")) return "🤝";
    return "✨";
  };

  const getTraitEmoji = (trait) => {
    const emojiMap = {
      Openness: "🌈",
      Conscientiousness: "📋",
      Extraversion: "🎉",
      Agreeableness: "💝",
      Neuroticism: "🧘",
      Creativity: "🎨",
      Adventure: "🗺️",
      Leadership: "👑",
      Empathy: "💖",
      Curiosity: "🔍",
    };
    return emojiMap[trait] || "⭐";
  };

  const getCategoryColor = () =>
    "linear-gradient(90deg, #6366f1, #8b5cf6, #d946ef)";

  /* =========================
     LOADING STATE
  ========================= */
  if (!profile) {
    return (
      <div className="reveal-container">
        <div className="loading-spinner">
          <div className="spinner">✨</div>
          <p>Analyzing your results...</p>
        </div>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="reveal-container">
      <div className="magic-scroll">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="profile-icon">
            {getPersonalityIcon(profile.personalitySummary)}
          </div>

          <div className="class-badge">Personality Profile</div>
          <h1 className="magic-title">Your Unique Identity</h1>
          <p className="profile-subtitle">
            Personalized insights based on your activities
          </p>

          {/* STATS */}
          <div className="stats-box">
            <h3 className="stats-header">Core Strengths</h3>
            {profile.traits.slice(0, 5).map((t) => (
              <div key={t.trait} className="stat-row">
                <div className="stat-label">
                  <span className="trait-name">
                    <span className="trait-emoji">
                      {getTraitEmoji(t.trait)}
                    </span>
                    {t.trait}
                  </span>
                  <span className="trait-score">{t.score}/10</span>
                </div>

                <div className="progress-bg">
                  <div
                    className="progress-fill"
                    style={{
                      width: animateStats
                        ? `${(t.score / 10) * 100}%`
                        : "0%",
                      background: getCategoryColor(),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          {/* SUMMARY */}
          <div className="summary-section">
            <div className="section-header">
              <span className="section-icon">💫</span>
              <h2 className="section-title">Personality Overview</h2>
            </div>

            <p className="summary-text">{profile.personalitySummary}</p>

            {profile.traits.length > 0 && (
              <div className="strength-badge">
                <span className="strength-label">Top Strength</span>
                <span className="strength-value">
                  {profile.traits[0].trait}
                </span>
              </div>
            )}
          </div>

          {/* HOBBIES */}
          <div className="hobbies-section">
            <div className="section-header">
              <span className="section-icon">🎯</span>
              <h2 className="section-title">Recommended Activities</h2>
            </div>
            <p className="section-subtitle">
              Hobbies perfectly matched to your personality
            </p>
          </div>

          <div className="hobbies-grid">
            {profile.hobbies.map((h, i) => (
              <div
                key={i}
                className="hobby-card"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <h3 className="hobby-title">{h.name}</h3>
                <p className="hobby-reason">{h.why}</p>

                <div className="hobby-tags">
                  <span
                    className="hobby-tag"
                    onMouseEnter={(e) =>
                      handleTagHover(e, h.category)
                    }
                    onMouseLeave={handleTagLeave}
                  >
                    {h.category}
                  </span>

                  <span
                    className="hobby-tag"
                    onMouseEnter={(e) =>
                      handleTagHover(e, h.social ? "Social" : "Solo")
                    }
                    onMouseLeave={handleTagLeave}
                  >
                    {h.social ? "👥 Social" : "🧘 Solo"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            className="action-btn"
            onClick={() => navigate(user ? "/profile" : "/signup")}
          >
            <span className="btn-icon">{user ? "👤" : "🚀"}</span>
            <span className="btn-text">{user ? "View My Profile" : "Sign Up to Continue"}</span>
          </button>
        </div>
      </div>

      {/* TOOLTIP */}
      {tooltip.visible && (
        <div
          className="info-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="tooltip-arrow" />
          <p className="tooltip-text">{tooltip.content}</p>
        </div>
      )}
    </div>
  );
};

export default PersonalityReveal;
