import { useState } from "react";
import Sidebar from "./Sidebar";
import "./Feed.css";
import "./Notifications.css";

/**
 * ConnectHub — Notifications Page
 * TODO: replace MOCK_NOTIFICATIONS with a real fetch to
 * GET /api/notifications once your backend emits events for
 * likes, comments, and follows.
 */

const ICONS = {
  like: "♥",
  comment: "💬",
  follow: "＋",
};

const MOCK_NOTIFICATIONS = [
  { id: "n1", type: "like", actor: "Marcus Webb", detail: "liked your post", time: "12m", read: false },
  { id: "n2", type: "follow", actor: "Priya Nair", detail: "started following you", time: "1h", read: false },
  { id: "n3", type: "comment", actor: "Aiko Tanaka", detail: "commented: \"The mutual-weight idea is clever\"", time: "3h", read: true },
  { id: "n4", type: "like", actor: "Sana Iqbal", detail: "liked your post", time: "1d", read: true },
];

export default function Notifications({ currentUser, onLogout }) {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);

  function markAllRead() {
    setItems((its) => its.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="ch-feed-page">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />

      <main className="ch-feed">
        <div className="ch-notif-head">
          <h2>Notifications</h2>
          <button className="ch-ghost-btn" onClick={markAllRead}>
            Mark all as read
          </button>
        </div>

        {items.length === 0 ? (
          <p className="ch-empty-state">You're all caught up.</p>
        ) : (
          items.map((n) => (
            <div key={n.id} className={`ch-notif ${n.read ? "" : "unread"}`}>
              <span className={`ch-notif-icon ${n.type}`}>{ICONS[n.type]}</span>
              <p>
                <strong>{n.actor}</strong> {n.detail}
              </p>
              <span className="ch-post-sub">{n.time}</span>
            </div>
          ))
        )}
      </main>

      <aside className="ch-side" />
    </div>
  );
}
