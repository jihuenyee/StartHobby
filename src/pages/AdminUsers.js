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
      <div className="admin-page">
        <h1 className="admin-title">Manage Users</h1>
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <h1 className="admin-title">Manage Users</h1>
        <p>⛔ You do not have permission to view this page.</p>
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
    <div className="admin-page">
      <h1 className="admin-title">Manage Users</h1>
      {status && <p className="admin-status">{status}</p>}
      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && users.length === 0 && <p>No users found.</p>}

      {!loading && !error && users.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Type</th>
                <th style={{ width: "130px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isEditing = editingId === u.user_id;
                return (
                  <tr key={u.user_id}>
                    <td>{u.user_id}</td>

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
                            disabled={saving}
                            onClick={saveEdit}
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            className="secondary"
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
                          className="admin-small-btn"
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
  );
}

export default AdminUsers;
