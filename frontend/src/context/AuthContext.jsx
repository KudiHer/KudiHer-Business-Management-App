import { createContext, useContext, useState, useCallback } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  userStorage,
  tokenStorage,
} from "../services/api";

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Rehydrate from localStorage so the session survives a page refresh
  const [user,  setUser]  = useState(() => userStorage.get());
  const [token, setToken] = useState(() => tokenStorage.get());

  const handleAuthSuccess = (data) => {
    setUser(data.user);
    setToken(data.token);
  };

  const login = useCallback(async (credentials) => {
    const data = await apiLogin(credentials);
    handleAuthSuccess(data);
    return data;
  }, []);

  const register = useCallback(async (credentials) => {
    const data = await apiRegister(credentials);
    handleAuthSuccess(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setToken(null);
  }, []);

  const isAuthenticated = !!(user && token);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
