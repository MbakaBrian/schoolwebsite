import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { username, role }
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setAccessToken(parsed.access);
      setRefreshToken(parsed.refresh);
      setUser({ username: parsed.username, role: parsed.role });
    }
    setLoading(false);
  }, []);

  // ✅ Login
  const login = async (username, password) => {
    try {
      const res = await axiosInstance.post("token/", { username, password });
      const data = res.data;

      if (data.access) {
        const authData = {
          access: data.access,
          refresh: data.refresh,
          role: data.role,
          username: data.username,
        };

        localStorage.setItem("authData", JSON.stringify(authData));
        setAccessToken(data.access);
        setRefreshToken(data.refresh);
        setUser({ username: data.username, role: data.role });
      }

      return data;
    } catch (err) {
      console.error("Login failed:", err);
      return {};
    }
  };

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem("authData");
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  // ✅ Refresh Access Token Automatically
  const refreshAccessToken = async () => {
    if (!refreshToken) return;
    try {
      const res = await axiosInstance.post("token/refresh/", {
        refresh: refreshToken,
      });
      const data = res.data;

      if (data.access) {
        setAccessToken(data.access);
        const updated = {
          access: data.access,
          refresh: refreshToken,
          username: user?.username,
          role: user?.role,
        };
        localStorage.setItem("authData", JSON.stringify(updated));
      } else {
        logout();
      }
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
    }
  };

  // ✅ Automatically refresh every 3 minutes
  useEffect(() => {
    if (refreshToken) {
      const interval = setInterval(refreshAccessToken, 3 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshToken]);

  // ✅ Helper to attach auth headers
  const getAuthHeaders = () => {
    const stored = localStorage.getItem("authData");
    const token = stored ? JSON.parse(stored).access : accessToken;
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };
  };

  // ✅ Wait until auth data restored
  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, getAuthHeaders }}
    >
      {children}
    </AuthContext.Provider>
  );
};
