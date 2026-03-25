"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthResponse, Role } from "@/types";

interface AuthUser {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  initialized: boolean;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("auth_user");
      }
    }
    setInitialized(true);
  }, []);

  const login = (data: AuthResponse) => {
    const authUser: AuthUser = {
      token: data.token,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    };
    localStorage.setItem("token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(authUser));
    document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_user");
    document.cookie = "token=; path=/; max-age=0";
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, initialized, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
