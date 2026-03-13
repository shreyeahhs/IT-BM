import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";
import logo from "../assets/logo2.png";
import { api } from "../api";
function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ type: "", message: "" });


  const handleLogin = async () => {

    try {
      const res = await api.post(
        "/login/",
        {
          username: username,
          password: password
        }
      );

      // store token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("id", res.data.user_id);
      localStorage.setItem("first_name", res.data.first_name || "");
      localStorage.setItem("last_name", res.data.last_name || "");
      if (setUser) setUser(res.data.username);

      setAlert({ type: "success", message: "Login successful!" });
      setUsername(username);
      // Auto-hide after 3 seconds
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);

      navigate("/dashboard");

    // } catch (err) {
    //   setAlert({ type: "error", message: "Please enter email address and password" });
    //   setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    // }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Check email or password";
      setAlert({ type: "error", message: errorMsg });
      setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    }
  };


  return (
    <div className="split-container">

      {/* LEFT SIDE */}
      <div className="left-panel">
        <img src={logo} alt="Logo" />
      </div>

      <div className="right-panel">
        <div className="card auth-card-modern">
          <h2>Login</h2>

          <input type="text" placeholder="Username" className="input-field" onChange={(e) => setUsername(e.target.value)} />

          <input type="password"
            placeholder="Password"
            className="input-field"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-login auth-submit-btn" onClick={handleLogin}>
            Login
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
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>

    </div>

  );
}

export default Login;