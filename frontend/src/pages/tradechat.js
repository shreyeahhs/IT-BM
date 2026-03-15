import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Alert from "../components/alert";
import { api, getAuthConfig } from "../api";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import "../App.css";

export default function TradeChat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const username = localStorage.getItem("username") || "";

  const loadRoom = async () => {
    try {
      const res = await api.get(`/trade-chats/${roomId}/`, getAuthConfig());
      setRoom(res.data);
    } catch (err) {
      setAlert({ type: "error", message: "Could not load chat room." });
    }
  };

  const loadMessages = async () => {
    try {
      const res = await api.get(`/trade-chats/${roomId}/messages/`, getAuthConfig());
      setMessages(res.data);
    } catch (err) {
      setAlert({ type: "error", message: "Could not load messages." });
    }
  };

  useEffect(() => {
    loadRoom();
    loadMessages();
  }, [roomId]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadMessages();
    }, 7000);

    return () => clearInterval(intervalId);
  }, [roomId]);

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await api.post(
        `/trade-chats/${roomId}/messages/`,
        { content: messageText.trim() },
        getAuthConfig()
      );
      setMessages((prev) => [...prev, res.data]);
      setMessageText("");
    } catch (err) {
      const msg = err.response?.data?.content?.[0] || "Failed to send message.";
      setAlert({ type: "error", message: msg });
    } finally {
      setIsSending(false);
    }
  };

  const handleEnterToSend = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Navbar />
      {alert.message && (
        <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: "", message: "" })} />
      )}

      <main className="app-page-shell trade-chat-page">
        <Card className="trade-chat-shell">
          {room ? (
            <>
              <div className="trade-chat-header">
                <div className="trade-chat-title-wrap">
                  <h2>Trade Chat</h2>
                  <p>
                    Book: <strong>{room.book_title}</strong>
                  </p>
                  <p>
                    Buyer: <strong>{room.buyer_username}</strong> · Seller: <strong>{room.seller_username}</strong>
                  </p>
                </div>
                <span className={`trade-intent-pill ${room.initial_intent}`}>
                  {room.initial_intent}
                </span>
              </div>

              <div className="trade-chat-messages">
                {messages.length === 0 && (
                  <div className="trade-chat-empty">
                    <p>No messages yet. Start the conversation about buying or borrowing this book.</p>
                  </div>
                )}

                {messages.map((m) => {
                  const isMine = m.sender_username === username;
                  return (
                    <div key={m.id} className={`trade-msg-row ${isMine ? "mine" : "theirs"}`}>
                      <div className={`trade-msg-bubble ${isMine ? "mine" : "theirs"}`}>
                        <div className="trade-msg-author">{m.sender_username}</div>
                        <div className="trade-msg-content">{m.content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="trade-chat-composer">
                <textarea
                  className="trade-chat-input"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleEnterToSend}
                />
                <Button className="trade-chat-send" onClick={handleSend} disabled={isSending}>
                  {isSending ? "Sending..." : "Send"}
                </Button>
              </div>

              <div className="trade-chat-footer">
                <Button variant="secondary" onClick={() => navigate("/chats")}>Back to Chats</Button>
              </div>
            </>
          ) : (
            <CardContent>
              <p>Loading chat room...</p>
            </CardContent>
          )}
        </Card>
      </main>
    </>
  );
}
