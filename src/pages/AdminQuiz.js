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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
  });

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

  const updateQuestionText = (id, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.question_id === id ? { ...q, question: value } : q
      )
    );
  };

  const updateOption = (id, key, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.question_id === id ? { ...q, [key]: value } : q
      )
    );
  };

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

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    setSaving(true);
    setStatus("");

    try {
      await apiRequest(`/quizzes/question/${id}`, {
        method: "DELETE",
      });

      setStatus("Question deleted ✓");
      loadQuiz(selectedGameType);
    } catch {
      setStatus("Failed to delete question");
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    if (!selectedGameType) return;
    setShowAddModal(true);
    setNewQuestion({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
    });
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewQuestion({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
    });
  };

  const handleNewQuestionChange = (field, value) => {
    setNewQuestion((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = async () => {
    if (!selectedGameType) return;
    if (!newQuestion.question.trim()) {
      setStatus("Please enter a question");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      await apiRequest("/quizzes/question", {
        method: "POST",
        body: {
          game_type: selectedGameType,
          question: newQuestion.question,
          option_a: newQuestion.option_a,
          option_b: newQuestion.option_b,
          option_c: newQuestion.option_c,
          option_d: newQuestion.option_d,
        },
      });

      setStatus("Question added successfully ✓");
      closeAddModal();
      loadQuiz(selectedGameType);
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
            onClick={openAddModal}
            disabled={!selectedGameType || saving}
          >
            + Add Question
          </button>
        </header>

        {showAddModal && (
          <div className="modal-overlay" onClick={closeAddModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Question</h3>
                <button className="modal-close" onClick={closeAddModal}>
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Enter your question here..."
                    value={newQuestion.question}
                    onChange={(e) =>
                      handleNewQuestionChange("question", e.target.value)
                    }
                    rows={4}
                  />
                </div>

                <div className="form-grid">
                  {["a", "b", "c", "d"].map((opt) => (
                    <div className="form-group" key={opt}>
                      <label className="form-label">
                        Option {opt.toUpperCase()}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Enter option ${opt.toUpperCase()}`}
                        value={newQuestion[`option_${opt}`]}
                        onChange={(e) =>
                          handleNewQuestionChange(`option_${opt}`, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={closeAddModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn-submit"
                  onClick={addQuestion}
                  disabled={saving || !newQuestion.question.trim()}
                >
                  {saving ? "Adding..." : "Add Question"}
                </button>
              </div>
            </div>
          </div>
        )}

        {status && <p className="admin-quiz-status">{status}</p>}

        <div className="admin-quiz-main">
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

                {questions.map((q, index) => (
                  <div key={q.question_id} className="question-card">
                    <div className="question-header">
                      <span className="question-label">
                        Question #{index + 1}
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
                      placeholder="Enter question text..."
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
                            placeholder={`Enter option ${k.toUpperCase()}`}
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
