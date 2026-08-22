import React, { useState, useEffect } from "react";
import { Bell, Check, Calendar, Clock, DollarSign, User, Settings as SettingsIcon, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { api } from "@/services/api";
import { Card, Button, Skeleton, EmptyState, PageHeader, toast } from "@/components/ui";
import type { Notification } from "@/data/mockData";

const TYPE_META: Record<string, { icon: React.ReactNode; bg: string; label: string }> = {
  leave: { icon: <Calendar size={15} />, bg: "bg-indigo-50 text-indigo-600", label: "Leave" },
  attendance: { icon: <Clock size={15} />, bg: "bg-emerald-50 text-emerald-600", label: "Attendance" },
  payroll: { icon: <DollarSign size={15} />, bg: "bg-amber-50 text-amber-600", label: "Payroll" },
  profile: { icon: <User size={15} />, bg: "bg-blue-50 text-blue-600", label: "Profile" },
  system: { icon: <SettingsIcon size={15} />, bg: "bg-slate-100 text-slate-600", label: "System" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const { user } = useAuth();
  const { refresh: refreshBadge } = useNotifications();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "leave" | "attendance" | "payroll">("all");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const n = await api.getNotifications(user.id);
      setNotifs(n);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleMarkRead = async (id: number) => {
    await api.markNotificationRead(id);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    refreshBadge();
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await api.markAllRead(user.id);
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    refreshBadge();
    toast("All notifications marked as read", "success");
  };

  const filtered = notifs.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "all") return true;
    return n.type === filter;
  });

  const unreadCount = notifs.filter((n) => !n.is_read).length;
  const tabs = ["all", "unread", "leave", "attendance", "payroll"] as const;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-52" />
        <div className="flex gap-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-24" />)}</div>
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "You're all caught up"}
        action={
          unreadCount > 0 ? (
            <Button size="sm" variant="secondary" onClick={handleMarkAllRead} icon={<Check size={14} />}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      {/* Filter bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {f === "unread" ? `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` : f}
          </button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell size={36} />}
            title={filter === "unread" ? "All caught up!" : "No notifications"}
            description={filter === "unread" ? "You have no unread notifications." : "No notifications in this category."}
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((n) => {
              const meta = TYPE_META[n.type] || TYPE_META.system;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-5 py-4 transition-colors ${!n.is_read ? "bg-indigo-50/30 hover:bg-indigo-50/50" : "hover:bg-slate-50/40"}`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${meta.bg}`}>{meta.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                      {!n.is_read && (
                        <span className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 inline-block" />
                      )}
                      <span className="text-[10px] font-semibold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{meta.label}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1.5">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0 mt-1 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
