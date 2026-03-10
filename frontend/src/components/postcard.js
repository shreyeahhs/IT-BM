import React, { useState, useRef, useEffect } from "react";
import "../App.css";
export default function PostCard({ board, user, posts, addPost,users }) {
  const [msg, setMsg] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setMsg(""); // optionally reset message input
  }, [board.posts]);


  const postMessage =  async () => {
    if (!msg) return;
    console.log(board.posts);

    //   const newMsg = {
    //       author: user,
    //       content: msg,
    //       created_at: new Date().toLocaleString(),
    //       likes: 0
    //   };

    //   const updated = [...messages, newMsg];
    //   setMessages(updated);
    //   board.posts = updated; // <-- modifying board directly
    //   setMsg("");
    // };
    // call parent addPost function which handles backend + state update
    await addPost(msg);

    setMsg(""); // clear textarea after posting
  };

  // const addEmoji = (emoji) => {
  //   setMsg(msg + emoji);
  // };

  // const deleteMessage = (index) => {
  //   const updated = messages.filter((_, i) => i !== index);
  //   setMessages(updated);
  //   board.posts = updated;
  // };

  // const likeMessage = (index) => {
  //   const updated = [...messages];
  //   updated[index].likes += 1;
  //   setMessages(updated);
  //   board.posts = updated;
  // };
  return (
    <div className="discussion-container">
      <div className="board-description">
        <p>{board.description}</p>
      </div>
      <div className="discussion-box">

        {board.posts?.map((m, i) => (
          <div key={i} className={`message ${m.author === user ? "self" : "other"}`}>
            <div className="message-header">
              <span className="online-dot"></span>
              {m.author_username} • {new Date(m.created_at).toLocaleString()}
              

            </div>
            <div>{m.content}</div>
            {/* <div className="message-actions">
              <button onClick={() => addPost(`👍 ${i}`)}>👍 {m.likes || 0}</button>
              {m.author_username === user && (
                <button onClick={() => addPost(`delete ${i}`)}>🗑 Delete</button>
              )}
            </div> */}
          </div>
        ))}
        <div ref={messagesEndRef} />
        {/* {messages.map((m, i) => (
          <div
            key={i}
            className={`message ${m.author === user ? "self" : "other"}`}
          >
            <div className="message-header">
              <span className="online-dot"></span>
              {m.author} • {m.created_at}
            </div>

            <div>{m.content}</div>

            <div className="message-actions">
              <button onClick={() => likeMessage(i)}>👍 {m.likes}</button>

              {m.author === user && (
                <button onClick={() => deleteMessage(i)}>🗑 Delete</button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> */}
      </div>

      {/* EMOJI PICKER */}
      {/* <div className="emoji-bar">
        {["😀", "🔥", "👍", "❤️", "😂"].map(e => (
          <span key={e} onClick={() => addEmoji(e)}>{e}</span>
        ))}
      </div> */}

      <textarea
        value={msg}
        onChange={e => setMsg(e.target.value)}
        placeholder="Write a message..."
      />

      <button onClick={postMessage}>Post</button>
    </div>
  );
}
