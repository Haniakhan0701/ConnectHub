import { useState, useRef, useEffect } from "react";
import "./AuthPage.css";

/**
 * ConnectHub — Auth Page
 * Visual identity: "Ink & Signal"
 * Dark ink hero with a live node-network canvas (the connections a social
 * graph is built from), paired with a warm paper-toned form card stamped
 * with a hanko-style seal — ConnectHub's mark. Talks to your Express
 * /api/auth routes via the Vite dev proxy (see vite.config.js).
 */

function NetworkCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let w, h;
    const NODES = 42;
    const nodes = [];

    function resize() {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < NODES; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      });
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          const max = 170 * devicePixelRatio;
          if (d < max) {
            ctx.strokeStyle = `rgba(196, 78, 63, ${0.16 * (1 - d / max)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = "rgba(245, 241, 232, 0.55)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="ch-network-canvas" aria-hidden="true" />;
}

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Relative paths — the Vite dev proxy (vite.config.js) forwards
      // anything starting with /api to http://localhost:5000
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // Safely read the response as text first
      const rawText = await res.text();

      if (!rawText) {
        throw new Error(
          "Server returned an empty response. Make sure your backend is running on port 5000."
        );
      }

      // Check if the server returned HTML (usually means a 404 / wrong route)
      if (rawText.trim().startsWith("<!DOCTYPE") || rawText.trim().startsWith("<html")) {
        throw new Error(
          `Server returned HTML instead of JSON. The route ${endpoint} might not exist on the backend.`
        );
      }

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Server returned invalid JSON. Raw response: ${rawText.substring(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Success
      localStorage.setItem("ch_token", data.token);
      onAuthSuccess?.(data.user);
    } catch (err) {
      setError(err.message);
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ch-auth-page">
      <div className="ch-auth-hero">
        <NetworkCanvas />
        <div className="ch-hero-content">
          <div className="ch-mark">
            <span className="ch-mark-ring" />
            <span className="ch-mark-dot" />
          </div>
          <p className="ch-eyebrow">connecthub</p>
          <h1>
            Every connection
            <br />
            is a line worth
            <br />
            <em>drawing.</em>
          </h1>
          <p className="ch-hero-sub">
            Profiles, posts, and the people who follow them —
            mapped in real time, not buried in a feed.
          </p>
        </div>
      </div>

      <div className="ch-auth-panel">
        <div className="ch-card">
          <div className="ch-seal">連</div>
          <div className="ch-tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
              type="button"
            >
              Sign in
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
              type="button"
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleAuth} className="ch-form">
            {mode === "register" && (
              <label className="ch-field">
                <span>Full name</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Aiko Tanaka"
                />
              </label>
            )}
            <label className="ch-field">
              <span>Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
              />
            </label>
            <label className="ch-field">
              <span>Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={update("password")}
                placeholder="••••••••"
              />
            </label>

            {error && <p className="ch-error">{error}</p>}

            <button type="submit" className="ch-submit" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Join ConnectHub"}
            </button>
          </form>

          <p className="ch-switch">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Create an account" : "Sign in instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
