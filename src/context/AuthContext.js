import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { apiRequest } from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const userData = {
      ...data,
      type_id: data.type_id || "normal", 
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const signup = async (username, email, password) => {
    const data = await apiRequest("/auth/signup", {
      method: "POST",
      body: { username, email, password },
    });
    const userData = {
      ...data,
      type_id: data.type_id || "normal",
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const updateProfile = async (updates) => {
    const data = await apiRequest(`/users/${user.user_id}`, {
      method: "PUT",
      body: updates,
    });
    const updatedUser = { ...user, ...data.user };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const changePassword = async (currentPassword, newPassword) => {
    await apiRequest("/auth/change-password", {
      method: "POST",
      body: { user_id: user.user_id, currentPassword, newPassword },
    });
  };

  const logout = () => {
    auth.signOut();
    localStorage.removeItem("user");
    setUser(null);
  };

  // Resilient check for "admin"
  const isAdmin = !!user && String(user.type_id).trim().toLowerCase() === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, updateProfile, changePassword, logout, isAdmin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);