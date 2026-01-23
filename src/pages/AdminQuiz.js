import React, { useEffect, useState } from "react";
import { apiRequest } from "../api";

function AdminQuiz() {
  const [gameTypes, setGameTypes] = useState([]);
  const [selectedGameType, setSelectedGameType] = useState(null);
  const [quizzes, setQuizzes] = useState([]);

  // load game types
  useEffect(() => {
    apiRequest("/quizzes/games").then(setGameTypes);
  }, []);

  // load quizzes when gameType clicked
  const loadQuizzes = async (gameType) => {
    setSelectedGameType(gameType);
    const data = await apiRequest(`/quizzes/game/${gameType}`);
    setQuizzes(data);
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* LEFT: GAME TYPES */}
      <div style={{ width: "200px" }}>
        <h3>Game Types</h3>
        <ul>
          {gameTypes.map(gt => (
            <li
              key={gt}
              style={{ cursor: "pointer" }}
              onClick={() => loadQuizzes(gt)}
            >
              {gt}
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT: QUIZZES */}
      <div style={{ flex: 1 }}>
        <h3>Quizzes {selectedGameType && `(${selectedGameType})`}</h3>

        {quizzes.map(q => (
          <div key={q.id} style={{ borderBottom: "1px solid #ccc", marginBottom: 10 }}>
            <p>ID: {q.id}</p>
            <p>A: {q.option_a}</p>
            <p>B: {q.option_b}</p>
            <p>C: {q.option_c}</p>
            <p>D: {q.option_d}</p>
            <small>Created: {q.created_at}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminQuiz;
