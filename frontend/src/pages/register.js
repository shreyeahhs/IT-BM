import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo2.png";
import { api } from "../api";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [alert, setAlert] = useState({ type: "", message: "" });

  const navigate = useNavigate();

  const handleRegister = async () => {

    if (!username || !password || !confirmPassword) {
      setAlert({ type: "error", message: "Please fill all fields" });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match" });
      return;
    }

    setIsSubmitting(true);

    try {

      const res = await api.post(
        "/register/",
        {
          first_name: firstName,
          last_name: lastName,
          username: username,
          password: password
        }
      );

      // save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.username);
      localStorage.setItem("id", res.data.user.id);
      localStorage.setItem("first_name", res.data.user.first_name || "");
      localStorage.setItem("last_name", res.data.user.last_name || "");

      setAlert({ type: "success", message: "Registered Successfully!" });

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      const data = err?.response?.data;
      const message =
        (data && (data.username?.[0] || data.password?.[0] || data.email?.[0] || data.detail)) ||
        "Registration failed";
      setAlert({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };


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
            <h2>Create your account</h2>
            <p>Join BookLoop and start exploring</p>
          </div>

          <div className="auth-name-row">
            <div className="auth-field-group">
              <label className="auth-label">First Name</label>
              <input
                type="text"
                className="auth-input"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="auth-field-group">
              <label className="auth-label">Last Name</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Username</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Password</label>
            <div className="auth-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" className="auth-toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="auth-field-group">
            <label className="auth-label">Confirm Password</label>
            <div className="auth-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button type="button" className="auth-toggle-pw" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? "Hide" : "Show"}
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
            onClick={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>

          <p className="auth-switch-text">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Register;
