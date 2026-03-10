import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const firstName = localStorage.getItem("first_name") || "";
  const lastName = localStorage.getItem("last_name") || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const currentUser = fullName || user || localStorage.getItem("username") || "Guest";

  // Logout function
  const handleLogout = () => {
    // 1. Call parent logout if provided
    if (onLogout) onLogout();
    // 2. Clear any stored user/session info
    localStorage.removeItem("username");   // if you store user info
    localStorage.removeItem("token");  // if using auth token
    localStorage.removeItem("id");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("boards");
    localStorage.removeItem("books");
    // 3. Redirect to login page
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand-row">
        <Link to="/dashboard" className="navbar-brand">BookLoop</Link>
        <span className="navbar-user">Hi, {currentUser}</span>
      </div>

      <div className="nav-links">
        <Link to="/dashboard" className="nav-link-item">Home</Link>
        <Link to="/mybook" className="nav-link-item">My Books</Link>
        <Link to="/board" className="nav-link-item">Boards</Link>
        <button type="button" className="btn-logout" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
