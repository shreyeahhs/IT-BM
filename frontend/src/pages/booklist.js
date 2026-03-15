import React, { useEffect, useState } from "react";
import BookCard from "../components/bookcard";
import { api, getAuthConfig } from "../api";
function BookList({ embedded = false }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");

  const fetchBooks = async () => {
    try {
      const response = await api.get("/books/", getAuthConfig());
      setBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchBooks();
  }, []);
  

  return (
    <div className={embedded ? "booklist-embedded" : ""}>
      {!embedded && <h2 className="page-name">Book Listings</h2>}
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
