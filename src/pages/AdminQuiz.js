import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";

function AdminQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // load all quizzes
  useEffect(() => {
    apiRequest("/quizzes").then(setQuizzes);
  }, []);

  // load quiz by id
  const loadQuiz = async (id) => {
    const data = await apiRequest(`/quizzes/${id}`);
    setSelectedQuiz(data);
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* LEFT */}
      <div style={{ width: 250 }}>
        <h3>Quizzes</h3>
        <ul>
          {quizzes.map(q => (
            <li
              key={q.id}
              style={{ cursor: "pointer" }}
              onClick={() => loadQuiz(q.id)}
            >
              Quiz ID: {q.id}
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
            <h3>Quiz {selectedQuiz.id}</h3>
            <p>Game: {selectedQuiz.gameType}</p>
            <p>A: {selectedQuiz.option_a}</p>
            <p>B: {selectedQuiz.option_b}</p>
            <p>C: {selectedQuiz.option_c}</p>
            <p>D: {selectedQuiz.option_d}</p>
            <small>{selectedQuiz.created_at}</small>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminQuiz;
