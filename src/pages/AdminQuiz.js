// src/pages/AdminQuiz.js
import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";
import "../styles/AdminQuiz.css";

function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [status, setStatus] = useState("");

  // Load quizzes list
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

  // Select quiz (NO API CALL)
  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setStatus("");
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
                    key={q.id}
                    className={
                      selectedQuiz?.id === q.id
                        ? "quiz-list-item active"
                        : "quiz-list-item"
                    }
                    onClick={() => handleSelectQuiz(q)}
                  >
                    <span className="quiz-list-title">{q.question}</span>
                    <span className="quiz-list-sub">ID: {q.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* RIGHT: DETAILS */}
          <section className="admin-quiz-editor">
            {!selectedQuiz && (
              <div className="editor-placeholder">
                <p>Select a quiz from the left.</p>
              </div>
            )}

            {selectedQuiz && (
              <div className="editor-content">
                <h2 className="editor-title">
                  Quiz ID: {selectedQuiz.id}
                </h2>

                <p><strong>Game Type:</strong> {selectedQuiz.game_type}</p>
                <p><strong>Question:</strong></p>

                <textarea
                  className="question-textarea"
                  value={selectedQuiz.question}
                  readOnly
                />

                <div className="options-grid">
                  <p>Options:</p>
                  <ul>
                    <li>A: {selectedQuiz.option_a}</li>
                    <li>B: {selectedQuiz.option_b}</li>
                    <li>C: {selectedQuiz.option_c}</li>
                    <li>D: {selectedQuiz.option_d}</li>
                  </ul>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminQuiz;
