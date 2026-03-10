import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/navbar";
import BookCard from "../components/bookcard";
import { api, getAuthConfig } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import CreateBook from "./createbook";

export default function MyBooks() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [, setAlert] = useState({ type: "", message: "" });
    const [search, setSearch] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const userid = localStorage.getItem("id");
    const firstName = localStorage.getItem("first_name") || "";
    const lastName = localStorage.getItem("last_name") || "";
    const displayName = `${firstName} ${lastName}`.trim() || username;

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
            const fetchMyBooks = useCallback(async () => {
        if (!token) {
          setAlert({ type: "error", message: "You must be logged in to view your books." });
          setLoading(false);
          return;
        }

        try {
                    const response = await api.get("/books/my-books/", getAuthConfig());
          setBooks(response.data);
          setLoading(false);
        } catch (error) {
          console.error(error);
          setAlert({ type: "error", message: "Failed to fetch your books." });
          setLoading(false);
        }
            }, [token, setAlert]);

            useEffect(() => {
                fetchMyBooks();
            }, [fetchMyBooks]);

    const handleDeleteBook = async (id) => {
        try {
            await api.delete(`/books/${id}/`, getAuthConfig());
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

            await api.patch(
                `/books/${id}/status/`,
                { status: status },
                getAuthConfig()
            );

            fetchMyBooks();

        } catch (error) {
            console.error("Status update error:", error);
        }
    };

    const updateBook = async (id, updates) => {
        try {
            await api.patch(`/books/${id}/`, updates, getAuthConfig());
            setAlert({ type: "success", message: "Book updated successfully!" });
            fetchMyBooks();
        } catch (error) {
            console.error("Update error:", error);
            setAlert({ type: "error", message: "Failed to update book." });
        }
    };

    // SEARCH FILTER
    const filteredBooks = books.filter(
        (book) =>
            book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.author.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <p className="app-loading-state">Loading your books...</p>;

    return (
        <>
            <Navbar />
            <main className="app-page-shell">
                <Card className="app-list-shell">
                    <CardHeader>
                        <CardTitle>Add New Book</CardTitle>
                        <CardDescription>Create listings directly from My Books.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Create Book
                        </Button>
                        {showCreateModal && (
                            <div className="app-modal-overlay" onClick={() => setShowCreateModal(false)}>
                                <div className="app-modal-content" onClick={(e) => e.stopPropagation()}>
                                    <CreateBook
                                        embedded
                                        onCreated={() => {
                                            fetchMyBooks();
                                            setShowCreateModal(false);
                                        }}
                                        onCancel={() => setShowCreateModal(false)}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="app-list-shell">
                    <CardHeader>
                        <CardTitle>My Books ({displayName})</CardTitle>
                        <CardDescription>Manage your listings and update availability.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                                    onEdit={updateBook}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}
