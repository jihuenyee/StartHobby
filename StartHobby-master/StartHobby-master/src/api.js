// src/api.js

const PROD_URL = "https://starthobbybackend-production.up.railway.app/api";
const LOCAL_URL = "http://localhost:5000/api";

// Auto-detect environment
export const API_BASE_URL =
  process.env.NODE_ENV === "development" ? LOCAL_URL : PROD_URL;

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  console.log("📡 [API REQUEST]", `${API_BASE_URL}${path}`, options);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Handle non-success HTTP status
  if (!response.ok) {
    let message = `Error: ${response.status}`;

    try {
      const errorData = await response.json();
      message = errorData?.error || errorData?.message || message;
    } catch (e) {
      console.warn("⚠️ API returned non-JSON error body");
    }

    console.error("❌ [API ERROR]", message);
    throw new Error(message);
  }

  // Handle successful response
  try {
    const data = await response.json();
    console.log("✅ [API RESPONSE]", data);
    return data;
  } catch (e) {
    console.warn("ℹ️ API returned empty response body");
    return null;
  }
}
