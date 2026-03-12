import React, { useState, useRef, useEffect } from "react";
import "../App.css";

const USER_COLORS = [
  "#f23f43", "#e87a3f", "#f0b232", "#23a55a",
  "#1d9bd1", "#5865f2", "#eb459e", "#3ba55c",
];

const getUserColor = (name) => {
  if (!name) return USER_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
};

const getInitial = (name) => (name?.trim()?.[0] || "?").toUpperCase();

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === today.toDateString()) return `Today at ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday at ${time}`;
  return d.toLocaleDateString([], { month: "2-digit", day: "2-digit", year: "2-digit" }) + " " + time;
};

const getDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
};

export default function PostCard({ board, user, addPost }) {
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojis = ["😀", "😂", "🥰", "😎", "😭", "😡", "👍", "❤️", "🙏", "👀", "🔥", "✨"];
  const isJoined = board?.is_member;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [board.posts]);

  const postMessage = async () => {
    if (!msg.trim()) return;
    await addPost(msg.trim());
    setMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      postMessage();
    }
  };

  // Sort oldest-first (backend may send newest-first)
  const posts = [...(board.posts || [])].reverse();

  const renderMessages = () => {
    const items = [];
    let lastDateStr = null;
    let lastAuthor = null;
    let lastTime = null;

    posts.forEach((m, i) => {
      const d = new Date(m.created_at);
      const dateStr = d.toDateString();
      const sameDay = lastDateStr === dateStr;
      const sameAuthor = lastAuthor === m.author_username;
      const timeDiff = lastTime ? (d - new Date(lastTime)) / 60000 : 999;
      const isGrouped = sameDay && sameAuthor && timeDiff < 7;

      if (!sameDay) {
        items.push(
          <div key={`divider-${i}`} className="dc-date-divider">
            <span className="dc-divider-line" />
            <span className="dc-divider-label">{getDateLabel(m.created_at)}</span>
            <span className="dc-divider-line" />
          </div>
        );
      }

      items.push(
        <div key={i} className={`dc-message ${isGrouped ? "dc-grouped" : ""}`}>
          {isGrouped ? (
            <div className="dc-avatar-spacer" />
          ) : (
            <div
              className="dc-avatar"
              style={{ background: getUserColor(m.author_username) }}
            >
              {getInitial(m.author_username)}
            </div>
          )}
          <div className="dc-message-content">
            {!isGrouped && (
              <div className="dc-message-meta">
                <span className="dc-author" style={{ color: getUserColor(m.author_username) }}>
                  {m.author_username}
                </span>
                <span className="dc-timestamp">{formatTime(m.created_at)}</span>
              </div>
            )}
            <p className="dc-message-text">{m.content}</p>
          </div>
        </div>
      );

      lastDateStr = dateStr;
      lastAuthor = m.author_username;
      lastTime = m.created_at;
    });

    return items;
  };

  return (
    <div className="dc-chat-wrapper">
      <div className="dc-messages-list">
        {posts.length === 0 && (
          <div className="dc-empty-state">
            <div className="dc-channel-hash">#</div>
            <p className="dc-empty-title">Welcome to #{board.name}!</p>
            <p className="dc-empty-sub">
              This is the start of the <strong>#{board.name}</strong> board.{" "}
              {board.description && <span>{board.description}</span>}
            </p>
            <div className="dc-empty-actions">
              <span className="dc-empty-chip">📌 {board.member_count || 0} member{board.member_count !== 1 ? "s" : ""}</span>
              <span className="dc-empty-chip">💬 Be the first to say something!</span>
            </div>
          </div>
        )}
        {renderMessages()}
        <div ref={messagesEndRef} />
      </div>

      {/* 1. 👇 新增：Emoji 悬浮面板 */}
      {showEmoji && (
        <div className="dc-emoji-picker">
          {emojis.map((emoji, index) => (
            <span 
              key={index} 
              className="dc-emoji-btn"
              onClick={() => {
                setMsg(prev => prev + emoji); 
                setShowEmoji(false); 
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}

      <div className="dc-composer">
        <button 
          className="dc-composer-plus" 
          type="button" 
          aria-label="Add"
          disabled={!isJoined}
          onClick={() => isJoined && setShowEmoji(!showEmoji)} 
          style={{cursor: isJoined ? "pointer" : "not-allowed",}}
        >
          +
        </button>
        <textarea
          className="dc-composer-input"
          value={msg}
          disabled={!isJoined}
          maxLength={500}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isJoined ? `Message #${board?.name || "board"}` : "You must join to send messages."}
          // placeholder={`Message #${board.name || "board"}`}
          rows={1}
          style={{cursor: isJoined ? "pointer" : "not-allowed",}}
        />
        <button 
          className="dc-composer-send" 
          type="button" 
          onClick={postMessage} 
          disabled={!isJoined} 
          style={{ cursor: isJoined ? "pointer" : "not-allowed" }} 
          aria-label="Send"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
