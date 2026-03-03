

import { createContext, useContext, useState } from "react";
import { userStorage, tokenStorage, logoutRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  
  const [user, setUserState] = useState(() => userStorage.get());

 
  const setUser = (userObj) => {
    userStorage.set(userObj);
    setUserState(userObj);
  };

 
  const clearUser = () => {
    logoutRequest();          
    setUserState(null);
  };

  
  const logout = () => {
    clearUser();
  };

 
  const login = (userObj) => setUser(userObj);

  return (
    <AuthContext.Provider value={{ user, login, setUser, logout, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
