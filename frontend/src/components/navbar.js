import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  user = localStorage.getItem("username");

  // Logout function
  const handleLogout = () => {
    // 1. Call parent logout if provided
    if (onLogout) onLogout();
    // 2. Clear any stored user/session info
    localStorage.removeItem("username");   // if you store user info
    localStorage.removeItem("token");  // if using auth token
    localStorage.removeItem("id");
    localStorage.removeItem("boards");
    localStorage.removeItem("books");
    // 3. Redirect to login page
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>BookLoop</h2>
      <div className="nav-links">
        <span>Hello, {user}</span>
        <Link to="/dashboard">Home</Link>
        <Link to="/createbook">Create Book</Link>
        <Link to="/mybook">My Book</Link>
        <Link to="/board">Boards</Link>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
