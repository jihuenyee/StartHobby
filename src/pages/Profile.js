// src/pages/Profile.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CgProfile } from "react-icons/cg";
import ConfirmModal from "../components/ConfirmModal";
import MembershipSummary from "../components/MembershipSummary";
import "../styles/Profile.css";

function Profile() {
  const { user, logout, updateProfile } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); 

  if (!user) {
    return (
      <div className="profile-page">
        <h1 className="title">My Profile</h1>
        <div className="profile-empty-container">
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

      {/* The Unified Card */}
      <div className="profile-details">
        
        {/* LEFT SECTION: User Info */}
        <div className="profile-left-section">
          <CgProfile className="profile-picture" />

          <form className="user-info" onSubmit={handleSave}>
            <div className="detail-group">
              <span className="detail-label">Name</span>
              {editMode ? (
                <input
                  className="profile-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              ) : (
                <span className="detail-value">{user.username}</span>
              )}
            </div>

            <div className="detail-group">
              <span className="detail-label">Email</span>
              {editMode ? (
                <input
                  className="profile-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              ) : (
                <span className="detail-value">{user.email}</span>
              )}
            </div>

            <div className="profile-actions">
              <div className="profile-actions-buttons">
                {!editMode ? (
                  <>
                    <button type="button" className="logout-btn" onClick={confirmLogout}>
                      Log out
                    </button>
                    <button type="button" className="edit-btn" onClick={() => setEditMode(true)}>
                      Edit profile
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="save-btn" disabled={saving}>
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT SECTION: Membership */}
        <div className="profile-right-section">
          <MembershipSummary />
        </div>

      </div>

      {isModalOpen && (
        <ConfirmModal
          title="Confirm Logout"
          onConfirm={async () => { await logout(); setIsModalOpen(false); }}
          onCancel={() => setIsModalOpen(false)}
        >
          <p>Are you sure you want to log out?</p>
        </ConfirmModal>
      )}
    </div>
  );
}

export default Profile;
