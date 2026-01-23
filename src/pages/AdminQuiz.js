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
      } catch {
        setStatus("Failed to load quizzes");
      } finally {
        setLoadingList(false);
      }
    };
    fetchQuizzes();
  }, []);

  // =========================
  // LOAD QUESTIONS
  // =========================
  const loadQuiz = async (gameType) => {
    setSelectedGameType(gameType);
    setQuestions([]);
    setLoadingQuiz(true);
    setStatus("");

    try {
      const data = await apiRequest(`/quizzes/${gameType}`);
      setQuestions(data.questions || []);
    } catch {
      setStatus("Failed to load quiz");
    } finally {
      setLoadingQuiz(false);
    }
  };

  // =========================
  // EDIT QUESTION
  // =========================
  const updateQuestionText = (id, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.question_id === id ? { ...q, question: value } : q
      )
    );
  };

  // =========================
  // EDIT OPTION
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
    } catch {
      setStatus("Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE QUESTION
  // =========================
  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    setSaving(true);
    setStatus("");

    try {
      await apiRequest(`/quizzes/question/${id}`, {
        method: "DELETE",
      });

      setQuestions((prev) =>
        prev.filter((q) => q.question_id !== id)
      );

      setStatus("Question deleted ✓");
    } catch {
      setStatus("Failed to delete question");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // ADD QUESTION
  // =========================
  const addQuestion = async () => {
    if (!selectedGameType) return;

    const question = window.prompt("Enter question text");
    if (!question) return;

    const option_a = window.prompt("Option A");
    const option_b = window.prompt("Option B");
    const option_c = window.prompt("Option C");
    const option_d = window.prompt("Option D");

    setSaving(true);
    setStatus("");

    try {
      await apiRequest("/quizzes/question", {
        method: "POST",
        body: {
          game_type: selectedGameType,
          question,
          option_a,
          option_b,
          option_c,
          option_d,
        },
      });

      loadQuiz(selectedGameType);
      setStatus("Question added ✓");
    } catch {
      setStatus("Failed to add question");
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

          <button
            className="admin-quiz-add-btn"
            onClick={addQuestion}
            disabled={!selectedGameType || saving}
          >
            + Add Question
          </button>
        </header>

        {status && <p className="admin-quiz-status">{status}</p>}

        <div className="admin-quiz-main">
          {/* LEFT */}
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

          {/* RIGHT */}
          <section className="admin-quiz-editor">
            {!selectedGameType && (
              <div className="editor-placeholder">
                Select a quiz to edit questions
              </div>
            )}

            {loadingQuiz && (
              <div className="editor-placeholder">Loading…</div>
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

                      <div className="question-actions">
                        <button
                          className="btn-outline"
                          onClick={() => saveQuestion(q)}
                          disabled={saving}
                        >
                          Save
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => deleteQuestion(q.question_id)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <textarea
                      className="question-textarea"
                      value={q.question || ""}
                      onChange={(e) =>
                        updateQuestionText(q.question_id, e.target.value)
                      }
                    />

                    <div className="options-grid">
                      {["a", "b", "c", "d"].map((k) => (
                        <div className="option-row" key={k}>
                          <span className="option-label">
                            Option {k.toUpperCase()}
                          </span>
                          <input
                            className="option-input"
                            value={q[`option_${k}`] || ""}
                            onChange={(e) =>
                              updateOption(
                                q.question_id,
                                `option_${k}`,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      ))}
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
