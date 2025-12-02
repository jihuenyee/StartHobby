// src/api.js
const API_BASE_URL = "https://start-hobby-master.vercel.app/api";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = "Request failed";
    try {
      const errData = await res.json();
      message = errData.message || message;
    } catch (e) {}
    throw new Error(message);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export { API_BASE_URL };
