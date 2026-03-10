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
    <div className="split-container">
      {/* LEFT SIDE */}
      <div className="left-panel">
        <img src={logo} alt="Logo" />
       </div>

      {/* RIGHT SIDE */}
      <div className="right-panel">
        <div className="card auth-card-modern">
          <h2>Register</h2>

          <input
            type="text"
            placeholder="First Name"
            className="input-field"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Last Name"
            className="input-field"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Username"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* PASSWORD FIELD */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* CONFIRM PASSWORD FIELD */}
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </span>
          </div>

          <button className="btn btn-register auth-submit-btn" onClick={handleRegister}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>

          {alert.message && (
            <div className={`custom-alert ${alert.type}`}>
              <span>{alert.message}</span>
              <button className="close-btn" onClick={() => setAlert({ type: "", message: "" })}>
                &times;
              </button>
            </div>
          )}

          <p>
            Already have an account? <Link to="/">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
