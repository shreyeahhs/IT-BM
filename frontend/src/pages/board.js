import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import PostCard from "../components/postcard";
import Alert from "../components/alert";
import "../App.css";
import { API_BASE_URL, getAuthConfig } from "../api";

export default function Boards({ user, onLogout }) {
    const [boards, setBoards] = useState([]);
    const [currentBoard, setCurrentBoard] = useState(null);
    const [showCreateBoard, setShowCreateBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");
    const [newBoardDesc, setNewBoardDesc] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });

    const showAlert = (type, message) => {
        setAlert({ type, message });
        setTimeout(() => setAlert({ type: "", message: "" }), 3000); // auto-hide after 3s
    };
    // Load boards from Django
    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/boards/`, {
                    headers: getAuthConfig().headers
                });
                const data = await res.json();
                console.log(data);
                setBoards(data.map(b => ({ ...b, posts: undefined })));
            } catch (err) {
                console.error("Error fetching boards:", err);
            }
        };
        fetchBoards();
    }, []);

    // Join board
    const joinBoard = async (board) => {
        try {
            const res = await fetch(`${API_BASE_URL}/boards/${board.id}/join/`, {
                method: "POST",
                headers: getAuthConfig().headers,
            });
            const data = await res.json();
            if (res.ok) {
                showAlert("success", "You joined the board!");
                setBoards(prev => prev.map(b =>
                    b.id === board.id
                        ? { ...b, is_member: true, member_count: (b.member_count || 0) + 1 }
                        : b
                ));
                setCurrentBoard(prev => prev && prev.id === board.id ? {
                    ...prev,
                    is_member: true
                } : prev);
            } else {
                showAlert("error", data.status || data.error || "Error joining board");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Leave board
    const leaveBoard = async (board) => {
        try {
            const res = await fetch(`${API_BASE_URL}/boards/${board.id}/leave/`, {
                method: "POST",
                headers: getAuthConfig().headers,
            });
            const data = await res.json();
            if (res.ok) {
                showAlert("success", "You left the board!");
                setBoards(prev => prev.map(b =>
                    b.id === board.id
                        ? { ...b, is_member: false, member_count: Math.max((b.member_count || 1) - 1, 0) }
                        : b
                ));
                setCurrentBoard(prev => prev && prev.id === board.id ? {
                    ...prev,
                    is_member: false,
                    posts: []
                } : prev);
                if (currentBoard?.id === board.id) setCurrentBoard(null);
            } else {
                showAlert("error", data.status || data.error || "Error leaving board");
            }
        } catch (err) {
            console.error(err);
        }
    };
    const enterBoard = async (board) => {
        try {
            const res = await fetch(`${API_BASE_URL}/boards/${board.id}/posts/`, {
                headers: getAuthConfig().headers,
            });

            const posts = res.ok ? await res.json() : [];
            console.log(posts);

            // is_member comes from the serializer (already set on board object)
            const isMember = board.is_member || false;

            setCurrentBoard({
                ...board,
                posts: posts,
                is_member: isMember
            });

            // keep boards array consistent
            setBoards(prevBoards =>
                prevBoards.map(b =>
                    b.id === board.id ? { ...b, posts: posts } : b
                )
            );

        } catch (err) {
            console.error(err);
        }
    };

    const addPost = async (board, content) => {
        try {
            const res = await fetch(`${API_BASE_URL}/boards/${board.id}/posts/`, {
                method: "POST",
                headers: getAuthConfig().headers,
                body: JSON.stringify({ content, }),
            });
            const data = await res.json();
            
            if (res.ok) {
                showAlert("success", "Post Successfully!");
                // Update only the current board
                setCurrentBoard(prev => ({
                    ...prev,
                    posts: [data, ...prev.posts]
                }));

                // Update boards array for consistency
                setBoards(prev => prev.map(b =>
                    b.id === board.id ? { ...b, posts: [data, ...(b.posts || [])] } : b
                ));
            } else {
                showAlert("error", data.error || "Error posting message");
            }
        } catch (err) {
            console.error(err);
        }
    };
    const createBoard = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/boards/`, {
                method: "POST",
                headers: getAuthConfig().headers,
                body: JSON.stringify({
                    name: newBoardName,
                    description: newBoardDesc
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setBoards(prev => [...prev, data]);
                setNewBoardName("");
                setNewBoardDesc("");
                showAlert("success", "Board created!");
            } else {
                showAlert("error", data.error || "Error creating board");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <Navbar user={user} onLogout={onLogout} />
            {alert.message && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert({ type: "", message: "" })}
                />
            )}

            <main className="app-page-shell board-page-shell">
            <div className="boards-layout app-board-layout">

                {/* ===== SIDEBAR ===== */}
                <div className="boards-sidebar app-board-sidebar">
                    <h3>
                        Boards
                        <button
                            className="add-board-btn"
                            onClick={() => setShowCreateBoard(true)}
                        >
                            +
                        </button>
                    </h3>

                    {boards
                        .filter(b => b.name !== "__SYSTEM_REVIEWS__")
                        .map(b => (
                            <div
                                key={b.id}
                                className={`sidebar-item ${currentBoard?.id === b.id ? "active" : ""}`}
                                onClick={() => enterBoard(b)}
                            >
                                <span>{b.name}</span>
                                <span className="member-badge">{b.member_count || 0}</span>
                            </div>
                    ))}
                    {showCreateBoard && (
                        <div className="modal-overlay" onClick={() => setShowCreateBoard(false)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Create Board</h3>
                                    <button
                                        className="close-btn"
                                        onClick={() => setShowCreateBoard(false)}
                                    >
                                        ✖
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <label htmlFor="board-name">Board Name</label>
                                    <input
                                        id="board-name"
                                        type="text"
                                        maxLength={50}
                                        placeholder="Enter board name"
                                        value={newBoardName}
                                        onChange={e => setNewBoardName(e.target.value)}
                                    />

                                    <label htmlFor="board-desc">Board Description</label>
                                    <input
                                        id="board-desc"
                                        type="text"
                                        maxLength={200}
                                        placeholder="Enter board description"
                                        value={newBoardDesc}
                                        onChange={e => setNewBoardDesc(e.target.value)}
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button onClick={createBoard}>Create</button>
                                    <button onClick={() => setShowCreateBoard(false)}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== MAIN CONTENT ===== */}
                <div className="boards-main app-board-main">
                    {currentBoard ? (
                        <>
                            <div className="board-header">
                                <h2>{currentBoard.name}</h2>

                                {currentBoard?.is_member ? (
                                    <button className="leave-btn" onClick={() => leaveBoard(currentBoard)}>
                                        Leave
                                    </button>
                                ) : (
                                    <button className="join-btn-animated" onClick={() => joinBoard(currentBoard)}>
                                        Join
                                    </button>
                                )}
                            </div>

                            <PostCard
                                board={currentBoard}
                                user={user}
                                addPost={(content) => addPost(currentBoard, content)}
                                posts={currentBoard?.posts || []} // pass posts as prop

                            />
                        </>
                    ) : (
                        <div className="dc-no-board">
                            <div className="dc-no-board-icon">#</div>
                            <h2 className="dc-no-board-title">Welcome to Boards</h2>
                            <p className="dc-no-board-sub">
                                Pick a board from the left to jump into a conversation — or create your own.
                            </p>
                            <div className="dc-no-board-tips">
                                <div className="dc-tip">
                                    <span className="dc-tip-icon">👋</span>
                                    <div>
                                        <strong>Join a board</strong>
                                        <p>Select any board on the left, then hit <em>Join</em> to become a member.</p>
                                    </div>
                                </div>
                                <div className="dc-tip">
                                    <span className="dc-tip-icon">✏️</span>
                                    <div>
                                        <strong>Start a conversation</strong>
                                        <p>Once you're a member, type a message at the bottom and press Enter.</p>
                                    </div>
                                </div>
                                <div className="dc-tip">
                                    <span className="dc-tip-icon">➕</span>
                                    <div>
                                        <strong>Create a board</strong>
                                        <p>Click the <em>+</em> next to "Boards" in the sidebar to start your own.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </main>
        </>
    );


}