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
  // Modal state for answers
  const [showAnswers, setShowAnswers] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
    fetchQuizList();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    }
  };

  const fetchQuizList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes`);
      const data = await res.json();
      setQuizList(Array.isArray(data) ? data : []);
    } catch {
      setQuizList([]);
    }
  };

  const loadQuiz = async (gameType) => {
    try {
      setSelectedGame(gameType);
      const res = await fetch(`${API_BASE_URL}/quizzes/${gameType}`);
      const data = await res.json();
      setQuiz(data);
    } catch {
      setQuiz(null);
    }
  };

  if (!user) return <div className="admin-dashboard-page">Please log in.</div>;
  if (!isAdmin) return <div className="admin-dashboard-page">Access denied.</div>;

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <header className="admin-dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage users, quizzes, and games.</p>
          </div>
        </header>

        <div className="admin-dashboard-main">
          <aside className="admin-dashboard-sidebar">
            <h2 className="sidebar-title">Users</h2>
            {users.length === 0 ? (
              <p className="sidebar-empty">No users</p>
            ) : (
              <ul className="quiz-list">
                {users.map((u) => (
                  <li key={u.user_id} className="quiz-list-item" style={{cursor:'pointer'}}
                    onClick={async () => {
                      setSelectedUser(u);
                      setLoadingAnswers(true);
                      setShowAnswers(true);
                      try {
                        const res = await fetch(`http://localhost:5000/api/results/email/${encodeURIComponent(u.email)}`);
                        const data = await res.json();
                        setAnswers(data);
                      } catch (err) {
                        setAnswers([]);
                      }
                      setLoadingAnswers(false);
                    }}>
                    <span className="quiz-list-title">{u.username}</span>
                    <span className="quiz-list-sub">{u.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="admin-dashboard-editor">
            <div className="editor-content">
              <h2 className="editor-title">Quizzes</h2>

              <ul className="quiz-list">
                {quizList.map((q) => (
                  <li
                    key={q.game_type}
                    className="quiz-list-item"
                    onClick={() => loadQuiz(q.game_type)}
                  >
                    <span className="quiz-list-title">{q.game_type}</span>
                    <span className="quiz-list-sub">Quiz Type</span>
                  </li>
                ))}
              </ul>

              {!quiz ? (
                <p>Select a quiz</p>
              ) : (
                <>
                  <h3>Quiz: {selectedGame}</h3>

                  {quiz.questions.map((q, index) => (
                    <div key={q.question_id} className="question-card">
                      <div className="question-header">
                        <span className="question-label">
                          Question #{index + 1}
                        </span>
                      </div>

                      <div className="question-textarea" style={{border: 'none', background: 'transparent', padding: '0'}}>
                        {q.question}
                      </div>

                      <div className="options-grid">
                        {["a", "b", "c", "d"].map((opt) => (
                          <div className="option-row" key={opt}>
                            <span className="option-label">
                              Option {opt.toUpperCase()}
                            </span>
                            <div className="option-input" style={{border: 'none', background: 'transparent', padding: '0'}}>
                              {q[`option_${opt}`]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        </div>

        {/* Modal for answers */}
        {showAnswers && (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
            <div style={{background:'#fff',padding:'2rem',borderRadius:'8px',minWidth:'300px',maxWidth:'90vw',maxHeight:'90vh',overflowY:'auto'}}>
              <h3>User: {selectedUser?.username || selectedUser?.email}</h3>
              <p><b>Email:</b> {selectedUser?.email}</p>
              <h4>Answers:</h4>
              {loadingAnswers ? (
                <p>Loading answers...</p>
              ) : answers.length > 0 ? (
                <ul>
                  {answers.map((ans, idx) => {
                    let claw, snake, castle;
                    try { claw = ans.claw_data ? JSON.parse(ans.claw_data) : null; } catch { claw = ans.claw_data; }
                    try { snake = ans.snake_data ? JSON.parse(ans.snake_data) : null; } catch { snake = ans.snake_data; }
                    try { castle = ans.castle_data ? JSON.parse(ans.castle_data) : null; } catch { castle = ans.castle_data; }
                    return (
                      <li key={idx} style={{marginBottom:'2em', listStyle:'none'}}>
                        {claw && (
                          <div style={{marginBottom:'1em'}}>
                            <b>Claw Game:</b>
                            {claw.answers && claw.answers.length > 0 ? (
                              <ul style={{paddingLeft:'1em'}}>
                                {claw.answers.map((a, i) => (
                                  <li key={i} style={{marginBottom:'0.5em'}}>
                                    <span style={{fontWeight:'bold'}}>Q:</span> {a.question}<br/>
                                    <span style={{fontWeight:'bold'}}>A:</span> {a.answer}
                                  </li>
                                ))}
                              </ul>
                            ) : <i>No answers</i>}
                            {claw.personalityType && (
                              <div style={{marginTop:'0.5em'}}><b>Personality Type:</b> {claw.personalityType}</div>
                            )}
                          </div>
                        )}
                        {snake && (
                          <div style={{marginBottom:'1em'}}>
                            <b>Snake Game:</b>
                            {snake.answers && snake.answers.length > 0 ? (
                              <ul style={{paddingLeft:'1em'}}>
                                {snake.answers.map((a, i) => (
                                  <li key={i} style={{marginBottom:'0.5em'}}>
                                    <span style={{fontWeight:'bold'}}>Q:</span> {a.q || a.question || ''}<br/>
                                    <span style={{fontWeight:'bold'}}>A:</span> {a.a || a.answer || ''}
                                  </li>
                                ))}
                              </ul>
                            ) : <i>No answers</i>}
                            {snake.types && snake.types.length > 0 && (
                              <div style={{marginTop:'0.5em'}}><b>Types:</b> {snake.types.join(', ')}</div>
                            )}
                          </div>
                        )}
                        {castle && (
                          <div style={{marginBottom:'1em'}}>
                            <b>Castle Game:</b>
                            {castle.answers && castle.answers.length > 0 ? (
                              <ul style={{paddingLeft:'1em'}}>
                                {castle.answers.map((a, i) => (
                                  <li key={i} style={{marginBottom:'0.5em'}}>
                                    <span style={{fontWeight:'bold'}}>Q:</span> {a.question}<br/>
                                    <span style={{fontWeight:'bold'}}>A:</span> {a.answer}
                                  </li>
                                ))}
                              </ul>
                            ) : <i>No answers</i>}
                            {castle.choices && castle.choices.length > 0 && (
                              <div style={{marginTop:'0.5em'}}><b>Choices:</b> {castle.choices.join(', ')}</div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>No answers available.</p>
              )}
              <button onClick={() => { setShowAnswers(false); setAnswers([]); setSelectedUser(null); }} style={{marginTop:'1rem'}}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
