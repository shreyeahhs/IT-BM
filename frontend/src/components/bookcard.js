import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import Alert from "../components/alert";

function BookCard({ book, currentUser, id, onDelete, onUpdateStatus, onEdit }) {

  const [showModal, setShowModal] = useState(false);
  const displayRating = book.average_rating || 0;
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [editForm, setEditForm] = useState({
    title: book.title,
    author: book.author,
    condition: book.condition,
    price: book.price,
    status: book.status,
  });

  const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: "", message: "" }), 3000); // auto-hide after 3s
    };

  const isOwner = Number(id) === Number(book.owner) || currentUser === book.owner_username;
  const canManage = isOwner && (onDelete || onUpdateStatus || onEdit);

  const handleSaveEdit = async () => {
    try {
    await onEdit(book.id, editForm);
    setIsEditing(false);
    setShowModal(false);
    showAlert("success", "Updated successfully!");
  } catch (err) {
    const backendError = err.response?.data?.price?.[0] || 
                         err.response?.data?.error || 
                         "Failed to update book.";
    showAlert("error", backendError);
    console.error("Save error:", err);
  }
  };

  return (
    <>
      {alert.message && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
      )}
      {/* ===== BOOK PREVIEW CARD ===== */}
      <div className="book-card" onClick={() => setShowModal(true)}>
        <div className="image-wrapper">
          <img src={book.cover} alt={book.title} className="book-cover" />
        </div>

        <div className="book-preview">
          <h3>{book.title}</h3>
          <p>{book.author}</p>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content slide-in" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>✖</button>
            <div className="image-wrapper modal-img">
              <img src={book.cover} alt={book.title} className="modal-cover" />
            </div>

            <div className="modal-header">
              <h2>{book.title}</h2>
              <span className={`status ${book.status}`}>
                {book.status}
              </span>
            </div>

            
            {/* ⭐ Rating (Read-only for preview) */}
            <div 
              className="rating" 
              style={{ 
                display: "flex", 
                gap: "2px", 
                pointerEvents: "none", 
                cursor: "default"      
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  className={star <= displayRating ? "star filled" : "star"} 
                  style={{ color: star <= displayRating ? "#ffa500" : "#e4e5e9" }} 
                >
                  ★
                </span>
              ))}
            </div>
            

            {isEditing ? (
              <div>
                <input
                  className="input-field"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Title"
                />
                <input
                  className="input-field"
                  value={editForm.author}
                  onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                  placeholder="Author"
                />
                <input
                  className="input-field"
                  value={editForm.condition}
                  onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                  placeholder="Condition"
                />
                <input
                  className="input-field"
                  type="number"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (parseFloat(val) < 0) { 
                    showAlert("error", "Price cannot be negative!");
                    } else if (val === '' || parseFloat(val) >= 0) {
                      setEditForm({ ...editForm, price: val });
                    }
                  }}
                  placeholder="Price"
                />
              </div>
            ) : (
              <>
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>Condition:</strong> {book.condition}</p>
                <p><strong>Price:</strong> ${book.price}</p>
                <p><strong>Owner:</strong> {book.owner_username || book.owner}</p>
              </>
            )}
            <p className="date">
              {new Date(book.created_at).toLocaleString()}
            </p>
            {/* Book Detail Entrance */}
            {!isEditing && (
              <div style={{ marginTop: "20px" }}>
                <Link 
                  to={`/book/${book.id}`} 
                  className="available-btn" 
                  style={{ 
                  display: "block", 
                  textAlign: "center", 
                  textDecoration: "none", 
                  background: "#111827",
                  color: "white",
                  padding: "10px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  marginBottom: "10px"
                }}
                >
                  View Details
                </Link>
              </div>
            )}
            {/* OWNER ACTIONS */}
            {canManage && (
              <div className="book-actions">
                {!isEditing && onUpdateStatus && book.status !== "available" && (
                  <button
                    className="available-btn"
                    onClick={() => onUpdateStatus(book.id, "available")}
                  >
                    Mark Available
                  </button>
                )}
                {!isEditing && onUpdateStatus && book.status !== "sold" && (
                  <button className="sold-btn" onClick={() => onUpdateStatus(book.id, "sold")}>
                    Mark as Sold
                  </button>
                )}

                {!isEditing && onUpdateStatus && book.status !== "borrowed" && (
                  <button className="borrow-btn" onClick={() => onUpdateStatus(book.id, "borrowed")}  >
                    Mark Borrowed
                  </button>
                )}

                {onEdit && !isEditing && (
                  <button className="available-btn" onClick={() => setIsEditing(true)}>
                    Edit
                  </button>
                )}

                {onEdit && isEditing && (
                  <>
                    <button className="sold-btn" onClick={handleSaveEdit}>Save</button>
                    <button className="borrow-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                  </>
                )}

                {onDelete && <button className="delete-btn" onClick={() => onDelete(book.id)}>
                  Delete
                </button>}
              </div>

            )}

          </div>
        </div>
      )}
    </>
  );
}

export default BookCard;