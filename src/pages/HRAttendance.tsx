import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { api } from "@/services/api";
import { Card, Input, Select, StatCard, Skeleton, AttendanceBadge, Avatar, PageHeader } from "@/components/ui";
import { CheckCircle2, XCircle, Calendar, Clock } from "lucide-react";
import type { Attendance } from "@/data/mockData";
import { PROFILES } from "@/data/mockData";

interface AttRecord extends Attendance {
  empName?: string;
  empPic?: string;
}

export default function HRAttendance() {
  const [records, setRecords] = useState<AttRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [deptFilter, setDeptFilter] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const depts = [...new Set(PROFILES.map((p) => p.department))];

  const load = async () => {
    setLoading(true);
    try {
      const allEmp = await api.getEmployees();
      const att = await api.getAllAttendance({ date: dateFilter || undefined, department: deptFilter || undefined });
      const enriched: AttRecord[] = att.map((a) => {
        const emp = allEmp.find((e) => e.id === a.employee_id);
        const profile = PROFILES.find((p) => p.user_id === a.employee_id);
        return { ...a, empName: emp?.name, empPic: profile?.profile_picture };
      });
      setRecords(enriched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [dateFilter, deptFilter]);

  const filtered = records.filter((r) => {
    const matchSearch = !search || r.empName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const present = filtered.filter((r) => r.status === "present" || r.status === "half-day").length;
  const absent = filtered.filter((r) => r.status === "absent").length;
  const leave = filtered.filter((r) => r.status === "leave").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" subtitle="Monitor employee attendance across the organization" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Present" value={present} icon={<CheckCircle2 size={18} />} color="emerald" />
        <StatCard title="Absent" value={absent} icon={<XCircle size={18} />} color="red" />
        <StatCard title="On Leave" value={leave} icon={<Calendar size={18} />} color="amber" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-44" />
        <div className="flex-1 min-w-40">
          <Input placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={16} />} />
        </div>
        <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="w-44">
          <option value="">All Departments</option>
          {depts.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="half-day">Half Day</option>
          <option value="leave">Leave</option>
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee", "Date", "Check-in", "Check-out", "Working Hours", "Status"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No attendance records found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={r.empPic} name={r.empName || "?"} size="sm" />
                        <span className="text-sm font-medium text-slate-900">{r.empName || `Employee ${r.employee_id}`}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{r.date}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{r.check_in || "—"}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{r.check_out || "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.working_hours ? `${r.working_hours}h` : "—"}</td>
                    <td className="px-4 py-3"><AttendanceBadge status={r.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
