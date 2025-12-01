// src/pages/Profile.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CgProfile } from "react-icons/cg";
import ConfirmModal from "../components/ConfirmModal";  // <-- added
import "../styles/Profile.css";

function Profile() {
  const { user, logout, updateProfile } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);   // <-- added

  if (!user) {
    return (
      <div className="profile-page">
        <h1 className="title">My Profile</h1>
        <div className="profile-details">
          <p className="profile-empty-text">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const confirmLogout = () => {
    setIsModalOpen(true); // open modal instead of direct logout
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleEdit = () => {
    setUsername(user.username || "");
    setEmail(user.email || "");
    setStatus("");
    setEditMode(true);
  };

  const handleCancel = () => {
    setUsername(user.username || "");
    setEmail(user.email || "");
    setStatus("");
    setEditMode(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      await updateProfile({ username, email });
      setStatus("Profile updated successfully.");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="title">My Profile</h1>

      <form className="profile-details" onSubmit={handleSave}>
        <div className="profile-main">
          <CgProfile className="profile-picture" />

          <div className="user-info">
            <span className="detail-label">Name:</span>
            {editMode ? (
              <input
                className="profile-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            ) : (
              <span>{user.username || "Not provided"}</span>
            )}

            <span className="detail-label">Email:</span>
            {editMode ? (
              <input
                className="profile-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            ) : (
              <span>{user.email || "Not provided"}</span>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {status && <p className="profile-status">{status}</p>}

          <div className="profile-actions-buttons">
            <button
              type="button"
              className="logout-btn"
              onClick={confirmLogout}   // <-- now opens modal
            >
              Log out
            </button>

            {!editMode && (
              <button
                type="button"
                className="edit-btn"
                onClick={handleEdit}
              >
                Edit profile
              </button>
            )}

            {editMode && (
              <>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </>
            )}
          </div>
        </div>
      </form>

      {/* Logout confirmation modal */}
      {isModalOpen && (
        <ConfirmModal
          title="Confirm Logout"
          onConfirm={handleLogout}
          onCancel={() => setIsModalOpen(false)}
        >
          <p>Are you sure you want to log out?</p>
        </ConfirmModal>
      )}
    </div>
  );
}

export default Profile;
