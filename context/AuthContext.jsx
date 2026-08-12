"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchMe = async () => {
    try {
      const data = await api.get("/auth/me");
      setUser(data.user);
      setIsDemo(false);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password, remember) => {
    const data = await api.post("/auth/login", { email, password, remember });
    setUser(data.user);
    setIsDemo(false);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    setUser(null);
    setIsDemo(false);
  };

  const enterDemo = () => {
    setIsDemo(true);
  };

  const exitDemo = () => setIsDemo(false);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, isDemo, login, logout, enterDemo, exitDemo, refresh: fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
