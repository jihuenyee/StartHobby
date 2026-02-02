import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleBeginClick = () => {
    // If user is logged in, skip email modal and use their email
    if (user?.email) {
      const existing = localStorage.getItem("gameResults");
      const gameResults = existing ? JSON.parse(existing) : {};

      gameResults.email = user.email;
      gameResults.startedAt = Date.now();

      localStorage.setItem("gameResults", JSON.stringify(gameResults));
      localStorage.setItem("userEmail", user.email);

      navigate("/story");
      return;
    }
    
    // Show email modal for non-logged-in users
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
          Guide them home through a magical claw-machine adventure.
        </p>

        <div className="home-rules">
          <div className="rule-item">🎮 Play the magical claw quiz game</div>
          <div className="rule-item">✨ Help squirrel gain confidence</div>
          <div className="rule-item">🌲 Discover hobbies along the way</div>
        </div>

        <button onClick={handleBeginClick} className="home-start-btn">
          Begin Adventure
        </button>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="modal-overlay" onClick={() => setShowEmailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enter Your Email</h3>
              <button className="modal-close" onClick={() => setShowEmailModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>We'll use this to save your progress and send your results!</p>
              <input
                type="email"
                className="form-input"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="error-text">{error}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEmailModal(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleConfirmEmail}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌼 Footer hint */}
      <p className="home-hint">
        Every choice brings the baby squirrel closer to home 🏡✨
      </p>
    </div>
  );
}

export default Home;
