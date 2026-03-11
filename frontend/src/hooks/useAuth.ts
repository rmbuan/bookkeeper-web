import { useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

const API = "/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`${API}/auth/me`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Login failed");
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    setUser(null);
  };

  return { user, loading, login, logout, refreshUser: fetchUser };
}
