import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";

function AdminQuiz() {
  const [quizList, setQuizList] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // load quiz list (game_type only)
  useEffect(() => {
    apiRequest("/quizzes").then((data) => {
      setQuizList(Array.isArray(data) ? data : []);
    });
  }, []);

  // load quiz by game_type
  const loadQuiz = async (gameType) => {
    if (!gameType) return;
    const data = await apiRequest(`/quizzes/${gameType}`);
    setSelectedQuiz(data);
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* LEFT PANEL */}
      <div style={{ width: 250 }}>
        <h3>Quizzes</h3>

        {quizList.map((q) => (
          <div
            key={q.game_type}
            style={{
              border: "1px solid #6c63ff",
              padding: "10px",
              marginBottom: "8px",
              cursor: "pointer",
              borderRadius: "8px"
            }}
            onClick={() => loadQuiz(q.game_type)}
          >
            {q.game_type}
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1 }}>
        {!selectedQuiz ? (
          <p>Select a quiz from the left</p>
        ) : (
          <>
            <h3>Quiz: {selectedQuiz.game_type}</h3>

            {selectedQuiz.questions.map((q) => (
              <div key={q.question_id}>
                <p><b>{q.question}</b></p>
                <p>A: {q.option_a}</p>
                <p>B: {q.option_b}</p>
                <p>C: {q.option_c}</p>
                <p>D: {q.option_d}</p>
                <hr />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminQuiz;
