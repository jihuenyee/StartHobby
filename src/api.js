// src/api.js
<<<<<<< HEAD
const API_BASE_URL = "https://backend-c8sn.vercel.app";
=======
const API_BASE_URL = "https://start-hobby-master.vercel.app/api";
>>>>>>> 4c005d743bab26eb59270e5ddb58b3218c9610ae

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${path}`, {
<<<<<<< HEAD
    // default method = GET if not provided
=======
>>>>>>> 4c005d743bab26eb59270e5ddb58b3218c9610ae
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

<<<<<<< HEAD
  // handle non-200 errors
=======
>>>>>>> 4c005d743bab26eb59270e5ddb58b3218c9610ae
  if (!res.ok) {
    let message = "Request failed";
    try {
      const errData = await res.json();
      message = errData.message || message;
    } catch (e) {}
    throw new Error(message);
  }

<<<<<<< HEAD
  // if there is no JSON (e.g. 204), just return null
=======
>>>>>>> 4c005d743bab26eb59270e5ddb58b3218c9610ae
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export { API_BASE_URL };
