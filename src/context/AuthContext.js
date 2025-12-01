// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const API_BASE_URL = "https://backend-ftis.vercel.app/api";

// Generic helper for calling your backend
async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token");

  console.log("[API] Request:", {
    url: `${API_BASE_URL}${path}`,
    options,
  });

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    console.warn("[API] No JSON body in response");
  }

  console.log("[API] Response:", res.status, data);

  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // restore user on page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // LOGIN
  const login = async (email, password) => {
    // Your backend login is /auth/Login and returns:
    // { success: true, user_id, username, email }
    const data = await apiRequest("/auth/Login", {
      method: "POST",
      body: { email, password },
    });

    console.log("[Auth] Login response:", data);

    const userData = {
      user_id: data.user_id,
      username: data.username,
      email: data.email,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // SIGNUP
  const signup = async (username, email, password) => {
    // match backend route: POST /api/auth/signup
    const data = await apiRequest("/auth/signup", {
      method: "POST",
      body: { username, email, password },
    });

    console.log("[Auth] Signup response:", data);

    const userData = {
      user_id: data.user_id,
      username: data.username,
      email: data.email,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // UPDATE PROFILE (username + email)
  const updateProfile = async ({ username, email }) => {
    const stored = localStorage.getItem("user");
    const currentUser = stored ? JSON.parse(stored) : null;

    if (!currentUser) {
      throw new Error("No logged in user");
    }

    const userId = currentUser.user_id;

    const data = await apiRequest(`/users/${userId}`, {
      method: "PUT",
      body: { username, email },
    });

    console.log("[Auth] Update profile response:", data);

    // merge updated values
    const newUser = {
      ...currentUser,
      username: data.username ?? username,
      email: data.email ?? email,
    };

    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);

    return data;
  };


  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,         // 👈 NOW it exists in the context
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
