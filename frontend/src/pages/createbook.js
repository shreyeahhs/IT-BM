import React, { useState } from "react";
import "../App.css";
import Navbar from "../components/navbar";
import { api, getAuthConfig } from "../api";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";

export default function CreateBook({ embedded = false, onCreated, onCancel }) {
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
    await api.post(
      "/books/",
      {
        title: title,
        author: author,
        condition: condition,
        price: price,
        status: status,
        cover: cover
      },
      getAuthConfig()
    );

    setAlert({ type: "success", message: "Book added successfully!" });

    setTitle("");
    setAuthor("");
    setPrice("");
    setCover(null);
    if (onCreated) onCreated();

  } catch (error) {
    setAlert({ type: "error", message: "Failed to add book" });
  }

  setTimeout(() => setAlert({ type: "", message: "" }), 3000);
};

  const formContent = (
    <>
      <Card className="app-form-card">
          <CardHeader>
            <CardTitle>Create Book</CardTitle>
            <CardDescription>Add a listing with clear details and an optional cover preview.</CardDescription>
          </CardHeader>
          <CardContent>
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
            <input 
              className="input-field" 
              placeholder="Enter price" 
              type="number" 
              min="0" 
              value={price} 
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || parseFloat(val) >= 0) {
                  setPrice(e.target.value);
                }
              }}
            />
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
            <div className="app-form-actions">
              <Button className="app-form-submit" onClick={handleSubmit}>Add Book</Button>
              {embedded && (
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
              )}
            </div>
          </CardContent>
      </Card>
      {alert.message && (
        <div className={`custom-alert ${alert.type}`}>
          <span>{alert.message}</span>
          <button className="close-btn" onClick={() => setAlert({ type: "", message: "" })}>
            &times;
          </button>
        </div>
      )}
    </>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <>
      <Navbar />
      <main className="app-page-shell">{formContent}</main>
    </>
  );
}