import { useState } from "react";
import Sidebar from "./Sidebar";
import "./Feed.css";

/**
 * ConnectHub — Saved Page
 * TODO: replace MOCK_SAVED with a real fetch to GET /api/posts/saved
 * once you add a "save" action alongside like/comment in your Post model.
 */

const MOCK_SAVED = [
  {
    id: "s1",
    author: "Priya Nair",
    handle: "@priyabuilds",
    time: "1d",
    text: "Three months into building ConnectHub's internal tools. The follow/unfollow edge cases taught me more about databases than any course did.",
  },
  {
    id: "s2",
    author: "Marcus Webb",
    handle: "@marcusw",
    time: "5h",
    text: "Hot take: a comment section is a second draft of the post. Read both before you judge the idea.",
  },
];

export default function Saved({ currentUser, onLogout }) {
  const [saved, setSaved] = useState(MOCK_SAVED);

  function unsave(id) {
    setSaved((s) => s.filter((p) => p.id !== id));
  }

  return (
    <div className="ch-feed-page">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />

      <main className="ch-feed">
        <h2 style={{ margin: 0, fontFamily: "var(--display, 'Sora', sans-serif)", fontSize: "1.2rem" }}>
          Saved
        </h2>

        {saved.length === 0 ? (
          <p className="ch-empty-state">Nothing saved yet — tap a post's share menu to save it here.</p>
        ) : (
          saved.map((post) => (
            <article className="ch-post" key={post.id}>
              <header className="ch-post-head">
                <div className="ch-avatar">
                  {post.author.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="ch-post-meta">
                  <p className="ch-post-author">{post.author}</p>
                  <p className="ch-post-sub">
                    {post.handle} · {post.time}
                  </p>
                </div>
                <button className="ch-follow-btn following" onClick={() => unsave(post.id)}>
                  Unsave
                </button>
              </header>
              <p className="ch-post-text">{post.text}</p>
            </article>
          ))
        )}
      </main>

      <aside className="ch-side" />
    </div>
  );
}
