import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PersonalityReveal.css";

const PersonalityReveal = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, content: "", x: 0, y: 0 });
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("aiProfile");
    if (!raw) return navigate("/");

    try {
      setProfile(JSON.parse(raw));
      // Trigger stat animations after mount
      setTimeout(() => setAnimateStats(true), 500);
    } catch {
      navigate("/");
    }
  }, [navigate]);

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
    setTooltip({ ...tooltip, visible: false });
  };

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
    if (summary.toLowerCase().includes("creative")) return "🎨";
    if (summary.toLowerCase().includes("analytical")) return "🧠";
    if (summary.toLowerCase().includes("adventurous")) return "🌟";
    if (summary.toLowerCase().includes("social")) return "🤝";
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

  const getCategoryColor = (category) => {
    const colors = {
      Creative: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      Physical: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      Intellectual: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      Relaxation: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      Social: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    };
    return colors[category] || "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)";
  };

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

  return (
    <div className="reveal-container">
      <div className="magic-scroll">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="profile-icon">{getPersonalityIcon(profile.personalitySummary)}</div>
          <div className="class-badge">Personality Profile</div>
          <h1 className="magic-title">Your Unique Identity</h1>
          <p className="profile-subtitle">Personalized insights based on your activities</p>

          {/* Stats Box */}
          <div className="stats-box">
            <h3 className="stats-header">Core Strengths</h3>
            {profile.traits.slice(0, 5).map((t) => (
              <div key={t.trait} className="stat-row">
                <div className="stat-label">
                  <span className="trait-name">
                    <span className="trait-emoji">{getTraitEmoji(t.trait)}</span>
                    {t.trait}
                  </span>
                  <span className="trait-score">{t.score}/10</span>
                </div>
                <div className="progress-bg">
                  <div
                    className="progress-fill"
                    style={{
                      width: animateStats ? `${(t.score / 10) * 100}%` : "0%",
                      background: getCategoryColor(t.trait),
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          {/* Personality Summary */}
          <div className="summary-section">
            <div className="section-header">
              <span className="section-icon">💫</span>
              <h2 className="section-title">Personality Overview</h2>
            </div>
            <p className="summary-text">{profile.personalitySummary}</p>
            
            {/* Top Strength Badge */}
            {profile.traits.length > 0 && (
              <div className="strength-badge">
                <span className="strength-label">Top Strength</span>
                <span className="strength-value">{profile.traits[0].trait}</span>
              </div>
            )}
          </div>

          {/* Hobbies Section */}
          <div className="hobbies-section">
            <div className="section-header">
              <span className="section-icon">🎯</span>
              <h2 className="section-title">Recommended Activities</h2>
            </div>
            <p className="section-subtitle">Hobbies perfectly matched to your personality</p>
          </div>
          <div className="hobbies-grid">
            {profile.hobbies.map((h, i) => (
              <div
                key={i}
                className="hobby-card"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <h3 className="hobby-title">{h.name}</h3>
                <p className="hobby-reason">{h.why}</p>
                <div className="hobby-tags">
                  <span
                    className="hobby-tag category-tag"
                    onMouseEnter={(e) => handleTagHover(e, h.category)}
                    onMouseLeave={handleTagLeave}
                  >
                    {h.category}
                  </span>
                  <span
                    className="hobby-tag social-tag"
                    onMouseEnter={(e) => handleTagHover(e, h.social ? "Social" : "Solo")}
                    onMouseLeave={handleTagLeave}
                  >
                    {h.social ? "👥 Social" : "🧘 Solo"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button className="action-btn" onClick={() => navigate("/signup")}>
            <span className="btn-icon">🚀</span>
            <span className="btn-text">Sign Up to Continue</span>
          </button>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="info-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="tooltip-arrow"></div>
          <p className="tooltip-text">{tooltip.content}</p>
        </div>
      )}
    </div>
  );
};

export default PersonalityReveal;
