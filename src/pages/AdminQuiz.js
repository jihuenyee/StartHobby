// src/pages/AdminQuiz.js
import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";
import "../styles/AdminQuiz.css";

function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedGameType, setSelectedGameType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // =========================
  // LOAD QUIZ LIST
  // =========================
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await apiRequest("/quizzes");
        setQuizzes(data || []);
      } catch (err) {
        setStatus("Failed to load quizzes");
      } finally {
        setLoadingList(false);
      }
    };
    fetchQuizzes();
  }, []);

  // =========================
  // LOAD QUESTIONS BY GAME TYPE
  // =========================
  const loadQuiz = async (gameType) => {
    setSelectedGameType(gameType);
    setQuestions([]);
    setLoadingQuiz(true);
    setStatus("");

    try {
      const data = await apiRequest(`/quizzes/${gameType}`);
      setQuestions(data.questions || []);
    } catch (err) {
      setStatus("Failed to load quiz");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // =========================
  // EDIT QUESTION TEXT
  // =========================
  const updateQuestionText = (id, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.question_id === id ? { ...q, question: value } : q
      )
    );
  };

  // =========================
  // EDIT OPTION TEXT
  // =========================
  const updateOption = (id, key, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.question_id === id ? { ...q, [key]: value } : q
      )
    );
  };

  // =========================
  // SAVE QUESTION
  // =========================
  const saveQuestion = async (q) => {
    setSaving(true);
    setStatus("");

    try {
      await apiRequest(`/quizzes/question/${q.question_id}`, {
        method: "PUT",
        body: {
          question: q.question,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
        },
      });

      setStatus("Question saved ✓");
    } catch (err) {
      console.error(err);
      setStatus("Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-quiz-page">
      <div className="admin-quiz-shell">
        <header className="admin-quiz-header">
          <div>
            <h1>Quiz Management</h1>
            <p>View, edit, add and delete quiz questions & options.</p>
          </div>
        </header>

        {status && <p className="admin-quiz-status">{status}</p>}

        <div className="admin-quiz-main">
          {/* ================= LEFT SIDEBAR ================= */}
          <aside className="admin-quiz-sidebar">
            <h2 className="sidebar-title">Quizzes</h2>

            {loadingList ? (
              <p className="sidebar-empty">Loading…</p>
            ) : (
              <ul className="quiz-list">
                {quizzes.map((q) => (
                  <li
                    key={q.game_type}
                    className={
                      q.game_type === selectedGameType
                        ? "quiz-list-item active"
                        : "quiz-list-item"
                    }
                    onClick={() => loadQuiz(q.game_type)}
                  >
                    <span className="quiz-list-title">{q.game_type}</span>
                    <span className="quiz-list-sub">Game type</span>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* ================= RIGHT EDITOR ================= */}
          <section className="admin-quiz-editor">
            {!selectedGameType && (
              <div className="editor-placeholder">
                Select a quiz to edit questions
              </div>
            )}

            {loadingQuiz && (
              <div className="editor-placeholder">Loading questions…</div>
            )}

            {!loadingQuiz && selectedGameType && (
              <div className="editor-content">
                <h2 className="editor-title">Quiz: {selectedGameType}</h2>

                {questions.map((q) => (
                  <div key={q.question_id} className="question-card">
                    <div className="question-header">
                      <span className="question-label">
                        Question #{q.question_id}
                      </span>
                      <button
                        className="btn-outline"
                        onClick={() => saveQuestion(q)}
                        disabled={saving}
                      >
                        Save
                      </button>
                    </div>

                    <textarea
                      className="question-textarea"
                      value={q.question || ""}
                      onChange={(e) =>
                        updateQuestionText(q.question_id, e.target.value)
                      }
                    />

                    <div className="options-grid">
                      <div className="option-row">
                        <span className="option-label">Option A</span>
                        <input
                          className="option-input"
                          value={q.option_a || ""}
                          onChange={(e) =>
                            updateOption(q.question_id, "option_a", e.target.value)
                          }
                        />
                      </div>

                      <div className="option-row">
                        <span className="option-label">Option B</span>
                        <input
                          className="option-input"
                          value={q.option_b || ""}
                          onChange={(e) =>
                            updateOption(q.question_id, "option_b", e.target.value)
                          }
                        />
                      </div>

                      <div className="option-row">
                        <span className="option-label">Option C</span>
                        <input
                          className="option-input"
                          value={q.option_c || ""}
                          onChange={(e) =>
                            updateOption(q.question_id, "option_c", e.target.value)
                          }
                        />
                      </div>

                      <div className="option-row">
                        <span className="option-label">Option D</span>
                        <input
                          className="option-input"
                          value={q.option_d || ""}
                          onChange={(e) =>
                            updateOption(q.question_id, "option_d", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminQuiz;
