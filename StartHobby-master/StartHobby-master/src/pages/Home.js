import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleBeginClick = () => {
    setShowEmailModal(true);
  };

  const handleConfirmEmail = () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    // Save email into localStorage (single source of truth)
    const existing = localStorage.getItem("gameResults");
    const gameResults = existing ? JSON.parse(existing) : {};

    gameResults.email = email;
    gameResults.startedAt = Date.now();

    localStorage.setItem("gameResults", JSON.stringify(gameResults));
    localStorage.setItem("userEmail", email);

    setShowEmailModal(false);
    navigate("/story");
  };

  return (
    <div className="home-page">
      {/* 🌿 Decorative background */}
      <div className="home-bg" />

      {/* 🐿️ Main Card */}
      <div className="home-card">
        <div className="squirrel-hero">🐿️</div>

        <h1 className="home-title">
          Lost in the Magical Forest
        </h1>

        <p className="home-subtitle">
          A baby squirrel is lost in a magical forest and needs your help!
          Guide them home through magical games and discover your hidden hobby.
        </p>

        <div className="home-rules">
          <div className="rule-item">🎮 Play magical quiz games</div>
          <div className="rule-item">✨ Make choices that shape your personality</div>
          <div className="rule-item">🌲 Discover hobbies made for you</div>
        </div>

        <button className="home-start-btn" onClick={handleBeginClick}>
          Begin Adventure
        </button>
      </div>

      {/* 🌼 Footer hint */}
      <p className="home-hint">
        Every choice brings the baby squirrel closer to home 🏡✨
      </p>

      {/* 📧 EMAIL MODAL */}
      {showEmailModal && (
        <div className="email-modal-overlay">
          <div className="email-modal">
            <h2>Before we begin 🌱</h2>
            <p>
              Enter your email so we can save your adventure
              and match it when you sign up later.
            </p>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="email-input"
            />

            {error && <p className="email-error">{error}</p>}

            <div className="email-actions">
              <button
                className="email-cancel"
                onClick={() => setShowEmailModal(false)}
              >
                Cancel
              </button>

              <button
                className="email-confirm"
                onClick={handleConfirmEmail}
              >
                Start Adventure 🌲
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
