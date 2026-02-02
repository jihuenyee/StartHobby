// src/api.js

// For Vercel deployment, use relative /api path
// For local development, use localhost:5000
// For Railway fallback, use the Railway URL
const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
const isVercelDeployment = typeof window !== "undefined" && 
  (window.location.hostname.includes("vercel.app") || window.location.hostname.includes("start-hobby"));

let API_BASE_URL;

if (isDevelopment) {
  API_BASE_URL = "http://localhost:5000/api";
} else if (isVercelDeployment || process.env.REACT_APP_API_URL) {
  // Use relative path for Vercel or if explicitly set
  API_BASE_URL = process.env.REACT_APP_API_URL || "/api";
} else {
  // Fallback to Railway
  API_BASE_URL = "https://starthobbybackend-production.up.railway.app/api";
}

export { API_BASE_URL };

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
