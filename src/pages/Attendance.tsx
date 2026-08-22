import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Card, StatCard, Button, AttendanceBadge, Skeleton, PageHeader, EmptyState } from "@/components/ui";
import type { Attendance as AttendanceType } from "@/data/mockData";

export default function Attendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceType[]>([]);
  const [todayAtt, setTodayAtt] = useState<AttendanceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkLoading, setCheckLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"monthly" | "weekly">("monthly");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [all, today] = await Promise.all([
        api.getMyAttendance(user.id),
        api.getTodayAttendance(user.id),
      ]);
      setRecords(all);
      setTodayAtt(today);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleCheckIn = async () => {
    if (!user) return;
    setCheckLoading(true);
    try { await api.checkIn(user.id); await load(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Error"); }
    finally { setCheckLoading(false); }
  };

  const handleCheckOut = async () => {
    if (!user) return;
    setCheckLoading(true);
    try { await api.checkOut(user.id); await load(); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Error"); }
    finally { setCheckLoading(false); }
  };

  const now = new Date();
  const filtered = viewMode === "weekly"
    ? records.filter((r) => {
        const d = new Date(r.date);
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        return d >= weekAgo;
      })
    : records.filter((r) => {
        const d = new Date(r.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

  const present = filtered.filter((r) => r.status === "present" || r.status === "half-day").length;
  const absent = filtered.filter((r) => r.status === "absent").length;
  const leave = filtered.filter((r) => r.status === "leave").length;
  const totalHours = filtered.reduce((sum, r) => sum + (r.working_hours || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Track your daily check-ins and attendance history"
        action={
          <div className="flex gap-2">
            {!todayAtt?.check_in ? (
              <Button onClick={handleCheckIn} loading={checkLoading} size="sm" icon={<Clock size={14} />}>Check In</Button>
            ) : !todayAtt?.check_out ? (
              <Button onClick={handleCheckOut} loading={checkLoading} variant="secondary" size="sm" icon={<Clock size={14} />}>Check Out</Button>
            ) : (
              <span className="text-sm text-emerald-600 font-medium px-3 py-1.5 bg-emerald-50 rounded-lg">✓ Day complete</span>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Present" value={present} icon={<CheckCircle2 size={18} />} color="emerald" />
        <StatCard title="Absent" value={absent} icon={<XCircle size={18} />} color="red" />
        <StatCard title="Leave" value={leave} icon={<Calendar size={18} />} color="amber" />
        <StatCard title="Total Hours" value={`${totalHours.toFixed(0)}h`} icon={<Clock size={18} />} color="indigo" />
      </div>

      {/* Today widget */}
      {todayAtt && (
        <Card className="p-5 border-indigo-100 bg-indigo-50/30">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm">Today&apos;s Record</h3>
          <div className="flex gap-6 flex-wrap">
            <div><p className="text-xs text-slate-400">Check-in</p><p className="font-semibold text-slate-900">{todayAtt.check_in || "—"}</p></div>
            <div><p className="text-xs text-slate-400">Check-out</p><p className="font-semibold text-slate-900">{todayAtt.check_out || "In progress"}</p></div>
            <div><p className="text-xs text-slate-400">Hours</p><p className="font-semibold text-slate-900">{todayAtt.working_hours ? `${todayAtt.working_hours}h` : "—"}</p></div>
            <div><p className="text-xs text-slate-400">Status</p><AttendanceBadge status={todayAtt.status} /></div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Attendance History</h3>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(["weekly", "monthly"] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${viewMode === m ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>{m}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Clock size={36} />} title="No records" description="No attendance records for this period." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Date", "Day", "Check-in", "Check-out", "Working Hours", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => {
                  const day = new Date(r.date).toLocaleDateString("en-US", { weekday: "short" });
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{r.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{day}</td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-700">{r.check_in || "—"}</td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-700">{r.check_out || "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{r.working_hours ? `${r.working_hours}h` : "—"}</td>
                      <td className="px-4 py-3"><AttendanceBadge status={r.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
