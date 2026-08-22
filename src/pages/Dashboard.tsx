import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, Calendar, CheckCircle2, AlertCircle, TrendingUp, FileText,
  Bell, ArrowRight, Plus, LogIn, LogOut as LogOutIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Card, StatCard, Badge, Button, Skeleton, AttendanceBadge, LeaveStatusBadge } from "@/components/ui";
import type { Attendance, LeaveRequest, LeaveBalance, Notification } from "@/data/mockData";

function AttendanceRing({ present, total }: { present: number; total: number }) {
  const pct = total > 0 ? Math.round((present / total) * 100) : 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke="#4338ca" strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900">{pct}%</span>
        <span className="text-[10px] text-slate-400">present</span>
      </div>
    </div>
  );
}

function WeekCalendar({ records }: { records: Attendance[] }) {
  const today = new Date();
  const weekDays: Date[] = [];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  for (let i = 0; i < 5; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push(d);
  }
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const statusColors: Record<string, string> = {
    present: "bg-indigo-600",
    absent: "bg-red-400",
    "half-day": "bg-amber-400",
    leave: "bg-blue-400",
  };

  return (
    <div className="flex gap-2 justify-center">
      {weekDays.map((d, i) => {
        const dateStr = fmt(d);
        const isToday = dateStr === fmt(today);
        const record = records.find((r) => r.date === dateStr);
        const isFuture = d > today;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-medium">{dayNames[i]}</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
              isToday ? "ring-2 ring-indigo-500 ring-offset-1" : ""
            } ${
              isFuture ? "bg-slate-50 text-slate-300 border border-dashed border-slate-200" :
              record ? `${statusColors[record.status] || "bg-slate-200"} text-white` : "bg-slate-100 text-slate-400"
            }`}>
              {d.getDate()}
            </div>
            <span className="text-[9px] text-slate-300">{isFuture ? "—" : record ? record.status.charAt(0).toUpperCase() : "—"}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayAtt, setTodayAtt] = useState<Attendance | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [attHistory, setAttHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [att, balance, leaves, notifs, history] = await Promise.all([
        api.getTodayAttendance(user.id),
        api.getLeaveBalance(user.id),
        api.getMyLeaves(user.id),
        api.getNotifications(user.id),
        api.getMyAttendance(user.id),
      ]);
      setTodayAtt(att);
      setLeaveBalance(balance);
      setMyLeaves(leaves);
      setNotifications(notifs);
      setAttHistory(history.slice(0, 30));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setCheckInLoading(true);
    try { await api.checkIn(user.id); await load(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Error"); }
    finally { setCheckInLoading(false); }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setCheckOutLoading(true);
    try { await api.checkOut(user.id); await load(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Error"); }
    finally { setCheckOutLoading(false); }
  };

  const presentDays = attHistory.filter((a) => a.status === "present" || a.status === "half-day").length;
  const absentDays = attHistory.filter((a) => a.status === "absent").length;
  const leaveDays = attHistory.filter((a) => a.status === "leave").length;
  const halfDays = attHistory.filter((a) => a.status === "half-day").length;
  const unread = notifications.filter((n) => !n.is_read).length;
  const pendingLeave = myLeaves.filter((l) => l.status === "pending").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const emoji = hour < 12 ? "☀️" : hour < 17 ? "👋" : "🌙";
  const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-72" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-56" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, {user?.name?.split(" ")[0]} {emoji}</h1>
          <p className="text-slate-500 text-sm mt-1">{dateStr} · {now}</p>
        </div>
        <div className="flex gap-2">
          {!todayAtt?.check_in ? (
            <Button onClick={handleCheckIn} loading={checkInLoading} icon={<LogIn size={14} />}>Check In</Button>
          ) : !todayAtt?.check_out ? (
            <Button onClick={handleCheckOut} loading={checkOutLoading} variant="secondary" icon={<LogOutIcon size={14} />}>Check Out</Button>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
              <CheckCircle2 size={14} /> Day complete
            </span>
          )}
          <Button variant="secondary" onClick={() => navigate("/leave")} icon={<Plus size={14} />} size="sm">Apply Leave</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Present Days" value={presentDays} subtitle="This month" icon={<CheckCircle2 size={18} />} color="emerald" />
        <StatCard title="Absent Days" value={absentDays} subtitle="This month" icon={<AlertCircle size={18} />} color="red" />
        <StatCard title="Leave Taken" value={leaveDays} subtitle="This month" icon={<Calendar size={18} />} color="amber" />
        <StatCard title="Notifications" value={unread} subtitle="Unread" icon={<Bell size={18} />} color="indigo" />
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's attendance widget */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Clock size={15} className="text-indigo-500" /> Today
            </h3>
            {todayAtt && <AttendanceBadge status={todayAtt.status} />}
          </div>

          <div className="space-y-2.5 mb-5">
            {[
              { label: "Check-in", value: todayAtt?.check_in || "—", icon: <LogIn size={13} className="text-emerald-500" /> },
              { label: "Check-out", value: todayAtt?.check_out || (todayAtt?.check_in ? "In progress…" : "—"), icon: <LogOutIcon size={13} className="text-slate-400" /> },
              { label: "Duration", value: todayAtt?.working_hours ? `${todayAtt.working_hours}h worked` : "—", icon: <Clock size={13} className="text-indigo-400" /> },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2 text-slate-500">
                  {row.icon}
                  <span className="text-xs">{row.label}</span>
                </div>
                <span className={`text-sm font-semibold ${row.label === "Check-in" && todayAtt?.check_in ? "text-emerald-700" : "text-slate-900"}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {!todayAtt?.check_in ? (
            <Button onClick={handleCheckIn} loading={checkInLoading} className="w-full justify-center" icon={<LogIn size={14} />}>Check In Now</Button>
          ) : !todayAtt?.check_out ? (
            <Button onClick={handleCheckOut} loading={checkOutLoading} variant="secondary" className="w-full justify-center" icon={<LogOutIcon size={14} />}>Check Out</Button>
          ) : (
            <div className="text-center text-sm text-emerald-700 font-medium py-2.5 bg-emerald-50 rounded-lg flex items-center justify-center gap-1.5">
              <CheckCircle2 size={15} /> Workday complete
            </div>
          )}
        </Card>

        {/* Attendance ring + weekly calendar */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-indigo-500" /> This Month
          </h3>
          <AttendanceRing present={presentDays} total={presentDays + absentDays + leaveDays + halfDays || 1} />
          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              { label: "Present", value: presentDays, color: "text-indigo-700 bg-indigo-50" },
              { label: "Absent", value: absentDays, color: "text-red-700 bg-red-50" },
              { label: "Leave", value: leaveDays, color: "text-amber-700 bg-amber-50" },
              { label: "Half Day", value: halfDays, color: "text-blue-700 bg-blue-50" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl px-3 py-2 ${s.color}`}>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs font-medium opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Leave balance */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Calendar size={15} className="text-indigo-500" /> Leave Balance
            </h3>
            <Button size="sm" variant="ghost" onClick={() => navigate("/leave")}>Apply →</Button>
          </div>
          <div className="space-y-4">
            {[
              { label: "Paid Leave", used: 12 - (leaveBalance?.paid || 0), total: 12, value: leaveBalance?.paid || 0, color: "bg-indigo-500" },
              { label: "Sick Leave", used: 8 - (leaveBalance?.sick || 0), total: 8, value: leaveBalance?.sick || 0, color: "bg-blue-500" },
              { label: "Unpaid", used: 0, total: 10, value: leaveBalance?.unpaid || 0, color: "bg-slate-400" },
            ].map((lb) => (
              <div key={lb.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-slate-700 font-medium">{lb.label}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-slate-900">{lb.value}</span>
                    <span className="text-xs text-slate-400">/ {lb.total}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${lb.color} rounded-full transition-all duration-700`} style={{ width: `${(lb.value / lb.total) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{lb.value} days remaining</p>
              </div>
            ))}
          </div>
          {pendingLeave > 0 && (
            <div className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              {pendingLeave} request{pendingLeave > 1 ? "s" : ""} pending approval
            </div>
          )}
        </Card>
      </div>

      {/* Week calendar + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">This Week</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate("/attendance")}>View all →</Button>
          </div>
          <WeekCalendar records={attHistory} />
          <div className="flex gap-3 mt-4 pt-4 border-t border-slate-50 flex-wrap">
            {[
              { color: "bg-indigo-600", label: "Present" },
              { color: "bg-red-400", label: "Absent" },
              { color: "bg-amber-400", label: "Half Day" },
              { color: "bg-blue-400", label: "Leave" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </Card>

        {/* Recent leaves */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Leaves</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate("/leave")}>View all →</Button>
          </div>
          {myLeaves.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={28} className="mx-auto text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">No leave requests yet</p>
              <Button size="sm" className="mt-3" onClick={() => navigate("/leave")} icon={<Plus size={13} />}>Apply for Leave</Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myLeaves.slice(0, 4).map((lr) => (
                <div key={lr.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Calendar size={14} className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 capitalize">{lr.leave_type} Leave</p>
                    <p className="text-xs text-slate-400">{lr.start_date} → {lr.end_date} ({lr.duration}d)</p>
                  </div>
                  <LeaveStatusBadge status={lr.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent notifications */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Bell size={15} className="text-indigo-500" /> Recent Notifications
            {unread > 0 && <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread}</span>}
          </h3>
          <Button size="sm" variant="ghost" onClick={() => navigate("/notifications")} icon={<ArrowRight size={14} />}>View all</Button>
        </div>
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-sm flex flex-col items-center gap-1.5">
            <Bell size={24} className="text-slate-200" />No notifications yet
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.slice(0, 4).map((n) => (
              <div key={n.id} className={`flex items-start gap-3 py-3 ${!n.is_read ? "opacity-100" : "opacity-60"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.type === "leave" ? "bg-indigo-50 text-indigo-600" : n.type === "attendance" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                  {n.type === "leave" ? <Calendar size={13} /> : n.type === "attendance" ? <Clock size={13} /> : <FileText size={13} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                    {!n.is_read && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{n.message}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{n.created_at}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
