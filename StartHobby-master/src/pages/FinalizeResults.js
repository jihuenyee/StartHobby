import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/FinalizeResults.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://starthobbybackend-production.up.railway.app"
    : "http://localhost:5000";

const FinalizeResults = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [gameResults, setGameResults] = useState({});

  useEffect(() => {
    setEmail(localStorage.getItem("userEmail") || "");
    const results = JSON.parse(localStorage.getItem("gameResults") || "{}");
    setGameResults(results);
    setLoading(false);
  }, []);

  const handleFinalize = async () => {
    setProcessing(true);

    try {
      const res = await fetch(`${API_BASE}/api/results/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          clawGame: gameResults.clawGame,
          snakeGame: gameResults.snakeGame,
          castleGame: gameResults.castleGame,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "AI analysis failed. Please try again.");
        setProcessing(false);
        return;
      }

      // ✅ STORE RESULT
      localStorage.setItem("aiProfile", JSON.stringify(data.analysis));

      setSubmitted(true);

      // ✅ GUARANTEED NAVIGATION
      setTimeout(() => {
        navigate("/personality-reveal");
      }, 2000);

    } catch (err) {
      console.error(err);
      alert("Request failed. Please check your connection.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="finalize-container">
        <div className="finalize-card">
          <div className="loading-state">
            <div className="spinner-container">
              <div className="spinner"></div>
              <div className="spinner-icon">⏳</div>
            </div>
            <p className="loading-text">Preparing your results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="finalize-container">
      {/* Animated Background Elements */}
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="finalize-wrapper">
        {!submitted && !processing && (
          <>
            {/* Header Section */}
            <div className="header-section">
              <div className="icon-wrapper">
                <div className="icon-ring"></div>
                <div className="icon-center">✨</div>
              </div>
              <h1 className="main-title">All Set!</h1>
              <p className="main-subtitle">
                You've successfully completed your personality assessment journey
              </p>
            </div>

            {/* Progress Cards */}
            <div className="progress-cards">
              <div className="progress-title">
                <span className="title-icon">📊</span>
                <span>Your Completed Challenges</span>
              </div>
              <div className="cards-grid">
                <div className={`progress-card ${gameResults.clawGame ? 'completed' : ''}`}>
                  <div className="card-icon">🎮</div>
                  <div className="card-content">
                    <h3>Claw Challenge</h3>
                    <p>Decision Making</p>
                  </div>
                  {gameResults.clawGame && (
                    <div className="completion-badge">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill="#10b981"/>
                        <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className={`progress-card ${gameResults.snakeGame ? 'completed' : ''}`}>
                  <div className="card-icon">🐍</div>
                  <div className="card-content">
                    <h3>Snake Adventure</h3>
                    <p>Strategy & Focus</p>
                  </div>
                  {gameResults.snakeGame && (
                    <div className="completion-badge">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill="#10b981"/>
                        <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className={`progress-card ${gameResults.castleGame ? 'completed' : ''}`}>
                  <div className="card-icon">🏰</div>
                  <div className="card-content">
                    <h3>Castle Quest</h3>
                    <p>Problem Solving</p>
                  </div>
                  {gameResults.castleGame && (
                    <div className="completion-badge">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill="#10b981"/>
                        <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="cta-section">
              <div className="cta-info">
                <div className="info-icon">🎯</div>
                <div className="info-text">
                  <h4>Ready for Your Results?</h4>
                  <p>Our AI will analyze your responses to create your personalized profile</p>
                </div>
              </div>
              <button className="cta-button" onClick={handleFinalize}>
                <span className="button-content">
                  <span className="button-icon">🚀</span>
                  <span className="button-text">Generate My Profile</span>
                </span>
                <div className="button-shine"></div>
              </button>
            </div>
          </>
        )}

        {processing && !submitted && (
          <div className="processing-view">
            <div className="processing-animation">
              <div className="pulse-ring"></div>
              <div className="pulse-ring delay-1"></div>
              <div className="pulse-ring delay-2"></div>
              <div className="processing-icon">🧠</div>
            </div>
            <h2 className="processing-title">Analyzing Your Personality</h2>
            <p className="processing-subtitle">Our AI is carefully crafting your unique profile...</p>
            <div className="processing-steps">
              <div className="step active">
                <div className="step-dot"></div>
                <span>Processing responses</span>
              </div>
              <div className="step active">
                <div className="step-dot"></div>
                <span>Identifying patterns</span>
              </div>
              <div className="step animating">
                <div className="step-dot"></div>
                <span>Creating profile</span>
              </div>
            </div>
          </div>
        )}

        {submitted && (
          <div className="success-view">
            <div className="success-animation">
              <div className="success-circle">
                <svg className="checkmark" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
            </div>
            <h2 className="success-title">Profile Complete! 🎉</h2>
            <p className="success-subtitle">Taking you to your personalized results...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalizeResults;
