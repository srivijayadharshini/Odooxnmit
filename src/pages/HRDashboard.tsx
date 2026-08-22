import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Clock, Calendar, FileText, TrendingUp, AlertTriangle,
  CheckCircle2, ArrowRight, Zap, Activity, UserCheck, UserX,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Card, StatCard, Button, Skeleton, LeaveStatusBadge, Avatar } from "@/components/ui";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import type { LeaveRequest, Notification } from "@/data/mockData";
import { PROFILES } from "@/data/mockData";

const COLORS = ["#4338ca", "#059669", "#d97706", "#7c3aed", "#0891b2", "#db2777"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function HRDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Awaited<ReturnType<typeof api.getEmployees>>>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [allAttendance, setAllAttendance] = useState<Awaited<ReturnType<typeof api.getAllAttendance>>>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [emps, leaves, att, notifs] = await Promise.all([
          api.getEmployees(),
          api.getAllLeaves(),
          api.getAllAttendance(),
          api.getNotifications(user.id),
        ]);
        setEmployees(emps);
        setAllLeaves(leaves);
        setAllAttendance(att);
        setNotifications(notifs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const today = new Date().toISOString().split("T")[0];
  const todayAtt = allAttendance.filter((a) => a.date === today);
  const presentToday = todayAtt.filter((a) => a.status === "present" || a.status === "half-day").length;
  const absentToday = todayAtt.filter((a) => a.status === "absent").length;
  const onLeaveToday = todayAtt.filter((a) => a.status === "leave").length;
  const pendingLeaves = allLeaves.filter((l) => l.status === "pending");

  // Dept distribution
  const deptCounts: Record<string, number> = {};
  PROFILES.forEach((p) => { deptCounts[p.department] = (deptCounts[p.department] || 0) + 1; });
  const deptData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

  // Attendance trend: last 7 working days
  const trendData: Array<{ date: string; Present: number; Absent: number; Leave: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const dateStr = d.toISOString().split("T")[0];
    const dayAtt = allAttendance.filter((a) => a.date === dateStr);
    trendData.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Present: dayAtt.filter((a) => a.status === "present" || a.status === "half-day").length,
      Absent: dayAtt.filter((a) => a.status === "absent").length,
      Leave: dayAtt.filter((a) => a.status === "leave").length,
    });
  }

  const leaveTypeData = [
    { name: "Paid", value: allLeaves.filter((l) => l.leave_type === "paid").length },
    { name: "Sick", value: allLeaves.filter((l) => l.leave_type === "sick").length },
    { name: "Unpaid", value: allLeaves.filter((l) => l.leave_type === "unpaid").length },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const attRate = employees.length > 0 ? Math.round((presentToday / employees.length) * 100) : 0;

  const insights = [
    {
      icon: <AlertTriangle size={14} />,
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
      border: "border-amber-100",
      title: "Attendance Alert",
      body: `Sales dept has ${allAttendance.filter((a) => { const p = PROFILES.find((pr) => pr.user_id === a.employee_id && pr.department === "Sales"); return p && a.status === "absent"; }).length} recent absences — review schedule.`,
      link: "View Attendance →",
      to: "/attendance",
    },
    {
      icon: <Calendar size={14} />,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      border: "border-indigo-100",
      title: "Leave Concentration",
      body: `${pendingLeaves.length} leave request${pendingLeaves.length !== 1 ? "s" : ""} pending approval. Plan coverage before approving.`,
      link: "Review Requests →",
      to: "/leave",
    },
    {
      icon: <TrendingUp size={14} />,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      border: "border-emerald-100",
      title: "Attendance Rate",
      body: `Today's attendance rate is ${attRate}%. Engineering team has the highest consistency this week.`,
      link: "View Report →",
      to: "/reports",
    },
    {
      icon: <Users size={14} />,
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
      border: "border-violet-100",
      title: "Workforce Distribution",
      body: `Engineering (${deptCounts["Engineering"] || 0}) is the largest dept. Consider balanced headcount planning.`,
      link: "View Employees →",
      to: "/employees",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-80" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's your workforce overview for today, {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate("/reports")}>View Reports</Button>
          <Button size="sm" onClick={() => navigate("/employees")} icon={<Users size={14} />}>Employees</Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={employees.length}
          subtitle="Active workforce"
          icon={<Users size={20} />}
          color="indigo"
          trend={{ value: "All departments", up: true }}
        />
        <StatCard
          title="Present Today"
          value={presentToday}
          subtitle={`${attRate}% attendance rate`}
          icon={<UserCheck size={20} />}
          color="emerald"
          trend={{ value: `${absentToday} absent`, up: false }}
        />
        <StatCard
          title="On Leave"
          value={onLeaveToday}
          subtitle="Today"
          icon={<Calendar size={20} />}
          color="amber"
        />
        <StatCard
          title="Pending Requests"
          value={pendingLeaves.length}
          subtitle="Awaiting approval"
          icon={<FileText size={20} />}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance trend */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" /> Attendance Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Last 5 working days</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate("/attendance")}>Full report →</Button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4338ca" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4338ca" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Present" stroke="#4338ca" strokeWidth={2.5} fill="url(#gradPresent)" dot={{ r: 3, fill: "#4338ca", strokeWidth: 0 }} />
              <Area type="monotone" dataKey="Absent" stroke="#ef4444" strokeWidth={2} fill="transparent" strokeDasharray="5 3" dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Dept distribution */}
        <Card className="p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">Departments</h3>
            <p className="text-xs text-slate-400 mt-0.5">Headcount by team</p>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={deptData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={68}
                paddingAngle={2}
                dataKey="value"
              >
                {deptData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {deptData.slice(0, 5).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Pending Leave Requests</h3>
            <Button size="sm" variant="ghost" onClick={() => navigate("/leave")} icon={<ArrowRight size={14} />}>
              Manage all
            </Button>
          </div>
          {pendingLeaves.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-400" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs">No pending leave requests.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingLeaves.slice(0, 5).map((lr) => {
                const emp = employees.find((e) => e.id === lr.employee_id);
                const profile = PROFILES.find((p) => p.user_id === lr.employee_id);
                return (
                  <div key={lr.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <Avatar src={profile?.profile_picture} name={emp?.name || "?"} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{emp?.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{lr.leave_type} leave · {lr.duration} day{lr.duration > 1 ? "s" : ""} · {lr.start_date}</p>
                    </div>
                    <LeaveStatusBadge status={lr.status} />
                  </div>
                );
              })}
              {pendingLeaves.length > 5 && (
                <button onClick={() => navigate("/leave")} className="w-full text-xs text-indigo-600 hover:text-indigo-800 font-medium py-2 text-center hover:bg-indigo-50 rounded-lg transition-colors">
                  + {pendingLeaves.length - 5} more requests
                </button>
              )}
            </div>
          )}
        </Card>

        {/* HR Insights */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Zap size={14} className="text-white" />
            </div>
            <h3 className="font-semibold text-slate-900">HR Insights</h3>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Data-driven</span>
          </div>
          <div className="space-y-2.5">
            {insights.map((insight) => (
              <div
                key={insight.title}
                className={`flex gap-3 p-3 rounded-xl border ${insight.bg} ${insight.border} hover:opacity-90 transition-opacity cursor-pointer`}
                onClick={() => navigate(insight.to)}
              >
                <div className={`p-1.5 rounded-lg bg-white/60 shrink-0 ${insight.iconColor}`}>{insight.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">{insight.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{insight.body}</p>
                  <span className="text-xs text-indigo-600 font-semibold mt-1 inline-block">{insight.link}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Leave type chart + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Leave Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={leaveTypeData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                {leaveTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="divide-y divide-slate-50">
            {notifications.slice(0, 6).map((n) => (
              <div key={n.id} className="flex items-start gap-3 py-2.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm mt-0.5 ${n.type === "leave" ? "bg-indigo-100 text-indigo-600" : n.type === "attendance" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                  {n.type === "leave" ? <Calendar size={14} /> : n.type === "attendance" ? <Clock size={14} /> : <FileText size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 line-clamp-1">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.created_at}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
