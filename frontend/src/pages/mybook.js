import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/navbar";
import BookCard from "../components/bookcard";

export default function MyBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [search, setSearch] = useState("");

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const userid = localStorage.getItem("id");

    // useEffect(() => {
    //     const sampleBooks = [
    //         {
    //             id: 1,
    //             title: "React Guide",
    //             author: "John Doe",
    //             condition: "New",
    //             price: 29.99,
    //             status: "available",
    //             owner: "admin1@gmail.com",
    //             created_at: "2026-03-05T10:30:00",
    //             cover: reactCover
    //         },
    //         {
    //             id: 2,
    //             title: "Django for Beginners",
    //             author: "William Vincent",
    //             condition: "Good",
    //             price: 18.50,
    //             status: "sold",
    //             owner: "shu_ao",
    //             created_at: "2026-03-04T14:20:00",
    //             cover: djangoCover
    //         },
    //         {
    //             id: 3,
    //             title: "Clean Code",
    //             author: "Robert C. Martin",
    //             condition: "Used",
    //             price: 12.00,
    //             status: "borrowed",
    //             owner: "admin1@gmail.com",
    //             created_at: "2026-03-03T18:10:00",
    //             cover: "https://via.placeholder.com/120x160"
    //         },
    //         {
    //             id: 4,
    //             title: "Python Crash Course",
    //             author: "Eric Matthes",
    //             condition: "Like New",
    //             price: 22.99,
    //             status: "available",
    //             owner: "shu_ao",
    //             created_at: "2026-03-02T09:15:00",
    //             cover: "https://via.placeholder.com/120x160"
    //         }
    //     ];

    //     setBooks(sampleBooks);
    //     setLoading(false);
    // }, []);
      useEffect(() => {
        fetchMyBooks();
      }, [token]);

      const fetchMyBooks = async () => {
        if (!token) {
          setAlert({ type: "error", message: "You must be logged in to view your books." });
          setLoading(false);
          return;
        }

        try {
          const response = await axios.get("http://127.0.0.1:8000/api/books/my-books/", {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
          setBooks(response.data);
          setLoading(false);
        } catch (error) {
          console.error(error);
          setAlert({ type: "error", message: "Failed to fetch your books." });
          setLoading(false);
        }
      };

    const handleDeleteBook = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/books/${id}/`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });
            setBooks(books.filter(book => book.id !== id));
            setAlert({ type: "success", message: "Book deleted successfully!" });
            setTimeout(() => setAlert({ type: "", message: "" }), 3000);
        } catch (error) {
            console.error(error);
            setAlert({ type: "error", message: "Failed to delete book." });
        }
    };

    // UPDATE STATUS
    const updateStatus = async (id, status) => {
        try {

            await axios.patch(
                `http://127.0.0.1:8000/api/books/${id}/status/`,
                { status: status },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            fetchMyBooks();

        } catch (error) {
            console.error("Status update error:", error);
        }
    };

    // SEARCH FILTER
    const filteredBooks = books.filter(
        (book) =>
            book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.author.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p>Loading your books...</p>;

    return (
        <>
            <Navbar />
            <div>
                <h2 className="page-name">My Books ({username})</h2>
                <input
                    className="search-bar"
                    placeholder="Search by title or author..."
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="book-container">
                    {filteredBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                            currentUser={username}
                            id={userid}
                            onDelete={handleDeleteBook}
                            onUpdateStatus={updateStatus}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
