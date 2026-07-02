import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import { apiFetch } from "../utils/api";
import "./Feed.css";

/**
 * ConnectHub — Feed Page
 * Posts, likes, comments, and follows are now real — backed by MongoDB via
 * /api/posts and /api/users routes. The old fake seed data and the "new
 * post every 7 seconds" simulation have been removed since the feed now
 * reflects real database state.
 */

const EMOJIS = ["😀","😂","😍","🔥","🎉","👏","🙌","💡","🚀","❤️","😎","🤔","👍","💬","✨","😢","😮","🙏"];

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function EmojiPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="ch-emoji-wrap" ref={ref}>
      <button type="button" className="ch-emoji-btn" onClick={() => setOpen((o) => !o)}>
        😊
      </button>
      {open && (
        <div className="ch-emoji-panel">
          {EMOJIS.map((e) => (
            <button
              type="button"
              key={e}
              onClick={() => {
                onSelect(e);
                setOpen(false);
              }}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PostMenu({ onBlock, handle, isOwnPost, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="ch-post-menu-wrap" ref={ref}>
      <button type="button" className="ch-post-menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Post options">
        ⋯
      </button>
      {open && (
        <div className="ch-post-menu">
          {isOwnPost ? (
            <button type="button" onClick={() => { onDelete(); setOpen(false); }}>
              Delete post
            </button>
          ) : (
            <button type="button" onClick={() => { onBlock(); setOpen(false); }}>
              Block {handle}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, currentUser, onToggleLike, onToggleFollow, onAddComment, onBlock, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const isOwnPost = post.handle === currentUser.handle;

  function submitComment(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    onAddComment(post.id, draft.trim());
    setDraft("");
  }

  return (
    <article className="ch-post">
      <header className="ch-post-head">
        <div className="ch-avatar" aria-hidden="true">
          {post.author.split(" ").map((n) => n[0]).join("")}
        </div>
        <div className="ch-post-meta">
          <p className="ch-post-author">{post.author}</p>
          <p className="ch-post-sub">
            {post.handle} · {timeAgo(post.createdAt)}
          </p>
        </div>
        {!isOwnPost && (
          <button
            className={`ch-follow-btn ${post.following ? "following" : ""}`}
            onClick={() => onToggleFollow(post.authorId)}
          >
            {post.following ? "Following" : "Follow"}
          </button>
        )}
        <PostMenu
          handle={post.handle}
          isOwnPost={isOwnPost}
          onBlock={() => onBlock(post)}
          onDelete={() => onDelete(post.id)}
        />
      </header>

      <p className="ch-post-text">{post.text}</p>

      <footer className="ch-post-actions">
        <button
          className={`ch-action ${post.liked ? "liked" : ""}`}
          onClick={() => onToggleLike(post.id)}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={post.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
            <path d="M12 21s-6.7-4.3-9.3-8.4C.8 9.2 2 5.4 5.6 4.4c2-.6 4 .2 5.1 1.9C11.7 8 12 8 12 8s.3 0 1.3-1.7c1.1-1.7 3.1-2.5 5.1-1.9 3.6 1 4.8 4.8 2.9 8.2C18.7 16.7 12 21 12 21z"/>
          </svg>
          {post.likes}
        </button>
        <button className="ch-action" onClick={() => setShowComments((s) => !s)}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          {post.comments.length}
        </button>
        <button className="ch-action">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14"/>
          </svg>
          Share
        </button>
      </footer>

      {showComments && (
        <div className="ch-comments">
          {post.comments.map((c) => (
            <div className="ch-comment" key={c.id}>
              <span className="ch-comment-author">{c.author}</span>
              <span>{c.text}</span>
            </div>
          ))}
          <form onSubmit={submitComment} className="ch-comment-form">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment…"
            />
            <EmojiPicker onSelect={(e) => setDraft((d) => d + e)} />
            <button type="submit">Post</button>
          </form>
        </div>
      )}
    </article>
  );
}

const RONIN_SUGGESTIONS = [
  "Draft a caption for your last screenshot",
  "Who should I follow based on my activity?",
  "Summarize my recent comments",
];

function RoninAgent() {
  const [messages, setMessages] = useState([
    { from: "ronin", text: "I'm Ronin, your ConnectHub agent. Ask me to draft a post, find people to follow, or summarize a thread." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  async function ask(text) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("/api/agent/ronin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { from: "ronin", text: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "ronin", text: "Backend not connected yet — wire /api/agent/ronin to enable live replies." },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="ch-ronin">
      <div className="ch-ronin-head">
        <span className="ch-ronin-mark">柔</span>
        <div>
          <p className="ch-ronin-title">Ronin</p>
          <p className="ch-ronin-sub">AI agent · always on call</p>
        </div>
      </div>

      <div className="ch-ronin-thread">
        {messages.map((m, i) => (
          <p key={i} className={`ch-ronin-msg ${m.from}`}>
            {m.text}
          </p>
        ))}
        {thinking && <p className="ch-ronin-msg ronin ch-thinking">thinking…</p>}
      </div>

      <div className="ch-ronin-suggestions">
        {RONIN_SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>

      <form
        className="ch-ronin-input"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Ronin anything…"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default function Feed({ currentUser, onLogout, blockedUsers = [], onBlockUser }) {
  const [posts, setPosts] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/posts");
      setPosts(data.posts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const visiblePosts = posts.filter(
    (p) => !blockedUsers.some((b) => b.handle === p.handle)
  );

  async function publish(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    const text = draft.trim();
    setDraft("");
    try {
      const data = await apiFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setPosts((ps) => [data.post, ...ps]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleLike(id) {
    // Optimistic update — flip it instantly, reconcile with server after
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
      )
    );
    try {
      const data = await apiFetch(`/api/posts/${id}/like`, { method: "POST" });
      setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, likes: data.likes, liked: data.liked } : p)));
    } catch (err) {
      setError(err.message);
      loadPosts(); // reconcile from server if the optimistic update was wrong
    }
  }

  async function toggleFollow(authorId) {
    try {
      const data = await apiFetch(`/api/users/${authorId}/follow`, { method: "POST" });
      setPosts((ps) => ps.map((p) => (p.authorId === authorId ? { ...p, following: data.following } : p)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function addComment(id, text) {
    try {
      const data = await apiFetch(`/api/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setPosts((ps) =>
        ps.map((p) => (p.id === id ? { ...p, comments: [...p.comments, data.comment] } : p))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function deletePost(id) {
    try {
      await apiFetch(`/api/posts/${id}`, { method: "DELETE" });
      setPosts((ps) => ps.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function blockPostAuthor(post) {
    onBlockUser?.({ name: post.author, handle: post.handle });
  }

  return (
    <div className="ch-feed-page">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />

      <main className="ch-feed">
        <form className="ch-composer" onSubmit={publish}>
          <div className="ch-avatar">{currentUser.name[0]}</div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What's connecting today?"
            rows={2}
          />
          <EmojiPicker onSelect={(e) => setDraft((d) => d + e)} />
          <button type="submit" disabled={!draft.trim()}>
            Post
          </button>
        </form>

        {error && <p className="ch-error">{error}</p>}

        {loading ? (
          <p className="ch-empty-state">Loading posts…</p>
        ) : visiblePosts.length === 0 ? (
          <p className="ch-empty-state">
            No posts yet — be the first to share something.
          </p>
        ) : (
          visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onToggleLike={toggleLike}
              onToggleFollow={toggleFollow}
              onAddComment={addComment}
              onBlock={blockPostAuthor}
              onDelete={deletePost}
            />
          ))
        )}
      </main>

      <aside className="ch-side">
        <RoninAgent />
      </aside>
    </div>
  );
}
