import { useState, useRef } from "react";
import Sidebar from "./Sidebar";
import "./Feed.css";
import "./Profile.css";

/**
 * ConnectHub — Profile Page
 * TODO: replace MOCK_OWN_POSTS with a real fetch to GET /api/posts/user/:id.
 * TODO: the avatar upload here is client-side only (stored in memory as a
 * data URL) — wire it to an actual upload endpoint (e.g. Cloudinary/S3 via
 * multer on your Express server) to persist it across sessions.
 */

const MOCK_OWN_POSTS = [
  {
    id: "op1",
    time: "3h",
    text: "Refactored the auth flow tonight — JWT expiry now actually gets checked instead of trusted blindly. Small win, big relief.",
    likes: 18,
  },
  {
    id: "op2",
    time: "2d",
    text: "First working version of the feed is live. Comments and likes both persist now.",
    likes: 42,
  },
];

export default function Profile({ currentUser = { name: "You", handle: "@you" }, onLogout }) {
  const [tab, setTab] = useState("posts"); // "posts" | "likes"
  const [bio, setBio] = useState("Building ConnectHub — one bug at a time.");
  const [editing, setEditing] = useState(false);
  const [draftBio, setDraftBio] = useState(bio);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);

  function saveBio() {
    setBio(draftBio.trim() || bio);
    setEditing(false);
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="ch-feed-page">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />

      <main className="ch-feed">
        <section className="ch-profile-header">
          <div className="ch-profile-avatar-wrap">
            <button
              type="button"
              className="ch-profile-avatar"
              style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
              onClick={() => fileInputRef.current?.click()}
              title="Change profile picture"
            >
              {!avatarUrl && currentUser.name[0]}
              <span className="ch-avatar-edit-overlay">Edit</span>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              hidden
            />
          </div>

          <div className="ch-profile-info">
            <h2>{currentUser.name}</h2>
            <p className="ch-post-sub">{currentUser.handle}</p>

            {editing ? (
              <div className="ch-bio-edit">
                <textarea
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  rows={2}
                />
                <div className="ch-bio-actions">
                  <button className="ch-submit" onClick={saveBio}>Save</button>
                  <button
                    className="ch-ghost-btn"
                    onClick={() => {
                      setDraftBio(bio);
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="ch-bio">
                {bio}{" "}
                <button className="ch-edit-link" onClick={() => setEditing(true)}>
                  Edit bio
                </button>
              </p>
            )}

            <div className="ch-profile-stats">
              <div>
                <strong>{MOCK_OWN_POSTS.length}</strong> Posts
              </div>
              <div>
                <strong>128</strong> Followers
              </div>
              <div>
                <strong>96</strong> Following
              </div>
            </div>
          </div>
        </section>

        <div className="ch-profile-tabs">
          <button className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>
            Posts
          </button>
          <button className={tab === "likes" ? "active" : ""} onClick={() => setTab("likes")}>
            Likes
          </button>
        </div>

        {tab === "posts" ? (
          MOCK_OWN_POSTS.map((p) => (
            <article className="ch-post" key={p.id}>
              <header className="ch-post-head">
                <div
                  className="ch-avatar"
                  style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, color: "transparent" } : undefined}
                >
                  {!avatarUrl && currentUser.name[0]}
                </div>
                <div className="ch-post-meta">
                  <p className="ch-post-author">{currentUser.name}</p>
                  <p className="ch-post-sub">
                    {currentUser.handle} · {p.time}
                  </p>
                </div>
              </header>
              <p className="ch-post-text">{p.text}</p>
              <footer className="ch-post-actions">
                <span className="ch-action">♥ {p.likes}</span>
              </footer>
            </article>
          ))
        ) : (
          <p className="ch-empty-state">Posts you like will show up here.</p>
        )}
      </main>

      <aside className="ch-side" />
    </div>
  );
}
