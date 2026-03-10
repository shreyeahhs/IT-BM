import React, { useState } from "react";
import "../App.css";
import Navbar from "../components/navbar";
import axios from "axios";

export default function CreateBook({ user, onAddBook }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [condition, setCondition] = useState("New");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("available");
  const [cover, setCover] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Convert image to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCover(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
  if (!title || !author) {
    setAlert({ type: "error", message: "Please fill all required fields" });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
    return;
  }

  try {
    const token = localStorage.getItem("token");
    console.log(token);
    console.log(document.cookie); 
    // console.log(title);
    await axios.post(
      "http://127.0.0.1:8000/api/books/",
      {
        title: title,
        author: author,
        condition: condition,
        price: price,
        status: status
      },
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    setAlert({ type: "success", message: "Book added successfully!" });

    setTitle("");
    setAuthor("");
    setPrice("");

  } catch (error) {
    setAlert({ type: "error", message: "Failed to add book" });
  }

  setTimeout(() => setAlert({ type: "", message: "" }), 3000);
};

  return (
    <>
      <Navbar />
      <div className="boards-create">
        <h2 className="page-name">Create Book</h2>
        <div className="card">
          <div className="input-row">
            <p className="input-label">Book Title <span className="required">*</span></p>
            <input className="input-field" placeholder="Enter book title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="input-row">
            <p className="input-label">Author <span className="required">*</span></p>
            <input className="input-field" placeholder="Enter author name" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div className="input-row">
            <p className="input-label">Condition <span className="required">*</span></p>
            <select className="input-field" value={condition} onChange={e => setCondition(e.target.value)}>
              <option>New</option>
              <option>Good</option>
              <option>Used</option>
            </select>
          </div>
          <div className="input-row">
            <p className="input-label">Price</p>
            <input className="input-field" placeholder="Enter price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div className="input-row">
            <p className="input-label">Status <span className="required">*</span></p>
            <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="borrowed">Borrowed</option>
            </select>
          </div>
          <div className="input-row">
            <p className="input-label">Cover Image <span className="required">*</span></p>
            <input className="input-file-create" type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className="input-row">
            {cover && (
              <img src={cover} alt="Preview" className="cover-preview" />
            )}
          </div>
          <button className="btn-create" onClick={handleSubmit}>Add Book</button>
        </div >
        {alert.message && (
          <div className={`custom-alert ${alert.type}`}>
            <span>{alert.message}</span>
            <button className="close-btn" onClick={() => setAlert({ type: "", message: "" })}>
              &times;
            </button>
          </div>
        )}
      </div >
    </>
  );
}