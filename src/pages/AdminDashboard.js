import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../api";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [quizList, setQuizList] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
    fetchQuizList();
  }, [isAdmin]);

  const fetchUsers = async () => {
    const res = await fetch(`${API_BASE_URL}/users`);
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  };

  const fetchQuizList = async () => {
    const res = await fetch(`${API_BASE_URL}/quizzes`);
    const data = await res.json();
    setQuizList(data);
  };

  const loadQuiz = async (gameType) => {
    setSelectedGame(gameType);
    const res = await fetch(`${API_BASE_URL}/quizzes/${gameType}`);
    const data = await res.json();
    setQuiz(data);
  };

  if (!user) return <div className="admin-page">Please log in.</div>;
  if (!isAdmin) return <div className="admin-page">Access denied.</div>;

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      <div className="admin-grid">
        {/* USERS */}
        <section className="admin-card">
          <h2>Users</h2>
          <table className="admin-table">
            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* QUIZZES */}
        <section className="admin-card">
          <h2>Quizzes</h2>

          <ul>
            {quizList.map(q => (
              <li
                key={q.game_type}
                style={{ cursor: "pointer" }}
                onClick={() => loadQuiz(q.game_type)}
              >
                {q.game_type}
              </li>
            ))}
          </ul>

          {!quiz ? (
            <p>Select a quiz</p>
          ) : (
            <>
              <h3>Quiz: {selectedGame}</h3>
              {quiz.questions.map(q => (
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
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
