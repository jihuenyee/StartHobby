// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";
import "../styles/SignUpEmail.css"; // for .input-group, .error-text, .social-login, .social-icon-btn

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => navigate(-1);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validate()) return;

    try {
      setLoading(true);
      await login(email.trim(), password); // backend login
      navigate("/profile");
    } catch (err) {
      console.error("Email login error:", err);
      setGeneralError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setGeneralError("");
      await signInWithPopup(auth, provider);
      navigate("/profile");
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      )
        return;
      setGeneralError(error.message || "Google login failed.");
    }
  };

  const handleFacebook = async () => {
    const provider = new FacebookAuthProvider();
    try {
      setGeneralError("");
      await signInWithPopup(auth, provider);
      navigate("/profile");
    } catch (error) {
      console.error("Facebook sign-in error:", error);
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      )
        return;
      setGeneralError(error.message || "Facebook login failed.");
    }
  };

  return (
    <div className="loginpage">
      <button onClick={handleClose} className="close-btn">
        <IoClose />
      </button>

      <h1 className="title">Log In</h1>

      <p className="login-sub">
        New to this site?{" "}
        <Link to="/signup">
          Sign Up
        </Link>
      </p>

      {generalError && <p className="error-text">{generalError}</p>}

      {/* Email / Password form */}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <button
          type="submit"
          className="btn email"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="divider">
        <span>or log in with</span>
      </div>

      {/* Social login icons (no background) */}
      <div className="social-login">
        <button className="social-icon-btn" onClick={handleGoogle}>
          <FcGoogle size={32} />
        </button>
        <button className="social-icon-btn" onClick={handleFacebook}>
          <FaFacebook size={30} color="#1877F2" />
        </button>
      </div>
    </div>
  );
}
