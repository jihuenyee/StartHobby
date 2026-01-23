import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";
import "../styles/AdminQuiz.css"; // your EXISTING old CSS

function AdminQuiz() {
  const [quizList, setQuizList] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: ""
  });

  // load quiz list (claw / snake / castle)
  useEffect(() => {
    apiRequest("/quizzes").then((data) => {
      setQuizList(Array.isArray(data) ? data : []);
    });
  }, []);

  // load quiz by game_type
  const loadQuiz = async (gameType) => {
    setSelectedGame(gameType);
    const data = await apiRequest(`/quizzes/${gameType}`);
    setSelectedQuiz(data);
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
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* LEFT — OLD UI (ID PILLS) */}
      <div style={{ width: 250 }}>
        <h3>Quizzes</h3>

        {quizList.map((q, index) => (
          <div
            key={q.game_type}
            className="quiz-id-pill"   // 🔥 SAME OLD CLASS
            onClick={() => loadQuiz(q.game_type)}
          >
            ID:
          </div>
        ))}
      </div>

      {/* RIGHT — OLD CONTENT */}
      <div style={{ flex: 1 }}>
        {!selectedQuiz ? (
          <p>Select a quiz from the left to manage questions.</p>
        ) : (
          <>
            <h3>Quiz</h3>

            {/* EXISTING QUESTIONS */}
            {selectedQuiz.questions.map((q) => (
              <div key={q.question_id} className="quiz-question-block">
                <p className="quiz-question-text">{q.question}</p>
                <p>A: {q.option_a}</p>
                <p>B: {q.option_b}</p>
                <p>C: {q.option_c}</p>
                <p>D: {q.option_d}</p>
              </div>
            ))}

            <hr />

            {/* ADD QUESTION — SAME UI STYLE */}
            <div className="quiz-question-block">
              <p className="quiz-question-text">Add New Question</p>

              <textarea
                placeholder="Question"
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, question: e.target.value })
                }
              />

              <input
                placeholder="Option A"
                value={newQuestion.option_a}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, option_a: e.target.value })
                }
              />
              <input
                placeholder="Option B"
                value={newQuestion.option_b}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, option_b: e.target.value })
                }
              />
              <input
                placeholder="Option C"
                value={newQuestion.option_c}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, option_c: e.target.value })
                }
              />
              <input
                placeholder="Option D"
                value={newQuestion.option_d}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, option_d: e.target.value })
                }
              />

              <button onClick={addQuestion}>Add Question</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminQuiz;
