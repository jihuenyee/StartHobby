// src/pages/SignUpEmail.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";
import "../styles/SignUpEmail.css";

export default function SignUpEmail() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation rules
  const validate = () => {
    const newErrors = {};

    if (!fullName.trim()) newErrors.fullName = "Name is required.";
    else if (fullName.trim().length < 3)
      newErrors.fullName = "Name must be at least 3 characters.";
    else if (!/^[A-Za-z\s]+$/.test(fullName.trim()))
      newErrors.fullName = "Name should contain only letters.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) newErrors.email = "Email is required.";
    else if (!emailRegex.test(email)) newErrors.email = "Invalid email format.";

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!password) newErrors.password = "Password is required.";
    else if (!passRegex.test(password))
      newErrors.password = "Must include letters + numbers, 6+ chars.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validate()) return;

    try {
      setLoading(true);
      await signup(fullName.trim(), email.trim(), password);
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setGeneralError(err.message || "Failed to sign up. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // SOCIAL auth
    const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        navigate("/profile");
    } catch (error) {
        console.error("Google sign-in error:", error);
        alert("Google Sign-In failed: " + error.message);
    }
    };

    const handleFacebook = async () => {
    const provider = new FacebookAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        navigate("/profile");
    } catch (error) {
        console.error("Facebook sign-in error:", error);
        alert("Facebook Sign-In failed: " + error.message);
    }
    };

  return (
    <div className="signup-email-page">
      <button className="close-btn" onClick={() => navigate(-1)}>
        <IoClose />
      </button>

      <div className="signup-container">
        <h1>Sign Up</h1>
        <p>
          Already a member? <Link to="/login">Log In</Link>
        </p>

        {generalError && <p className="error-text">{generalError}</p>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {errors.fullName && <div className="error-text">{errors.fullName}</div>}
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className="or-divider">or sign up with</div>

        <div className="social-login">
            <button className="social-icon-btn" onClick={handleGoogle}>
                <FcGoogle size={38} />
            </button>
            <button className="social-icon-btn" onClick={handleFacebook}>
                <FaFacebook size={36} color="#1877F2" />
            </button>
        </div>
      </div>
    </div>
  );
}
