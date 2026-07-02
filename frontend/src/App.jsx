import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Saved from "./pages/Saved";
import Settings from "./pages/Settings";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  // TODO: persist blocked users to your backend instead of keeping them
  // only in memory here.
  const [blockedUsers, setBlockedUsers] = useState([]);

  // On first load (including every page refresh), check if a token was
  // saved from a previous login. If so, ask the backend who it belongs to
  // and restore the session instead of bouncing back to the login page.
  useEffect(() => {
    const token = localStorage.getItem("ch_token");
    if (!token) {
      setCheckingSession(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Session expired");
        const data = await res.json();
        setUser(data.user);
      })
      .catch(() => {
        // Token is invalid or expired — clear it and let the user log in again
        localStorage.removeItem("ch_token");
        setUser(null);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  function handleAuthSuccess(userData) {
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem("ch_token");
    setUser(null);
  }

  function blockUser(userToBlock) {
    setBlockedUsers((list) =>
      list.some((u) => u.handle === userToBlock.handle) ? list : [...list, userToBlock]
    );
  }

  function unblockUser(handle) {
    setBlockedUsers((list) => list.filter((u) => u.handle !== handle));
  }

  // While we're checking localStorage + verifying the token with the
  // backend, show a brief loading state instead of flashing the login page.
  if (checkingSession) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif", color: "#6b675c" }}>
        Loading ConnectHub…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/feed" /> : <AuthPage onAuthSuccess={handleAuthSuccess} />
          }
        />
        <Route
          path="/feed"
          element={
            user ? (
              <Feed
                currentUser={user}
                onLogout={handleLogout}
                blockedUsers={blockedUsers}
                onBlockUser={blockUser}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            user ? <Profile currentUser={user} onLogout={handleLogout} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/notifications"
          element={
            user ? (
              <Notifications currentUser={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/saved"
          element={
            user ? <Saved currentUser={user} onLogout={handleLogout} /> : <Navigate to="/" />
          }
        />
        <Route
          path="/settings"
          element={
            user ? (
              <Settings
                currentUser={user}
                onLogout={handleLogout}
                blockedUsers={blockedUsers}
                onUnblockUser={unblockUser}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
