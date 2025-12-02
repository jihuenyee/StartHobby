// src/pages/Profile.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CgProfile } from "react-icons/cg";
import ConfirmModal from "../components/ConfirmModal";
import MembershipSummary from "../components/MembershipSummary";
import "../styles/Profile.css";

function Profile() {
  const { user, logout, updateProfile, changePassword } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔐 Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwStatus("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwStatus("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwStatus("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPwStatus("New password should be at least 6 characters.");
      return;
    }

    try {
      setPwLoading(true);
      await changePassword(currentPassword, newPassword);
      setPwStatus("Password updated successfully.");

      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setPwStatus(err.message || "Failed to update password.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="title">My Profile</h1>

      {/* The Unified Card */}
      <div className="profile-details">
        {/* LEFT SECTION: User Info + Password */}
        <div className="profile-left-section">
          <CgProfile className="profile-picture" />

          {/* PROFILE INFO FORM */}
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

            {status && <p className="profile-status">{status}</p>}

            <div className="profile-actions">
              <div className="profile-actions-buttons">
                {!editMode ? (
                  <>
                    <button
                      type="button"
                      className="logout-btn"
                      onClick={confirmLogout}
                    >
                      Log out
                    </button>
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={handleEdit}
                    >
                      Edit profile
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={handleCancel}
                    >
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

          {/* CHANGE PASSWORD SECTION */}
          <div className="password-section">
            <h2 className="password-title">Change Password</h2>

            <form className="password-form" onSubmit={handleChangePassword}>
              <div className="detail-group">
                <span className="detail-label">Current Password</span>
                <input
                  className="profile-input"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="detail-group">
                <span className="detail-label">New Password</span>
                <input
                  className="profile-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="detail-group">
                <span className="detail-label">Confirm New Password</span>
                <input
                  className="profile-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              {pwStatus && (
                <p className="password-status">
                  {pwStatus}
                </p>
              )}

              <button
                type="submit"
                className="save-btn"
                disabled={pwLoading}
              >
                {pwLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT SECTION: Membership */}
        <div className="profile-right-section">
          <MembershipSummary />
        </div>
      </div>

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
