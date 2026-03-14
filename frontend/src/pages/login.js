import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo2.png";
import { api } from "../api";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setAlert({ type: "error", message: "Please fill in all fields." });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.post("/login/", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("id", res.data.user_id);
      localStorage.setItem("first_name", res.data.first_name || "");
      localStorage.setItem("last_name", res.data.last_name || "");
      if (setUser) setUser(res.data.username);
      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Invalid username or password.";
      setAlert({ type: "error", message: errorMsg });
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div className="auth-split-container">

      {/* ── LEFT BRAND PANEL ── */}
      <div className="auth-left-panel">
        <div className="auth-brand-block">
          <img src={logo} alt="BookLoop logo" className="auth-logo" />
          <p className="auth-brand-tagline">
            Buy, sell, borrow, and discuss books with your community.
          </p>
        </div>

        <ul className="auth-feature-list">
          <li>
            <span className="auth-feature-icon">📚</span>
            <div>
              <strong>Marketplace</strong>
              <p>List books for sale or trade with other readers nearby.</p>
            </div>
          </li>
          <li>
            <span className="auth-feature-icon">💬</span>
            <div>
              <strong>Discussion Boards</strong>
              <p>Join topic boards, chat live, and share recommendations.</p>
            </div>
          </li>
          <li>
            <span className="auth-feature-icon">⭐</span>
            <div>
              <strong>Reviews</strong>
              <p>Rate books and leave detailed reviews for the community.</p>
            </div>
          </li>
        </ul>

        <p className="auth-left-footer">© 2026 BookLoop · All rights reserved</p>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="auth-right-panel">
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your BookLoop account</p>
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Username</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="username"
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Password</label>
            <div className="auth-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {alert.message && (
            <div className={`auth-alert ${alert.type}`}>
              {alert.message}
              <button onClick={() => setAlert({ type: "", message: "" })}>×</button>
            </div>
          )}

          <button
            className="auth-submit-btn"
            onClick={handleLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>

          <p className="auth-switch-text">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Login;