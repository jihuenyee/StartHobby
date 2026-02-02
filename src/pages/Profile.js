// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { CgProfile } from "react-icons/cg";
import ConfirmModal from "../components/ConfirmModal";
import MembershipSummary from "../components/MembershipSummary";
import { apiRequest } from "../api";
import "../styles/Profile.css";

function Profile() {
  const { user, logout, updateProfile, changePassword } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // password fields + toggle
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // password strength
  const [passwordStrength, setPasswordStrength] = useState("");
  const [rules, setRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  });

  // AI Profile state
  const [aiProfile, setAiProfile] = useState(null);
  const [loadingAiProfile, setLoadingAiProfile] = useState(false);

  // Fetch AI Profile on component mount
  useEffect(() => {
    const fetchAiProfile = async () => {
      if (!user?.email) return;
      
      setLoadingAiProfile(true);
      try {
        const response = await apiRequest(`/results/ai-profile/${user.email}`);
        if (response) {
          // Parse traits and hobbies if they're strings
          const profile = {
            ...response,
            traits: typeof response.traits === 'string' ? JSON.parse(response.traits) : response.traits,
            hobbies: typeof response.hobbies === 'string' ? JSON.parse(response.hobbies) : response.hobbies,
          };
          setAiProfile(profile);
        }
      } catch (error) {
        console.error("Failed to fetch AI profile:", error);
        // Don't show error to user, just don't display the section
      } finally {
        setLoadingAiProfile(false);
      }
    };

    fetchAiProfile();
  }, [user?.email]);

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
    setIsModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const resetPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
    setChangingPassword(false);
    setPasswordStrength("");
    setRules({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      symbol: false,
    });
  };

  const handleEdit = () => {
    setUsername(user.username || "");
    setEmail(user.email || "");
    setStatus("");
    resetPasswordFields();
    setEditMode(true);
  };

  const handleCancel = () => {
    setUsername(user.username || "");
    setEmail(user.email || "");
    setStatus("");
    resetPasswordFields();
    setEditMode(false);
  };

  const checkPasswordStrength = (value) => {
    const rulesCheck = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      symbol: /[^A-Za-z0-9]/.test(value),
    };

    setRules(rulesCheck);

    const passed = Object.values(rulesCheck).filter(Boolean).length;

    if (!value) {
      setPasswordStrength("");
    } else if (passed <= 2) {
      setPasswordStrength("Weak");
    } else if (passed === 3 || passed === 4) {
      setPasswordStrength("Medium");
    } else if (passed === 5) {
      setPasswordStrength("Strong");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus("");
    setPwError("");

    const wantsPasswordChange = changingPassword;

    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setPwError("Please fill in all password fields.");
        setSaving(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setPwError("New password and confirmation do not match.");
        setSaving(false);
        return;
      }

      if (!rules.length || !rules.uppercase || !rules.lowercase || !rules.number) {
        setPwError("Please meet all password requirements.");
        setSaving(false);
        return;
      }
    }

    try {
      await updateProfile({ username, email });

      if (wantsPasswordChange) {
        await changePassword(currentPassword, newPassword);
        setStatus("Profile & password updated successfully.");
      } else {
        setStatus("Profile updated successfully.");
      }

      resetPasswordFields();
      setEditMode(false);
    } catch (err) {
      console.error(err);
      const message = err.message || "Failed to update profile or password.";
      if (wantsPasswordChange) {
        setPwError(message);
      } else {
        setStatus(message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="title">My Profile</h1>

      <div className="profile-details">
        {/* LEFT SECTION: User Info + Change Password */}
        <div className="profile-left-section">
          <CgProfile className="profile-picture" />

          <div className="user-info">
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

            {/* CHANGE PASSWORD TOGGLE + FIELDS */}
            {editMode && (
              <div className="change-password-block">
                {!changingPassword ? (
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setChangingPassword(true)}
                  >
                    Change password
                  </button>
                ) : (
                  <>
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
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          checkPasswordStrength(e.target.value);
                        }}
                        placeholder="Enter new password"
                      />
                    </div>

                    {/* strength meter */}
                    {newPassword && (
                      <div className="password-strength-container">
                        <div
                          className={`strength-bar ${
                            passwordStrength ? passwordStrength.toLowerCase() : ""
                          }`}
                        ></div>
                        <span className="strength-label">
                          {passwordStrength || " "}
                        </span>
                      </div>
                    )}

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

                    {/* rules list */}
                    <ul className="password-rules">
                      <li className={rules.length ? "valid" : "invalid"}>
                        {rules.length ? "✔" : "✖"} At least 8 characters
                      </li>
                      <li className={rules.uppercase ? "valid" : "invalid"}>
                        {rules.uppercase ? "✔" : "✖"} Contains uppercase letter
                      </li>
                      <li className={rules.lowercase ? "valid" : "invalid"}>
                        {rules.lowercase ? "✔" : "✖"} Contains lowercase letter
                      </li>
                      <li className={rules.number ? "valid" : "invalid"}>
                        {rules.number ? "✔" : "✖"} Contains a number
                      </li>
                      <li className={rules.symbol ? "valid" : "invalid"}>
                        {rules.symbol ? "✔" : "✖"} Contains a symbol
                      </li>
                    </ul>

                    <div className="change-password-actions">
                      <button
                        type="button"
                        className="small-cancel-btn"
                        onClick={resetPasswordFields}
                      >
                        Cancel password change
                      </button>
                    </div>

                    {pwError && <p className="password-status">{pwError}</p>}
                  </>
                )}
              </div>
            )}

            {status && !editMode && (
              <p className="profile-status">{status}</p>
            )}

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
                    <button
                      type="button"
                      className="save-btn"
                      disabled={saving}
                      onClick={handleSave}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Membership */}
        <div className="profile-right-section">
          <MembershipSummary />
        </div>
      </div>

      {/* AI PROFILE SECTION */}
      {loadingAiProfile && (
        <div className="ai-profile-section">
          <h2 className="ai-profile-title">Your AI Personality Profile</h2>
          <p className="ai-profile-loading">Loading your AI results...</p>
        </div>
      )}

      {!loadingAiProfile && aiProfile && (
        <div className="ai-profile-section">
          <h2 className="ai-profile-title">Your AI Personality Profile</h2>
          
          {aiProfile.personality_summary && (
            <div className="ai-profile-card">
              <h3 className="ai-card-title">Personality Summary</h3>
              <p className="ai-profile-summary">{aiProfile.personality_summary}</p>
            </div>
          )}

          {aiProfile.traits && aiProfile.traits.length > 0 && (
            <div className="ai-profile-card">
              <h3 className="ai-card-title">Your Traits</h3>
              <div className="ai-traits-grid">
                {aiProfile.traits.map((trait, index) => (
                  <div key={index} className="ai-trait-item">
                    <span className="ai-trait-icon">✨</span>
                    <span className="ai-trait-text">
                      {typeof trait === 'string' ? trait : trait.trait}
                      {trait.score && <span className="ai-trait-score"> ({trait.score}/10)</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiProfile.hobbies && aiProfile.hobbies.length > 0 && (
            <div className="ai-profile-card">
              <h3 className="ai-card-title">Recommended Hobbies</h3>
              <div className="ai-hobbies-grid">
                {aiProfile.hobbies.map((hobby, index) => (
                  <div key={index} className="ai-hobby-item">
                    <span className="ai-hobby-icon">🎯</span>
                    <div className="ai-hobby-content">
                      <span className="ai-hobby-text">
                        {typeof hobby === 'string' ? hobby : hobby.name}
                      </span>
                      {hobby.why && <p className="ai-hobby-why">{hobby.why}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiProfile.created_at && (
            <p className="ai-profile-date">
              Generated on: {new Date(aiProfile.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {!loadingAiProfile && !aiProfile && (
        <div className="ai-profile-section">
          <h2 className="ai-profile-title">Your AI Personality Profile</h2>
          <div className="ai-profile-empty-card">
            <div className="empty-icon">🎮</div>
            <p className="ai-profile-empty">You haven't completed the personality quiz yet!</p>
            <p className="ai-profile-empty-subtitle">
              Discover your unique personality traits and get personalized hobby recommendations.
            </p>
            <button 
              className="start-quiz-btn" 
              onClick={() => window.location.href = '/'}
            >
              Start Personality Quiz
            </button>
          </div>
        </div>
      )}

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
