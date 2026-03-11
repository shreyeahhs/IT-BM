import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./components/ui/ui.css";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Boards from "./pages/board";
import MyBooks from "./pages/mybook";
import BookDetail from "./pages/BookDetail";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) setUser(username);
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/board" element={<Boards user={user} />} />
        <Route path="/mybook" element={<MyBooks />} />
        <Route path="/book/:id" element={<BookDetail user={user} />} />

      </Routes>
    </Router>
  );
}

export default App;
