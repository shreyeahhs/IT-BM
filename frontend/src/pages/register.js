import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo2.png";
import axios from "axios";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   const [, setAlert] = useState({ type: "", message: "" });

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

    try {

      const res = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        {
          username: username,
          password: password
        }
      );

      // save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.user.username);

      setAlert({ type: "success", message: "Registered Successfully!" });

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setAlert({ type: "error", message: "Registration failed" });
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
        <div className="card">
          <h2>Register</h2>

          <input
            type="text"
            placeholder="Email Address"
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

          <button className="btn btn-register" onClick={handleRegister}>
            Register
          </button>

          <p>
            Already have an account? <Link to="/">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
