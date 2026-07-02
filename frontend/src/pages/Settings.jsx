import { useState } from "react";
import Sidebar from "./Sidebar";
import "./Feed.css";
import "./Settings.css";

/**
 * ConnectHub — Settings Page
 * Account info, password change (wired to a real protected backend route),
 * a privacy toggle, and the blocked accounts list.
 * TODO: wire the privacy toggle to a real backend field on the User model.
 */

export default function Settings({ currentUser, onLogout, blockedUsers = [], onUnblockUser }) {
  const [privateAccount, setPrivateAccount] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  function resetPasswordForm() {
    setChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword !== confirmPassword) {
      setPwError("New password and confirmation don't match");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }

    const token = localStorage.getItem("ch_token");
    if (!token) {
      setPwError("You're not logged in — please sign in again");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Server returned an unexpected response");
      }

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setPwSuccess("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setChangingPassword(false);
        setPwSuccess("");
      }, 1500);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ch-feed-page">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />

      <main className="ch-feed">
        <h2 className="ch-settings-title">Settings</h2>

        <section className="ch-settings-card">
          <h3>Account</h3>
          <div className="ch-settings-row">
            <span>Name</span>
            <span className="ch-settings-value">{currentUser?.name ?? "You"}</span>
          </div>
          <div className="ch-settings-row">
            <span>Email</span>
            <span className="ch-settings-value">{currentUser?.email ?? "—"}</span>
          </div>

          {!changingPassword ? (
            <div className="ch-settings-row">
              <span>Password</span>
              <button className="ch-ghost-btn" onClick={() => setChangingPassword(true)} type="button">
                Change password
              </button>
            </div>
          ) : (
            <form className="ch-password-form" onSubmit={handleChangePassword}>
              <label className="ch-field">
                <span>Current password</span>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </label>
              <label className="ch-field">
                <span>New password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <label className="ch-field">
                <span>Confirm new password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>

              {pwError && <p className="ch-error">{pwError}</p>}
              {pwSuccess && <p className="ch-success">{pwSuccess}</p>}

              <div className="ch-bio-actions">
                <button type="submit" className="ch-submit" disabled={saving}>
                  {saving ? "Saving…" : "Save new password"}
                </button>
                <button type="button" className="ch-ghost-btn" onClick={resetPasswordForm}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="ch-settings-card">
          <h3>Privacy</h3>
          <div className="ch-settings-row">
            <span>Private account</span>
            <button
              className={`ch-toggle ${privateAccount ? "on" : ""}`}
              onClick={() => setPrivateAccount((p) => !p)}
              type="button"
              aria-pressed={privateAccount}
            >
              <span className="ch-toggle-knob" />
            </button>
          </div>
          <p className="ch-settings-hint">
            {privateAccount
              ? "Only people you approve can see your posts."
              : "Anyone on ConnectHub can see your posts."}
          </p>
        </section>

        <section className="ch-settings-card">
          <h3>Blocked accounts</h3>
          {blockedUsers.length === 0 ? (
            <p className="ch-empty-state">You haven't blocked anyone.</p>
          ) : (
            blockedUsers.map((u) => (
              <div className="ch-settings-row" key={u.handle}>
                <span>
                  <strong>{u.name}</strong> {u.handle}
                </span>
                <button className="ch-ghost-btn" onClick={() => onUnblockUser?.(u.handle)}>
                  Unblock
                </button>
              </div>
            ))
          )}
        </section>

        <button className="ch-logout-btn ch-logout-full" onClick={onLogout}>
          Log out
        </button>
      </main>

      <aside className="ch-side" />
    </div>
  );
}
