import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      const isDemo = localStorage.getItem("isDemo");

      // Demo mode - skip API call
      if (isDemo === "true" && savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      if (token && savedUser) {
        try {
          const response = await api.get("/auth/me");
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message:
          err.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isDemo");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Demo login - works without database!
  const demoLogin = () => {
    const demoUser = {
      id: "demo-user",
      username: "demo_user",
      email: "demo@example.com",
      fullName: "Demo User",
      role: "user",
    };
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("user", JSON.stringify(demoUser));
    localStorage.setItem("isDemo", "true");
    setUser(demoUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
