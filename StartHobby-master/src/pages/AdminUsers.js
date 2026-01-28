// src/pages/AdminUsers.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../api";
import "../styles/AdminDashboard.css";

function AdminUsers() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    type_id: "normal",
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const data = await apiRequest("/users");
        setUsers(data || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    if (user && isAdmin) fetchUsers();
  }, [user, isAdmin]);

  if (!user) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-shell">
          <div className="editor-placeholder">
            You must be logged in to view this page.
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-shell">
          <div className="editor-placeholder">
            ⛔ You do not have permission to view this page.
          </div>
        </div>
      </div>
    );
  }

  // Start editing a user
  const startEdit = (u) => {
    setStatus("");
    setEditingId(u.user_id);
    setEditData({
      username: u.username || "",
      email: u.email || "",
      type_id: u.type_id || "normal",
    });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ username: "", email: "", type_id: "normal" });
  };

  // Handle inline field changes
  const handleChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Save edited user
  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setStatus("");
    try {
      await apiRequest(`/users/${editingId}`, {
        method: "PUT",
        body: {
          username: editData.username,
          email: editData.email,
          type_id: editData.type_id,
        },
      });

      // Update frontend immediately using editData
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === editingId
            ? {
                ...u,
                username: editData.username,
                email: editData.email,
                type_id: editData.type_id,
              }
            : u
        )
      );

      setStatus("User updated successfully ✅");
      cancelEdit();
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-shell">
        <header className="admin-dashboard-header">
          <div>
            <h1>Manage Users</h1>
            <p>View and edit user information and permissions.</p>
          </div>
        </header>

        {status && <p className="admin-quiz-status">{status}</p>}

        <div className="admin-dashboard-main">
          <section className="admin-dashboard-editor" style={{width: '100%'}}>
            <div className="editor-content">
              {loading && (
                <div className="editor-placeholder">Loading users...</div>
              )}

              {error && (
                <div className="editor-placeholder" style={{color: 'red'}}>
                  ❌ {error}
                </div>
              )}

              {!loading && !error && users.length === 0 && (
                <div className="editor-placeholder">No users found.</div>
              )}

              {!loading && !error && users.length > 0 && (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead style={{background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'}}>
                      <tr>
                        <th style={{color: '#ffffff'}}>ID</th>
                        <th style={{color: '#ffffff'}}>Username</th>
                        <th style={{color: '#ffffff'}}>Email</th>
                        <th style={{color: '#ffffff'}}>Type</th>
                        <th style={{ width: "180px", color: '#ffffff' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, index) => {
                        const isEditing = editingId === u.user_id;
                        return (
                          <tr key={u.user_id}>
                            <td>{index + 1}</td>

                            <td>
                              {isEditing ? (
                                <input
                                  className="admin-inline-input"
                                  value={editData.username}
                                  onChange={(e) =>
                                    handleChange("username", e.target.value)
                                  }
                                />
                              ) : (
                                u.username
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <input
                                  className="admin-inline-input"
                                  value={editData.email}
                                  onChange={(e) =>
                                    handleChange("email", e.target.value)
                                  }
                                />
                              ) : (
                                u.email
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <select
                                  className="admin-inline-input"
                                  value={editData.type_id}
                                  onChange={(e) =>
                                    handleChange("type_id", e.target.value)
                                  }
                                >
                                  <option value="normal">normal</option>
                                  <option value="admin">admin</option>
                                </select>
                              ) : (
                                u.type_id
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <div className="admin-inline-actions">
                                  <button
                                    type="button"
                                    className="btn-outline"
                                    disabled={saving}
                                    onClick={saveEdit}
                                  >
                                    {saving ? "Saving..." : "Save"}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={cancelEdit}
                                    disabled={saving}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => startEdit(u)}
                                  className="btn-outline"
                                >
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
