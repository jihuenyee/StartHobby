// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { apiRequest } from "../api";   // 👈 reuse shared API helper

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ====== INITIAL LOAD: check backend user or Firebase Google user ======
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        // Backend email/password user
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
          setUser(null);
        }
      } else if (firebaseUser) {
        // Google user (Firebase)
        setUser({
          user_id: firebaseUser.uid,
          username: firebaseUser.displayName,
          email: firebaseUser.email,
          isGoogle: true,
          // Google user has no type_id from DB, treat as normal on UI
          type_id: "normal",
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ====== LOGIN (Backend email/password) ======
  const login = async (email, password) => {
    const data = await apiRequest("/auth/Login", {
      method: "POST",
      body: { email, password },
    });

    console.log("[Auth] Login response:", data);

    const userData = {
      user_id: data.user_id,
      username: data.username ?? data.email ?? email,
      email: data.email ?? email,
      type_id: data.type_id ?? "normal", // 👈 important for admin / user
    };

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // ====== SIGNUP (Backend email/password) ======
  const signup = async (username, email, password) => {
    const data = await apiRequest("/auth/signup", {
      method: "POST",
      body: { username, email, password },
    });

    console.log("[Auth] Signup response:", data);

    const userData = {
      user_id: data.user_id,
      username: data.username ?? username,
      email: data.email ?? email,
      type_id: data.type_id ?? "normal",
    };

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // ====== UPDATE PROFILE (name + email) ======
  const updateProfile = async ({ username, email }) => {
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

  // ====== CHANGE PASSWORD (backend users only) ======
  const changePassword = async (currentPassword, newPassword) => {
    if (!user) {
      throw new Error("No logged in user.");
    }

    if (user.isGoogle) {
      throw new Error(
        "You signed in with Google. Please manage your password via your Google Account."
      );
    }

  const data = await apiRequest(`/users/${user.user_id}`, {
    method: "PUT",
    body: {
      password: newPassword, // only send the new password
    },
  });

    console.log("[Auth] Change password response:", data);
    return data;
  };

  // ====== LOGOUT ======
  const logout = () => {
    auth.signOut();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // ====== ROLE HELPERS ======
  const isAuthenticated = !!user;
  const isAdmin = !!user && user.type_id === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated,
        isAdmin,           // 👈 used in Navbar
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
