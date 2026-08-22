import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthUser {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  role: "employee" | "hr" | "admin";
  profile_picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
  isHR: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("dayflow_auth");
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        // Verify token not expired
        const payload = JSON.parse(atob(token));
        if (payload.exp > Date.now()) {
          setUser(user);
          setToken(token);
        } else {
          localStorage.removeItem("dayflow_auth");
        }
      } catch {
        localStorage.removeItem("dayflow_auth");
      }
    }
  }, []);

  const login = (user: AuthUser, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("dayflow_auth", JSON.stringify({ user, token }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("dayflow_auth");
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    const stored = localStorage.getItem("dayflow_auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      localStorage.setItem("dayflow_auth", JSON.stringify({ ...parsed, user: updated }));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user,
      isHR: user?.role === "hr" || user?.role === "admin",
      isAdmin: user?.role === "admin",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
