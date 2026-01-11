// src/pages/AdminQuiz.js
import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";
import "../styles/AdminQuiz.css";

function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizDetails, setQuizDetails] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // Load quizzes list on mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await apiRequest("/quizzes");
        setQuizzes(data || []);
      } catch (err) {
        console.error("Load quizzes error:", err);
        setStatus(err.message || "Failed to load quizzes");
      } finally {
        setLoadingList(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleSelectQuiz = async (quizId) => {
    setSelectedQuizId(quizId);
    setQuizDetails(null);
    setLoadingQuiz(true);
    setStatus("");

    try {
      const data = await apiRequest(`/quizzes/${quizId}`);
      setQuizDetails(data);
    } catch (err) {
      console.error("Load quiz details error:", err);
      setStatus(err.message || "Failed to load quiz details");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleQuestionTextChange = (questionId, text) => {
    setQuizDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.question_id === questionId ? { ...q, question_text: text } : q
        ),
      };
    });
  };

  const handleOptionTextChange = (questionId, optionId, text) => {
    setQuizDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) =>
          q.question_id === questionId
            ? {
                ...q,
                options: q.options.map((o) =>
                  o.option_id === optionId ? { ...o, option_text: text } : o
                ),
              }
            : q
        ),
      };
    });
  };

  const saveQuestion = async (questionId, questionText) => {
    setSaving(true);
    setStatus("");

    try {
      await apiRequest(`/quizzes/questions/${questionId}`, {
        method: "PUT",
        body: { question_text: questionText },
      });
      setStatus("Question saved ✓");
    } catch (err) {
      console.error("Save question error:", err);
      setStatus(err.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const saveOption = async (optionId, optionText) => {
    setSaving(true);
    setStatus("");

    try {
      await apiRequest(`/quizzes/options/${optionId}`, {
        method: "PUT",
        body: { option_text: optionText },
      });
      setStatus("Option saved ✓");
    } catch (err) {
      console.error("Save option error:", err);
      setStatus(err.message || "Failed to save option");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question and all its options?")) return;

    setSaving(true);
    setStatus("");

    try {
      await apiRequest(`/quizzes/questions/${questionId}`, {
        method: "DELETE",
      });

      // Remove from local state
      setQuizDetails((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.filter(
            (q) => q.question_id !== questionId
          ),
        };
      });

      setStatus("Question deleted ✓");
    } catch (err) {
      console.error("Delete question error:", err);
      setStatus(err.message || "Failed to delete question");
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = async () => {
    if (!selectedQuizId) return;
    const text = window.prompt("Enter new question text:");
    if (!text) return;

    // simple demo options (you can change this UI later)
    const opt1 = window.prompt("Option 1:");
    const opt2 = window.prompt("Option 2:");
    const options = [opt1, opt2].filter(Boolean);
    if (options.length < 2) {
      alert("You need at least 2 options.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const newQuestion = await apiRequest(
        `/quizzes/${selectedQuizId}/questions`,
        {
          method: "POST",
          body: { question_text: text, options },
        }
      );

      setQuizDetails((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: [...prev.questions, newQuestion],
        };
      });

      setStatus("Question added ✓");
    } catch (err) {
      console.error("Add question error:", err);
      setStatus(err.message || "Failed to add question");
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
          <button className="admin-quiz-add-btn" onClick={addQuestion} disabled={!selectedQuizId || saving}>
            + Add Question
          </button>
        </header>

        {status && <p className="admin-quiz-status">{status}</p>}

        <div className="admin-quiz-main">
          {/* LEFT: QUIZ LIST */}
          <aside className="admin-quiz-sidebar">
            <h2 className="sidebar-title">Quizzes</h2>

            {loadingList ? (
              <p className="sidebar-empty">Loading quizzes…</p>
            ) : quizzes.length === 0 ? (
              <p className="sidebar-empty">No quizzes found.</p>
            ) : (
              <ul className="quiz-list">
                {quizzes.map((q) => (
                  <li
                    key={q.quiz_id}
                    className={
                      q.quiz_id === selectedQuizId
                        ? "quiz-list-item active"
                        : "quiz-list-item"
                    }
                    onClick={() => handleSelectQuiz(q.quiz_id)}
                  >
                    <span className="quiz-list-title">{q.title}</span>
                    <span className="quiz-list-sub">
                      ID: {q.quiz_id}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* RIGHT: EDITOR */}
          <section className="admin-quiz-editor">
            {!selectedQuizId && (
              <div className="editor-placeholder">
                <p>Select a quiz from the left to manage questions.</p>
              </div>
            )}

            {selectedQuizId && loadingQuiz && (
              <div className="editor-placeholder">
                <p>Loading quiz details…</p>
              </div>
            )}

            {selectedQuizId && !loadingQuiz && quizDetails && (
              <div className="editor-content">
                <h2 className="editor-title">
                  {quizDetails.title}{" "}
                  <span className="editor-subtitle">
                    (ID: {quizDetails.quiz_id})
                  </span>
                </h2>

                {quizDetails.questions.map((q) => (
                  <div key={q.question_id} className="question-card">
                    <div className="question-header">
                      <span className="question-label">
                        Question #{q.question_id}
                      </span>
                      <div className="question-actions">
                        <button
                          className="btn-outline"
                          onClick={() =>
                            saveQuestion(q.question_id, q.question_text)
                          }
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
                      value={q.question_text}
                      onChange={(e) =>
                        handleQuestionTextChange(
                          q.question_id,
                          e.target.value
                        )
                      }
                    />

                    <div className="options-grid">
                      {q.options.map((opt) => (
                        <div key={opt.option_id} className="option-row">
                          <span className="option-label">
                            Option #{opt.option_id}
                          </span>
                          <input
                            className="option-input"
                            value={opt.option_text}
                            onChange={(e) =>
                              handleOptionTextChange(
                                q.question_id,
                                opt.option_id,
                                e.target.value
                              )
                            }
                          />
                          <button
                            className="btn-outline-sm"
                            onClick={() =>
                              saveOption(opt.option_id, opt.option_text)
                            }
                            disabled={saving}
                          >
                            Save
                          </button>
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
