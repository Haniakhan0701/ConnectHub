import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

/**
 * ConnectHub — shared left navigation rail.
 * Includes a profile dropdown (Edit Profile / Settings) like Instagram's
 * profile menu, plus the main nav links and a logout button.
 */
export default function Sidebar({ currentUser, onLogout }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const links = [
    { to: "/feed", label: "Home" },
    { to: "/notifications", label: "Notifications" },
    { to: "/saved", label: "Saved" },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="ch-rail">
      <div className="ch-brand">
        <span className="ch-mark-dot-solo" />
        ConnectHub
      </div>

      <nav className="ch-nav">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className={pathname === l.to ? "active" : ""}>
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="ch-rail-bottom">
        <div className="ch-profile-menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="ch-mini-profile ch-mini-profile-btn"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <div className="ch-avatar">{currentUser?.name?.[0] ?? "U"}</div>
            <div>
              <p className="ch-post-author">{currentUser?.name ?? "You"}</p>
              <p className="ch-post-sub">{currentUser?.handle ?? "@you"}</p>
            </div>
          </button>

          {menuOpen && (
            <div className="ch-profile-menu">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
              >
                Edit profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
              >
                Settings
              </button>
            </div>
          )}
        </div>

        <button className="ch-logout-btn" onClick={onLogout} type="button">
          Log out
        </button>
      </div>
    </aside>
  );
}
