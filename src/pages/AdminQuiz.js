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
    setStatus("");

    try {
      await apiRequest(`/quizzes/question/${id}`, {
        method: "DELETE",
      });

      await loadQuiz(selectedGameType);

      setStatus("Question deleted ✓");
    } catch {
      setStatus("Failed to delete question");
    }
  };


  const addQuestion = async () => {
    setStatus("");

    try {
      await apiRequest("/quizzes/question", {
        method: "POST",
        body: {
          game_type: selectedGameType,
          question: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
        },
      });

      // 🔑 RELOAD from backend
      await loadQuiz(selectedGameType);

      setStatus("Question added ✓");
    } catch {
      setStatus("Failed to add question");
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
            className="btn-primary"
            onClick={addQuestion}
            disabled={!selectedGameType}
          >
            + Add Question
          </button>
        </header>

        {status && <p className="admin-quiz-status">{status}</p>}

        <div className="admin-quiz-main">
          <aside className="admin-quiz-sidebar">
            <h2>Quizzes</h2>

            {loadingList ? (
              <p>Loading…</p>
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
                    <span>{q.game_type}</span>
                    <small>Game type</small>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="admin-quiz-editor">
            {!selectedGameType && <p>Select a quiz to edit</p>}
            {loadingQuiz && <p>Loading questions…</p>}

            {!loadingQuiz &&
              questions.map((q) => (
                <div key={q.question_id} className="question-card">
                  <div className="question-header">
                    <span>Question #{q.question_id}</span>
                    <div>
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
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={q.question || ""}
                    onChange={(e) =>
                      updateQuestionText(q.question_id, e.target.value)
                    }
                  />

                  <div className="options-grid">
                    {["a", "b", "c", "d"].map((k) => (
                      <div key={k} className="option-row">
                        <span>Option {k.toUpperCase()}</span>
                        <input
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
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminQuiz;
