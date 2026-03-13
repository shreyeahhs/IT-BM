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

const ExpandableMessage = ({ text, maxLength = 300 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  if (text.length <= maxLength) {
    return (
      <p className="dc-message-text" style={{ wordBreak: "break-word", margin: 0 }}>
        {text}
      </p>
    );
  }

  return (
    <div className="dc-expandable-message" style={{ display: "inline-block", width: "100%" }}>
      <p className="dc-message-text" style={{ wordBreak: "break-word", display: "inline", margin: 0 }}>
        {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      </p>
      
      {/* Tooltip */}
      <span
        className="dc-tooltip-trigger"
        data-tooltip={isExpanded ? "Collapse to save space" : "Expand to read full message"}
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          color: "#00a8fc",
          cursor: "pointer",
          marginLeft: "8px",
          fontSize: "0.85em",
          fontWeight: "600",
          userSelect: "none"
        }}
      >
        {isExpanded ? "Show Less" : "Read More"}
      </span>
    </div>
  );
};

export default function PostCard({ board, user, addPost }) {
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const emojis = ["😀", "😂", "🥰", "😎", "😭", "😡", "👍", "❤️", "🙏", "👀", "🔥", "✨"];
  const isJoined = board?.is_member;
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [board.posts]);

  const postMessage = async () => {
    if (!msg.trim()) return;
    await addPost(msg.trim());
    setMsg("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      postMessage();
    }
  };

  // Input auto adjust height
  const adjustHeight = () => { 
    const textarea = textareaRef.current;
    if (textarea) {

      textarea.style.height = "auto";           // reset height
      const maxHeight = window.innerHeight / 4; // max 1/4 of window height
      const currentScrollHeight = textarea.scrollHeight;  // Current hieght

      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      
      if (currentScrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = "auto"; 
      } else {
        textarea.style.height = `${currentScrollHeight}px`;
        textarea.style.overflowY = "hidden";
      }
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
            {/* <p className="dc-message-text">{m.content}</p> */}
            <ExpandableMessage text={m.content} maxLength={300}/>
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

      <div 
        className="dc-composer"
        style={{
          position: "relative",
          opacity: isJoined ? 1 : 0.6,
        }}
      >
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
          ref={textareaRef}
          className="dc-composer-input"
          value={msg}
          disabled={!isJoined}
          maxLength={999}
          onChange={(e) => {
            setMsg(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={isJoined ? `Message #${board?.name || "board"}` : "You must join to send messages."}
          // placeholder={`Message #${board.name || "board"}`}
          rows={1}
          style={{cursor: isJoined ? "pointer" : "not-allowed",}}
        />

        {msg.length >= 999 && (
          <span className="dc-limit-warning">
            Max 999 characters reached
          </span>
        )}

        <span 
          className="dc-char-counter"
          style={{
            // 980 red, 900 orange
            color: msg.length >= 980 ? "#ed4245" : msg.length >= 900 ? "#faa61a" : "#949ba4",
            fontWeight: msg.length >= 980 ? "bold" : "normal"
          }}
        >
          {msg.length}/999
        </span>

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
