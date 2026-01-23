import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";
import "../styles/AdminQuiz.css";

function AdminQuiz() {
  const [quizList, setQuizList] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: ""
  });

  // load quiz types (claw, snake, castle)
  useEffect(() => {
    apiRequest("/quizzes").then((data) => {
      setQuizList(Array.isArray(data) ? data : []);
    });
  }, []);

  // load questions by game_type
  const loadQuiz = async (gameType) => {
    setSelectedGame(gameType);
    const data = await apiRequest(`/quizzes/${gameType}`);
    setQuestions(data.questions || []);
  };

  // edit local state
  const updateField = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.question_id === id ? { ...q, [field]: value } : q
      )
    );
  };

  // save existing question
  const saveQuestion = async (q) => {
    await apiRequest(`/quizzes/question/${q.question_id}`, {
      method: "PUT",
      body: JSON.stringify(q),
    });
    alert("Saved");
  };

  // add new question
  const addQuestion = async () => {
    if (!selectedGame) return alert("Select quiz first");

    await apiRequest("/quizzes/question", {
      method: "POST",
      body: JSON.stringify({
        game_type: selectedGame,
        ...newQuestion,
      }),
    });

    setNewQuestion({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
    });

    loadQuiz(selectedGame);
  };

  return (
    <div className="quiz-admin">
      {/* LEFT – OLD PILL UI */}
      <div className="quiz-list">
        <h3>Quizzes</h3>
        {quizList.map((q) => (
          <div
            key={q.game_type}
            className={`quiz-pill ${
              selectedGame === q.game_type ? "active" : ""
            }`}
            onClick={() => loadQuiz(q.game_type)}
          >
            {q.game_type}
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="quiz-editor">
        {!selectedGame ? (
          <p>Select a quiz</p>
        ) : (
          <>
            <h2>Quiz: {selectedGame}</h2>

            {questions.map((q) => (
              <div key={q.question_id} className="question-card">
                <textarea
                  value={q.question}
                  onChange={(e) =>
                    updateField(q.question_id, "question", e.target.value)
                  }
                />

                <input value={q.option_a} onChange={(e) => updateField(q.question_id, "option_a", e.target.value)} />
                <input value={q.option_b} onChange={(e) => updateField(q.question_id, "option_b", e.target.value)} />
                <input value={q.option_c} onChange={(e) => updateField(q.question_id, "option_c", e.target.value)} />
                <input value={q.option_d} onChange={(e) => updateField(q.question_id, "option_d", e.target.value)} />

                <button onClick={() => saveQuestion(q)}>Save</button>
              </div>
            ))}

            <hr />

            <h3>Add Question</h3>
            <textarea
              placeholder="Question"
              value={newQuestion.question}
              onChange={(e) =>
                setNewQuestion({ ...newQuestion, question: e.target.value })
              }
            />
            <input placeholder="Option A" value={newQuestion.option_a} onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })} />
            <input placeholder="Option B" value={newQuestion.option_b} onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })} />
            <input placeholder="Option C" value={newQuestion.option_c} onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })} />
            <input placeholder="Option D" value={newQuestion.option_d} onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })} />

            <button onClick={addQuestion}>Add Question</button>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminQuiz;
