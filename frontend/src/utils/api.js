/**
 * Shared fetch helper — automatically attaches the saved JWT token and
 * handles JSON parsing / error messages consistently across the app.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("ch_token");

  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const rawText = await res.text();
  let data = {};
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error("Server returned an unexpected response");
    }
  }

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
