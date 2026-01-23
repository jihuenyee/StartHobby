// src/pages/AdminQuiz.js
import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";
import "../styles/AdminQuiz.css";

function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedGameType, setSelectedGameType] = useState(null);
  const [quizDetails, setQuizDetails] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // Load quiz list (game types)
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await apiRequest("/quizzes");
        setQuizzes(data || []);
      } catch (err) {
        console.error(err);
        setStatus("Failed to load quizzes");
      } finally {
        setLoadingList(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Select quiz by game_type
  const handleSelectQuiz = async (gameType) => {
    setSelectedGameType(gameType);
    setQuizDetails(null);
    setLoadingQuiz(true);
    setStatus("");

    try {
      const data = await apiRequest(`/quizzes/${gameType}`);
      setQuizDetails(data);
    } catch (err) {
      console.error(err);
      setStatus("Failed to load quiz details");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleQuestionTextChange = (questionId, text) => {
    setQuizDetails((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.question_id === questionId ? { ...q, question: text } : q
      ),
    }));
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
        option_d: q.option_d
      }
    });

    setStatus("Question saved ✓");
  } catch (err) {
    console.error("Save question error:", err);
    setStatus(err.message || "Failed to save question");
  } finally {
    setSaving(false);
  }
};



  const deleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;

    setSaving(true);
    setStatus("");

    try {
      await apiRequest(`/quizzes/questions/${questionId}`, {
        method: "DELETE",
      });

      setQuizDetails((prev) => ({
        ...prev,
        questions: prev.questions.filter(
          (q) => q.question_id !== questionId
        ),
      }));

      setStatus("Question deleted ✓");
    } catch {
      setStatus("Failed to delete question");
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = async () => {
    if (!selectedGameType) return;

    const text = window.prompt("Enter new question:");
    if (!text) return;

    setSaving(true);
    setStatus("");

    try {
      const newQuestion = await apiRequest(
        `/quizzes/${selectedGameType}/questions`,
        {
          method: "POST",
          body: {
            question: text,
            options: ["Option A", "Option B", "Option C", "Option D"],
          },
        }
      );

      setQuizDetails((prev) => ({
        ...prev,
        questions: [...prev.questions, newQuestion],
      }));

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
              <p className="sidebar-empty">Loading quizzes…</p>
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
                    onClick={() => handleSelectQuiz(q.game_type)}
                  >
                    <span className="quiz-list-title">
                      {q.game_type}
                    </span>
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
                Select a quiz from the left to manage questions.
              </div>
            )}

            {selectedGameType && loadingQuiz && (
              <div className="editor-placeholder">
                Loading quiz…
              </div>
            )}

            {quizDetails && !loadingQuiz && (
              <div className="editor-content">
                <h2 className="editor-title">
                  Quiz: {quizDetails.game_type}
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
                            saveQuestion(q.question_id, q.question)
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
                      value={q.question}
                      onChange={(e) =>
                        handleQuestionTextChange(
                          q.question_id,
                          e.target.value
                        )
                      }
                    />

                    <div className="options-grid">
                      <div className="option-row">
                        <span className="option-label">Option A</span>
                        <input className="option-input" value={q.option_a} readOnly />
                      </div>
                      <div className="option-row">
                        <span className="option-label">Option B</span>
                        <input className="option-input" value={q.option_b} readOnly />
                      </div>
                      <div className="option-row">
                        <span className="option-label">Option C</span>
                        <input className="option-input" value={q.option_c} readOnly />
                      </div>
                      <div className="option-row">
                        <span className="option-label">Option D</span>
                        <input className="option-input" value={q.option_d} readOnly />
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
