import React , { useEffect, useState }from "react";
import BookList from "./booklist";
import "../App.css";
import Navbar from "../components/navbar";

export default function Dashboard({ user, onLogout }) {
const [books, setBooks] = useState([]);
  // Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("books")) || [];
    setBooks(saved);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);


  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <div className="dashboard">
        <BookList books={books} />
      </div>
    </>
  );
}
