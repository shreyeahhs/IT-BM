import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import { api, getAuthConfig } from "../api";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import Alert from "../components/alert";


const BookDetail = ({ user }) => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookReviews, setBookReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const [customAlert, setCustomAlert] = useState({ type: "", message: "" });
  const showAlert = (type, message) => {
      setCustomAlert({ type, message });
      setTimeout(() => setCustomAlert({ type: "", message: "" }), 3000);
  };

  const loadReviews = useCallback(async () => {
    try {
      const boardRes = await api.get(`/boards/?name=__SYSTEM_REVIEWS__`, getAuthConfig());
      if (boardRes.data.length > 0) {
        const reviewBoardId = boardRes.data[0].id;
        const reviewsRes = await api.get(`/boards/${reviewBoardId}/posts/?book_id=${id}`, getAuthConfig());
        setBookReviews(reviewsRes.data);
        return reviewBoardId; 
      }
    } catch (err) {
      console.error("Fetch reviews error:", err);
      return null;
    }
  }, [id]);

    const handleEditClick = (rev) => {
        setReviewText(rev.content);
        setRating(rev.rating || 5);
        setEditingReviewId(rev.id);
        window.scrollTo({ top: 300, behavior: 'smooth' }); 
    };

    const handleCancelEdit = () => {
        setReviewText("");
        setRating(5);
        setEditingReviewId(null);
    };

    const handlePostReview = async () => {
        if (!reviewText.trim()) return showAlert("error", "Please enter some text.");
        
        setSubmitting(true);
        try {
            const boardRes = await api.get(`/boards/?name=__SYSTEM_REVIEWS__`, getAuthConfig());
            const reviewBoardId = boardRes.data[0].id;
            
            const payload = {
                content: reviewText,
                book_id: id,
                rating: rating 
            };
            
            let res;
            if (editingReviewId) {
                res = await api.patch(`/posts/${editingReviewId}/`, payload, getAuthConfig());
            } else {
                res = await api.post(`/boards/${reviewBoardId}/posts/`, payload, getAuthConfig());
            }
            
            if (res.status === 201 || res.status === 200) {
                setReviewText("");
                setRating(5);
                setEditingReviewId(null);
                loadReviews();
                showAlert("success", editingReviewId ? "Review updated!" : "Review posted!");
            }
        } catch (err) {
            const errorMsg = err.response?.data?.[0] || err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || "Error processing review";
            showAlert("error", errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

  useEffect(() => {
    const fetchBookAndReviews = async () => {
      try {
        const response = await api.get(`/books/${id}/`, getAuthConfig());
        setBook(response.data);
        await loadReviews();
      } catch (err) {
        console.error("Getting book details failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookAndReviews();
  }, [id, loadReviews]);

  if (loading) return <div className="app-loading-state">Loading...</div>;
  if (!book) return <div className="app-loading-state" style={{ color: "red" }}>Can not find the book</div>;

  const coverSrc = book.cover 
    ? (book.cover.startsWith("data:image") ? book.cover : `data:image/jpeg;base64,${book.cover}`) 
    : "https://via.placeholder.com/300x400?text=No+Cover";

  return (
    <>
        <Navbar />
        {customAlert.message && (
            <Alert
                type={customAlert.type}
                message={customAlert.message}
                onClose={() => setCustomAlert({ type: "", message: "" })}
            />
        )}

        <main className="app-page-shell"> 
        <div style={{ display: "flex", gap: "30px", marginTop: "20px" }}>
            <div style={{ flex: "0 0 300px" }}>
                <div className="book-cover-restore">
                <img 
                    // src={book.cover} 
                    src={coverSrc}
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
                    <p style={{ margin: 6 }}><strong>Owner:</strong> {book.owner_username}</p>
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

                {/* Review*/}
                <div style={{ marginTop: "30px" }}>
                    <p style={{ fontWeight: "600", marginBottom: "8px", color: "#101828", fontSize: "1.6rem" }}>
                        {editingReviewId ? "Edit your review" : "Post a review"}
                    </p>
                    
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

                    <div className="app-form-actions" style={{ justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                        {editingReviewId && (
                            <Button variant="outline" onClick={handleCancelEdit} disabled={submitting}>
                                Cancel
                            </Button>
                        )}
                        <Button 
                            variant="default" 
                            onClick={handlePostReview} 
                            disabled={submitting}
                        >
                            {submitting ? "Processing..." : (editingReviewId ? "Update Review" : "Submit Review")}
                        </Button>
                    </div>
                </div>

                <div style={{ marginTop: "40px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                    <h3 style={{ fontFamily: "'Libre Caslon Text', serif" }}>Reviews ({bookReviews.length})</h3>
                    
                    {bookReviews.length === 0 ? (
                        <p style={{ color: "#666" }}>No reviews yet. Be the first!</p>
                    ) : (
                        bookReviews.map((rev) => (
                        <div key={rev.id} style={{ 
                            padding: "15px", 
                            borderBottom: "1px solid #f0f0f0",
                            marginBottom: "10px"
                        }}>
                            {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong>{rev.author_username}</strong>
                            <span style={{ color: "#ffa500" }}>{"★".repeat(rev.rating)}</span>
                            </div>
                            <p style={{ marginTop: "8px", color: "#333" }}>{rev.content}</p>
                            <small style={{ color: "#999" }}>{new Date(rev.created_at).toLocaleDateString()}</small> */}
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div>
                                    <strong style={{ marginRight: "10px" }}>{rev.author_username}</strong>
                                    <span style={{ color: "#ffa500" }}>{"★".repeat(rev.rating || 0)}</span>
                                </div>
                                {localStorage.getItem('username') === rev.author_username && (
                                    <button 
                                        onClick={() => handleEditClick(rev)}
                                        style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: "0.9rem" }}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            <p style={{ marginTop: "8px", color: "#333" }}>{rev.content}</p>
                            <small style={{ color: "#999" }}>{new Date(rev.created_at).toLocaleDateString()}</small>
                        </div>
                        ))
                    )}
                </div>

                </CardContent>
            </Card>
            </div>
        </div>
        </main>
    </>
  );
};

export default BookDetail;