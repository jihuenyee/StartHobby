import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";
import "../styles/AdminQuiz.css";

function AdminQuiz() {
  const [quizList, setQuizList] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("");

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: ""
  });

  // load quizzes (game_type)
  useEffect(() => {
    apiRequest("/quizzes").then(setQuizList);
  }, []);

  // load quiz questions
  const loadQuiz = async (gameType) => {
    setSelectedGame(gameType);
    const data = await apiRequest(`/quizzes/${gameType}`);
    setQuestions(data.questions);
  };

  // update local state
  const updateField = (id, field, value) => {
    setQuestions(qs =>
      qs.map(q =>
        q.question_id === id ? { ...q, [field]: value } : q
      )
    );
  };

  // save question
  const saveQuestion = async (q) => {
    await apiRequest(`/quizzes/question/${q.question_id}`, {
      method: "PUT",
      body: JSON.stringify(q)
    });
    setStatus("Question saved ✅");
    setTimeout(() => setStatus(""), 2000);
  };

  // add question
  const addQuestion = async () => {
    if (!selectedGame) return;

    await apiRequest("/quizzes/question", {
      method: "POST",
      body: JSON.stringify({
        game_type: selectedGame,
        ...newQuestion
      })
    });

    setNewQuestion({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: ""
    });

    loadQuiz(selectedGame);
    setStatus("Question added ✅");
    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <div className="admin-quiz-page">
      <div className="admin-quiz-shell">

        {/* HEADER */}
        <div className="admin-quiz-header">
          <div>
            <h1>Quiz Management</h1>
            <p>View, edit, add and delete quiz questions & options.</p>
          </div>
          <button
            className="admin-quiz-add-btn"
            disabled={!selectedGame}
            onClick={addQuestion}
          >
            + Add Question
          </button>
        </div>

        {status && <div className="admin-quiz-status">{status}</div>}

        <div className="admin-quiz-main">

          {/* SIDEBAR */}
          <div className="admin-quiz-sidebar">
            <div className="sidebar-title">Quizzes</div>

            <ul className="quiz-list">
              {quizList.map(q => (
                <li
                  key={q.game_type}
                  className={`quiz-list-item ${
                    selectedGame === q.game_type ? "active" : ""
                  }`}
                  onClick={() => loadQuiz(q.game_type)}
                >
                  <span className="quiz-list-title">ID:</span>
                  <span className="quiz-list-sub">{q.game_type}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* EDITOR */}
          <div className="admin-quiz-editor">
            {!selectedGame ? (
              <div className="editor-placeholder">
                Select a quiz from the left to manage questions.
              </div>
            ) : (
              <div className="editor-content">
                <div>
                  <div className="editor-title">Quiz: {selectedGame}</div>
                  <div className="editor-subtitle">
                    Edit questions and options below
                  </div>
                </div>

                {/* QUESTIONS */}
                {questions.map(q => (
                  <div key={q.question_id} className="question-card">
                    <div className="question-header">
                      <span className="question-label">
                        Question #{q.question_id}
                      </span>
                      <div className="question-actions">
                        <button
                          className="btn-outline-sm"
                          onClick={() => saveQuestion(q)}
                        >
                          Save
                        </button>
                      </div>
                    </div>

                    <textarea
                      className="question-textarea"
                      value={q.question}
                      onChange={e =>
                        updateField(q.question_id, "question", e.target.value)
                      }
                    />

                    <div className="options-grid">
                      {["a", "b", "c", "d"].map(letter => (
                        <div key={letter} className="option-row">
                          <span className="option-label">
                            Option {letter.toUpperCase()}
                          </span>
                          <input
                            className="option-input"
                            value={q[`option_${letter}`]}
                            onChange={e =>
                              updateField(
                                q.question_id,
                                `option_${letter}`,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* ADD QUESTION FORM */}
                <div className="question-card">
                  <span className="question-label">Add New Question</span>

                  <textarea
                    className="question-textarea"
                    placeholder="Question"
                    value={newQuestion.question}
                    onChange={e =>
                      setNewQuestion({ ...newQuestion, question: e.target.value })
                    }
                  />

                  <div className="options-grid">
                    {["a", "b", "c", "d"].map(letter => (
                      <div key={letter} className="option-row">
                        <span className="option-label">
                          Option {letter.toUpperCase()}
                        </span>
                        <input
                          className="option-input"
                          value={newQuestion[`option_${letter}`]}
                          onChange={e =>
                            setNewQuestion({
                              ...newQuestion,
                              [`option_${letter}`]: e.target.value
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminQuiz;
