// src/api.js
const API_BASE_URL = "https://backend-c8sn.vercel.app";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    // default method = GET if not provided
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // handle non-200 errors
  if (!res.ok) {
    let message = "Request failed";
    try {
      const errData = await res.json();
      message = errData.message || message;
    } catch (e) {}
    throw new Error(message);
  }

  // if there is no JSON (e.g. 204), just return null
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export { API_BASE_URL };
