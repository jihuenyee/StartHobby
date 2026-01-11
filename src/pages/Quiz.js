// src/pages/Quiz.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { motion } from "framer-motion";
import "../styles/HobbyQuiz.css";
import { API_BASE_URL } from "../api";

function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // For save-result UI
  const [saving, setSaving] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error" | null
  const [saveMessage, setSaveMessage] = useState("");

  const { width, height } = useWindowSize();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`${API_BASE_URL}/quizzes/1`);
        if (!res.ok) throw new Error("Failed to load quiz");
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load quiz questions.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [navigate]);

  const handleAnswerClick = (question_id, option_id) => {
    const newAnswers = [...answers, { question_id, selected_option_id: option_id }];
    const nextIndex = currentIndex + 1;

    if (quiz && nextIndex < quiz.questions.length) {
      setAnswers(newAnswers);
      setCurrentIndex(nextIndex);
    } else {
      submitForEvaluation(newAnswers);
    }
  };

  const submitForEvaluation = async (answersArray) => {
    setEvaluating(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/quizzes/1/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1, // TODO: replace with real user id from auth
          answers: answersArray,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data.ai_result);
    } catch (err) {
      console.error("Evaluation Error:", err);
      setError(err.message || "Evaluation error");
    } finally {
      setEvaluating(false);
    }
  };

  const saveResultToDB = async () => {
    if (!result) return;

    setSaving(true);
    setSaveStatus(null);
    setSaveMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/quizzes/save-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1, // TODO: replace with real logged-in user
          personality_type: result.personality_type,
          personality_summary: result.personality_summary,
          strengths: result.strengths,
          suggested_hobbies:
            result.suggested_hobbies || result.recommended_hobbies,
          reasons: result.reasons || result.hobby_reasons,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save result");
      }

      setSaveStatus("success");
      setSaveMessage(
        "Your hobby profile has been safely saved to your account."
      );
      setSaveModalOpen(true);
    } catch (err) {
      console.error("Save result error:", err);
      setSaveStatus("error");
      setSaveMessage(
        err.message || "We couldn’t save your result. Please try again."
      );
      setSaveModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="quiz-loading">Loading quiz...</div>;

  if (error && !result)
    return <div className="quiz-page">{error}</div>;

  // ========== RESULT MODE ==========
  if (result) {
    return (
      <motion.div
        className={`quiz-page result-mode ${darkMode ? "dark-mode" : ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={250}
        />

        <motion.div
          className="quiz-result-card"
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>

          <h2 className="quiz-result-title">
            {result.personality_type} 🎉
          </h2>

          <p className="ai-source-label">
            Generated by <strong>Gemini AI</strong> 🤖 •{" "}
            {new Date().toLocaleString()}
          </p>

          <p className="quiz-result-summary">
            {result.personality_summary?.replace(/\(Scores.*\)/, "")}
          </p>

          <h3 className="quiz-section-heading">🌟 Your Strengths</h3>
          <ul className="quiz-hobby-list">
            {(result.strengths || []).map((s, idx) => (
              <li key={idx} className="quiz-hobby-item">
                ✨ {s}
              </li>
            ))}
          </ul>

          <h3 className="quiz-section-heading">🎯 Suggested Hobbies</h3>
          <ul className="quiz-hobby-list">
            {(result.suggested_hobbies ||
              result.recommended_hobbies ||
              []
            ).map((item, idx) => (
              <li key={idx} className="quiz-hobby-item">
                🏆 {typeof item === "string" ? item : item.hobby}
              </li>
            ))}
          </ul>

          <h3 className="quiz-section-heading">💡 Why These Fit You</h3>
          <ul className="quiz-hobby-list">
            {(result.reasons ||
              result.hobby_reasons ||
              result.recommended_hobbies ||
              []
            ).map((item, idx) => (
              <li key={idx} className="quiz-hobby-item">
                • {typeof item === "string" ? item : item.reason}
              </li>
            ))}
          </ul>

          <button
            className="quiz-save-button"
            onClick={saveResultToDB}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Result 💾"}
          </button>

          <button
            className="quiz-share-button"
            onClick={() => window.print()}
          >
            Share Result 📤
          </button>

          <button
            className="quiz-next-activity-button"
            onClick={() => {
              navigate("/hobby-game");
            }}
          >
            Continue to Hobby Activity 🎯
          </button>

          <button
            className="quiz-retake-button"
            onClick={() => {
              setResult(null);
              setAnswers([]);
              setCurrentIndex(0);
              setSaveModalOpen(false);
              setSaveStatus(null);
              setSaveMessage("");
            }}
          >
            Retake Quiz 🔁
          </button>
        </motion.div>

        {/* ===== Fancy Save Modal ===== */}
        {saveModalOpen && (
          <div className="quiz-modal-backdrop">
            <motion.div
              className="quiz-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
            >
              <div className="quiz-modal-icon">
                {saveStatus === "success" ? "✅" : "⚠️"}
              </div>
              <h3 className="quiz-modal-title">
                {saveStatus === "success"
                  ? "Result saved!"
                  : "Something went wrong"}
              </h3>
              <p className="quiz-modal-message">{saveMessage}</p>

              <button
                className="quiz-modal-button"
                onClick={() => setSaveModalOpen(false)}
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
  }

  // ========== QUESTION MODE ==========
  const currentQuestion = quiz.questions[currentIndex];
  const total = quiz.questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className={`quiz-page ${darkMode ? "dark-mode" : ""}`}>
      <motion.div
        className="quiz-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          className="dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        <div className="quiz-header-row">
          <span className="quiz-pill">Hobby Matcher</span>
          <span className="quiz-progress-label">
            Question {currentIndex + 1} of {total}
          </span>
        </div>

        <div className="quiz-progress-bar">
          <motion.div
            className="quiz-progress-fill"
            animate={{ width: `${progressPercent}%` }}
          />
        </div>

        <h2 className="quiz-question-text">
          {currentQuestion.question_text}
        </h2>

        <div className="quiz-options">
          {currentQuestion.options.map((opt) => (
            <motion.button
              key={opt.option_id}
              className="quiz-option-btn"
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                handleAnswerClick(currentQuestion.question_id, opt.option_id)
              }
              disabled={evaluating}
            >
              {opt.option_text}
            </motion.button>
          ))}
        </div>

        {evaluating && (
          <motion.p
            className="quiz-status-text"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Evaluating with AI... 🔄
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

export default Quiz;
