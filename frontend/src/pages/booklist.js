import React, { useEffect, useState } from "react";
import axios from "axios";
import BookCard from "../components/bookcard";
function BookList() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  // Token header
  const config = {
    headers: {
      Authorization: `Token ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    },
  };

  // 1️⃣ Fetch all books from backend
  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/books/", config);
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };



  // 6️⃣ Search filter
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

  // fetch books on component mount
  useEffect(() => {
    fetchBooks();
  }, [config]);
  // const [books, setBooks] = 
  // useState([
  //   {
  //     id: 1,
  //     title: "React Guide",
  //     author: "John Doe",
  //     condition: "New",
  //     price: 29.99,
  //     status: "available",
  //     owner: "admin",
  //     created_at: "2026-03-04 10:30 AM",
  //     cover: reactCover
  //   },
  //   {
  //     id: 2,
  //     title: "Django for Beginners",
  //     author: "Jane Smith",
  //     condition: "Good",
  //     price: 19.50,
  //     status: "sold",
  //     owner: "student1",
  //     created_at: "2026-03-03 08:15 PM",
  //     cover: djangoCover
  //   },
  //   {
  //     id: 3,
  //     title: "Clean Code",
  //     author: "Robert C. Martin",
  //     condition: "Used",
  //     price: 15.00,
  //     status: "borrowed",
  //     owner: "student2",
  //     created_at: "2026-03-02 02:45 PM",
  //     cover: reactCover   // you can replace with real image later
  //   }
  // ]);

  // const filteredBooks = books.filter(
  //   (book) =>
  //     book.title.toLowerCase().includes(search.toLowerCase()) ||
  //     book.author.toLowerCase().includes(search.toLowerCase())
  // );

  return (
    <div>
      <h2 className="page-name">Book Listings</h2>
      <input
        className="search-bar"
        placeholder="Search by title or author..."
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="book-container">
        {filteredBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

export default BookList;
