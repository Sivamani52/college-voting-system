import { createContext, useState } from "react";
import api from "../services/api";
import { useAuth } from "./useAuth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("user");
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        identifier,
        password,
      });

      const data = response.data;

      // Handle required password change
      if (data.requiresPasswordChange) {
        return data;
      }

      const token = data.accessToken || data.token;
      const loggedInUser = data.user;

      if (!token) {
        throw new Error("JWT token was not returned by the server.");
      }

      localStorage.setItem("accessToken", token);

      if (loggedInUser) {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth };