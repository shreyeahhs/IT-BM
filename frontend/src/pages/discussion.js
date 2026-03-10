import React, { useState } from "react";
import Navbar from "../components/navbar";
import "../App.css";

function Discussion() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    "I love fantasy novels!",
    "Any good book recommendations?"
  ]);

  const postMessage = () => {
    if (!message) return;
    setMessages([...messages, message]);
    setMessage("");
  };

  return (
    <>
      <Navbar />
      <div className="discussion-container">
        <h2 className="page-name">Fandom Discussion</h2>

        <div className="discussion-box">
          {messages.map((msg, i) => (
            <div key={i} className="discussion-message">
              {msg}
            </div>
          ))}
        </div>

        <textarea
          placeholder="Write your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button className="btn btn-login" onClick={postMessage}>
          Post
        </button>
      </div>
    </>
  );
}

export default Discussion;