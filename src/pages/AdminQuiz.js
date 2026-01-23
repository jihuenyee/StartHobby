import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";

function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // load quiz list
  useEffect(() => {
    apiRequest("/quizzes").then(setQuizzes);
  }, []);

  // load quiz by game_type
  const loadQuiz = async (gameType) => {
    if (!gameType) return;
    const data = await apiRequest(`/quizzes/${gameType}`);
    setSelectedQuiz(data);
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* LEFT */}
      <div style={{ width: 250 }}>
        <h3>Quizzes</h3>
        <ul>
          {quizzes.map((q) => (
            <li
              key={q.game_type}
              style={{ cursor: "pointer" }}
              onClick={() => loadQuiz(q.game_type)}
            >
              {q.game_type}
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1 }}>
        {!selectedQuiz ? (
          <p>Select a quiz</p>
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
