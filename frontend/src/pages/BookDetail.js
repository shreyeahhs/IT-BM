import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import { api, getAuthConfig } from "../api";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";


const BookDetail = ({ user }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(4);
  const [viewMode, setViewMode] = useState('restore');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${id}/`, getAuthConfig());
        setBook(response.data);
      } catch (err) {
        console.error("Getting book details failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  if (loading) return <div className="app-loading-state">Loading...</div>;
  if (!book) return <div className="app-loading-state" style={{ color: "red" }}>Can not find the book</div>;

  const coverSrc = book.cover 
    ? (book.cover.startsWith("data:image") ? book.cover : `data:image/jpeg;base64,${book.cover}`) 
    : "https://via.placeholder.com/300x400?text=No+Cover";

  return (
    <>
        <Navbar />
        <main className="app-page-shell"> 
        <div style={{ display: "flex", gap: "30px", marginTop: "20px" }}>
            <div style={{ flex: "0 0 300px" }}>
                <div className="book-cover-restore">
                <img 
                    src={book.cover} 
                    className="img-restore" 
                    alt={book.title} 
                />
                </div>
            </div>

            {/* Book details info */}
            <div style={{ flex: "1" }}>
            <Card className="app-form-card">
                <CardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <CardTitle style={{ fontSize: "3rem", fontFamily: "'Libre Caslon Text', serif", letterSpacing: "-0.02em"}}>{book.title}</CardTitle>
                    <p style={{ color: "#323741", marginTop: "4px", fontSize: "1.3rem", fontFamily: "'Libre Caslon Text', serif"}}>{book.author}</p>
                </div>
                <div 
                    className="rating" 
                    style={{ 
                        transform: "scale(1.2)",
                        transformOrigin: "left center",
                        pointerEvents: "none"
                    }}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                        key={star} 
                        className={star <= rating ? "star filled" : "star"} 
                        onClick={() => setRating(star)}
                        style={{ cursor: "pointer" }}
                    >
                        ★
                    </span>
                    ))}
                </div>
                </CardHeader>

                <CardContent>
                <div style={{ display: "flex", flexDirection: "column"}}>
                    <p style={{ margin: 6 }}><strong>Price:</strong> ${book.price}</p>
                    <p style={{ margin: 6 }}><strong>Owner:</strong> {book.owner}</p>
                    <p style={{ margin: 6 }}><strong>Condition:</strong> {book.condition}</p>
                    
                    <hr style={{ border: "0", borderTop: "1px solid #e7e8ec", margin: "10px 0" }} />

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <strong>Borrow:</strong>
                        {/* <input 
                        type="checkbox" 
                        checked={book.status === 'available'} 
                        readOnly 
                        style={{ width: "20px", height: "20px", accentColor: "#111827" }}
                        /> */}
                        <span className={`status ${book.status}`} style={{ marginLeft: "8px", textTransform: "capitalize", fontSize: "1rem" }}>
                            {book.status}
                        </span>
                    </div>

                    {/* Price or status */}
                </div>

                {/* Review (backend does not and may never support this function)*/}
                {/* <div style={{ marginTop: "30px" }}>
                    <p style={{ fontWeight: "600", marginBottom: "8px", color: "#101828", fontSize: "1.6rem" }}>Post reviews</p>
                    <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Reviews..."
                    style={{ 
                        width: "96%", 
                        height: "120px", 
                        padding: "16px", 
                        borderRadius: "10px", 
                        lineHeight: "1.5",
                        border: "1px solid #d0d5dd",
                        backgroundColor: "#f9fafb",
                        resize: "vertical",
                        fontFamily: "inherit",
                    }}
                    />
                    
                    <div className="app-form-actions" style={{ justifyContent: "flex-end" }}>
                    <Button variant="default" onClick={() => alert("Review feature backend pending!")}>
                        Preview
                    </Button>
                    </div>

                </div> */}
                </CardContent>
            </Card>
            </div>
        </div>
        </main>
    </>
  );
};

export default BookDetail;