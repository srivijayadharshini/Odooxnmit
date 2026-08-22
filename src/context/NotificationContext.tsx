import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";

interface NotificationContextType {
  unreadCount: number;
  refresh: () => Promise<void>;
  decrement: (by?: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refresh: async () => {},
  decrement: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const notifs = await api.getNotifications(user.id);
      setUnreadCount(notifs.filter((n) => !n.is_read).length);
    } catch {
      // silent
    }
  }, [user]);

  const decrement = useCallback((by = 1) => {
    setUnreadCount((c) => Math.max(0, c - by));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
      const interval = setInterval(refresh, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refresh]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh, decrement }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
