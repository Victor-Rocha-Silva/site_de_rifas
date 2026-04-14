import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  async function fetchMe() {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  async function login(loginValue, password) {
    const response = await api.post("/auth/login", {
      login: loginValue,
      password,
    });

    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);

    return response.data;
  }

  async function registerCustomer(payload) {
    const response = await api.post("/auth/register/customer", payload);

    localStorage.setItem("token", response.data.token);
    setUser(response.data.user);

    return response.data;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      registerCustomer,
      logout,
      refreshUser: fetchMe,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}