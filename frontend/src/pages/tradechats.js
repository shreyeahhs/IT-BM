import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Alert from "../components/alert";
import { api, getAuthConfig } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import "../App.css";

export default function TradeChats() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "";

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await api.get("/trade-chats/", getAuthConfig());
        setRooms(res.data);
      } catch (err) {
        setAlert({ type: "error", message: "Could not load your chat rooms." });
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

  return (
    <>
      <Navbar />
      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
        />
      )}

      <main className="app-page-shell">
        <Card className="trade-room-list-shell">
          <CardHeader className="trade-room-list-header">
            <CardTitle>Trade Chats</CardTitle>
            <CardDescription>Your active conversations for buying and borrowing books.</CardDescription>
          </CardHeader>

          {loading ? (
            <p className="app-loading-state">Loading chats...</p>
          ) : rooms.length === 0 ? (
            <CardContent>
              <div className="trade-room-empty">
                <h3>No chat rooms yet</h3>
                <p>Open any listing and click Buy or Borrow to start a conversation.</p>
                <Button variant="secondary" onClick={() => navigate("/dashboard")}>Browse Listings</Button>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="trade-room-list">
                {rooms.map((room) => {
                  const isBuyer = room.buyer_username === username;
                  const otherPerson = isBuyer ? room.seller_username : room.buyer_username;

                  return (
                    <button
                      key={room.id}
                      className="trade-room-item"
                      type="button"
                      onClick={() => navigate(`/trade-chat/${room.id}`)}
                    >
                      <div className="trade-room-item-top">
                        <h3>{room.book_title}</h3>
                        <span className={`trade-intent-pill ${room.initial_intent}`}>
                          {room.initial_intent}
                        </span>
                      </div>
                      <p className="trade-room-item-meta">
                        {isBuyer ? "Seller" : "Buyer"}: <strong>{otherPerson}</strong>
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      </main>
    </>
  );
}
