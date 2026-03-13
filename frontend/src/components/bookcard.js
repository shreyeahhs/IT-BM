import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function BookCard({ book, currentUser, id, onDelete, onUpdateStatus, onEdit }) {

  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(4);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: book.title,
    author: book.author,
    condition: book.condition,
    price: book.price,
    status: book.status,
  });

  const isOwner = Number(id) === Number(book.owner) || currentUser === book.owner_username;
  const canManage = isOwner && (onDelete || onUpdateStatus || onEdit);

  const handleSaveEdit = async () => {
    if (!onEdit) return;
    await onEdit(book.id, editForm);
    setIsEditing(false);
    setShowModal(false);
  };

  return (
    <>
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

            {/* ⭐ Rating */}
            <div className="rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= rating ? "star filled" : "star"} onClick={() => setRating(star)}>
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
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
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