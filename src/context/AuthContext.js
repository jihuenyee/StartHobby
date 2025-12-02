import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

const API_BASE_URL = "https://start-hobby-master.vercel.app/api";

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
    const message = data?.error || data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Check for backend user first
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        // Option A: User logged in via Email/Password (Backend)
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      } else if (firebaseUser) {
        // Option B: User logged in via Google (Firebase) 
        setUser({
          user_id: firebaseUser.uid,
          username: firebaseUser.displayName,
          email: firebaseUser.email,
          isGoogle: true,
        });
      } else {
        // Option C: Not logged in
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
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

  const signup = async (username, email, password) => {
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

  const updateProfile = async ({ username, email }) => {
    // We use the state 'user' here to support both Google and Backend users
    const currentUser = user;

    if (!currentUser) {
      throw new Error("No logged in user");
    }

    const userId = currentUser.user_id;

    const data = await apiRequest(`/users/${userId}`, {
      method: "PUT",
      body: { username, email },
    });

    console.log("[Auth] Update profile response:", data);

    const newUser = {
      ...currentUser,
      username: data.username ?? username,
      email: data.email ?? email,
    };

    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);

    return data;
  };

  // 🔐 CHANGE PASSWORD (backend email/password users only)
  const changePassword = async (currentPassword, newPassword) => {
    if (!user) {
      throw new Error("No logged in user.");
    }

    // If this is a Google login user, we don't handle password here
    if (user.isGoogle) {
      throw new Error("You signed in with Google. Please manage your password via your Google Account.");
    }

    const data = await apiRequest("/auth/change-password", {
      method: "POST",
      body: {
        email: user.email,
        currentPassword,
        newPassword,
      },
    });

    console.log("[Auth] Change password response:", data);
    return data;
  };

  const logout = () => {
    auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,        // 👈 expose here
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
