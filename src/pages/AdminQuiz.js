import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";
import "../styles/AdminQuiz.css";

function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [status, setStatus] = useState("");

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

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setStatus("");
  };

  return (
    <div className="admin-quiz-page">
      <div className="admin-quiz-shell">
        <header className="admin-quiz-header">
          <h1>Quiz Management</h1>
        </header>

        {status && <p className="admin-quiz-status">{status}</p>}

        <div className="admin-quiz-main">
          <aside className="admin-quiz-sidebar">
            <h2>Quizzes</h2>

            {loadingList ? (
              <p>Loading quizzes…</p>
            ) : quizzes.length === 0 ? (
              <p>No quizzes found.</p>
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
                    <span>{q.question}</span>
                    <small>ID: {q.id}</small>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="admin-quiz-editor">
            {!selectedQuiz ? (
              <p>Select a quiz from the left.</p>
            ) : (
              <div>
                <h2>Quiz ID: {selectedQuiz.id}</h2>
                <p><b>Game Type:</b> {selectedQuiz.game_type}</p>
                <p><b>Question:</b></p>

                <textarea
                  value={selectedQuiz.question}
                  readOnly
                />

                <ul>
                  <li>A: {selectedQuiz.option_a}</li>
                  <li>B: {selectedQuiz.option_b}</li>
                  <li>C: {selectedQuiz.option_c}</li>
                  <li>D: {selectedQuiz.option_d}</li>
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminQuiz;
