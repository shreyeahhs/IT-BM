import React, { useEffect, useState } from "react";
import BookCard from "../components/bookcard";
import { api, getAuthConfig } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";

function BookList({ embedded = false }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const currentUserId = Number(localStorage.getItem("id"));
  const currentUsername = localStorage.getItem("username") || "";

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

  const ownBooks = filteredBooks.filter(
    (book) => Number(book.owner) === currentUserId || book.owner_username === currentUsername
  );
  const otherBooks = filteredBooks.filter(
    (book) => !(Number(book.owner) === currentUserId || book.owner_username === currentUsername)
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

      {ownBooks.length > 0 && (
        <Card className="listing-section listing-card-shell">
          <CardHeader>
            <CardTitle>My Listings</CardTitle>
            <CardDescription>Books posted by you.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="book-container">
              {ownBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="listing-section listing-card-shell">
        <CardHeader>
          <CardTitle>Marketplace Listings</CardTitle>
          <CardDescription>Browse books from other users.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="book-container">
            {otherBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BookList;
