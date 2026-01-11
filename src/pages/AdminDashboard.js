// src/pages/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../api";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
    fetchQuiz();
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Load users error:", err);
    }
  };

  const fetchQuiz = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes/1`);
      const data = await res.json();
      setQuiz(data);
    } catch (err) {
      console.error("Load quiz error:", err);
    }
  };

  const handleQuestionChange = (questionId, text) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.question_id === questionId ? { ...q, question_text: text } : q
      ),
    }));
  };

  const saveQuestion = async (questionId, text) => {
    setSaving(true);
    setStatus("");
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_text: text }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to update question");
      }
      setStatus("Question updated ✅");
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <div className="admin-page">Please log in.</div>;
  }

  if (!isAdmin) {
    return <div className="admin-page">Access denied. Admins only.</div>;
  }

  return (
    <div className="admin-page">
      <h1 className="admin-title">Admin Dashboard</h1>

      {status && <p className="admin-status">{status}</p>}

      <div className="admin-grid">
        {/* Users table */}
        <section className="admin-card">
          <h2>Users</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.type_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Quiz editor */}
        <section className="admin-card">
          <h2>Quiz #1 – Questions</h2>
          {!quiz ? (
            <p>Loading quiz…</p>
          ) : (
            <div className="admin-questions">
              {quiz.questions.map((q) => (
                <div key={q.question_id} className="admin-question-block">
                  <label>Question #{q.question_id}</label>
                  <textarea
                    value={q.question_text}
                    onChange={(e) =>
                      handleQuestionChange(q.question_id, e.target.value)
                    }
                  />
                  <button
                    disabled={saving}
                    onClick={() => saveQuestion(q.question_id, q.question_text)}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                  <ul className="admin-options">
                    {q.options.map((opt) => (
                      <li key={opt.option_id}>
                        #{opt.option_id}: {opt.option_text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
