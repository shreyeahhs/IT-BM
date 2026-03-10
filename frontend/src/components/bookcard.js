import React, { useState } from "react";
import "../App.css";

function BookCard({ book, currentUser, id, onDelete, onUpdateStatus }) {

  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(4);
  console.log(id);
  const isOwner = id === book.owner;
  console.log(book.owner);
  console.log(isOwner);

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

            <p><strong>Author:</strong> {book.author}</p>
            <p><strong>Condition:</strong> {book.condition}</p>
            <p><strong>Price:</strong> ${book.price}</p>
            <p><strong>Owner:</strong> {book.owner}</p>
            <p className="date">
              {new Date(book.created_at).toLocaleString()}
            </p>

            {/* OWNER ACTIONS */}
            {isOwner && (
              <div className="book-actions">
                {book.status !== "available" && (
                  <button
                    className="available-btn"
                    onClick={() => onUpdateStatus(book.id, "available")}
                  >
                    Mark Available
                  </button>
                )}
                {book.status !== "sold" && (
                  <button className="sold-btn" onClick={() => onUpdateStatus(book.id, "sold")}>
                    Mark as Sold
                  </button>
                )}

                {book.status !== "borrowed" && (
                  <button className="borrow-btn" onClick={() => onUpdateStatus(book.id, "borrowed")}  >
                    Mark Borrowed
                  </button>
                )}

                <button className="delete-btn" onClick={() => onDelete(book.id)}>
                  Delete
                </button>
              </div>

            )}

          </div>
        </div>
      )}
    </>
  );
}

export default BookCard;