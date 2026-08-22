import React, { useState, useEffect } from "react";
import { Download, BarChart3, Users, Calendar, IndianRupee, Filter } from "lucide-react";
import { api } from "@/services/api";
import { Card, Button, Select, Input, StatCard, Skeleton, PageHeader, Badge } from "@/components/ui";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PROFILES } from "@/data/mockData";

const COLORS = ["#4338ca", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

export default function Reports() {
  const [activeTab, setActiveTab] = useState<"attendance" | "leave" | "employee" | "payroll">("attendance");
  const [deptFilter, setDeptFilter] = useState("");
  const [fromDate, setFromDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [attReport, setAttReport] = useState<Awaited<ReturnType<typeof api.getAttendanceReport>> | null>(null);
  const [leaveReport, setLeaveReport] = useState<Awaited<ReturnType<typeof api.getLeaveReport>> | null>(null);
  const [employees, setEmployees] = useState<Awaited<ReturnType<typeof api.getEmployees>>>([]);
  const [payrolls, setPayrolls] = useState<Awaited<ReturnType<typeof api.getAllPayroll>>>([]);
  const [loading, setLoading] = useState(true);

  const depts = [...new Set(PROFILES.map((p) => p.department))];

  const load = async () => {
    setLoading(true);
    try {
      const [att, lv, emps, pay] = await Promise.all([
        api.getAttendanceReport({ department: deptFilter || undefined, from: fromDate, to: toDate }),
        api.getLeaveReport({ department: deptFilter || undefined }),
        api.getEmployees(),
        api.getAllPayroll(),
      ]);
      setAttReport(att);
      setLeaveReport(lv);
      setEmployees(emps);
      setPayrolls(pay);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [deptFilter, fromDate, toDate]);

  const handleExport = (type: "csv" | "pdf") => {
    alert(`Export as ${type.toUpperCase()} — feature available in production build.`);
  };

  const deptDist = depts.map((d) => ({
    name: d,
    value: PROFILES.filter((p) => p.department === d).length,
    active: PROFILES.filter((p) => p.department === d && p.employment_status === "active").length,
  }));

  const payrollByDept: Record<string, number> = {};
  payrolls.forEach((p) => {
    const dept = PROFILES.find((pr) => pr.user_id === p.employee_id)?.department || "Unknown";
    payrollByDept[dept] = (payrollByDept[dept] || 0) + p.net_salary;
  });
  const payrollChartData = Object.entries(payrollByDept).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Data-driven insights across your organization"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleExport("csv")} icon={<Download size={14} />}>Export CSV</Button>
            <Button size="sm" variant="secondary" onClick={() => handleExport("pdf")} icon={<Download size={14} />}>Export PDF</Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["attendance", "leave", "employee", "payroll"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{t}</button>
        ))}
      </div>

      {/* Global filters */}
      <div className="flex gap-3 flex-wrap">
        <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-44" />
        <span className="self-center text-slate-400 text-sm">to</span>
        <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-44" />
        <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="w-44">
          <option value="">All Departments</option>
          {depts.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
      </div>

      {/* Attendance Report */}
      {activeTab === "attendance" && attReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Records" value={attReport.total} icon={<BarChart3 size={18} />} color="indigo" />
            <StatCard title="Present" value={attReport.present} icon={<BarChart3 size={18} />} color="emerald" />
            <StatCard title="Absent" value={attReport.absent} icon={<BarChart3 size={18} />} color="red" />
            <StatCard title="Half Day" value={attReport.halfDay} icon={<BarChart3 size={18} />} color="amber" />
          </div>
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Attendance Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={[
                  { name: "Present", value: attReport.present },
                  { name: "Absent", value: attReport.absent },
                  { name: "Leave", value: attReport.leave },
                  { name: "Half Day", value: attReport.halfDay },
                ]} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {["#4338ca", "#dc2626", "#d97706", "#0891b2"].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Leave Report */}
      {activeTab === "leave" && leaveReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Requests" value={leaveReport.total} icon={<Calendar size={18} />} color="indigo" />
            <StatCard title="Approved" value={leaveReport.approved} icon={<Calendar size={18} />} color="emerald" />
            <StatCard title="Pending" value={leaveReport.pending} icon={<Calendar size={18} />} color="amber" />
            <StatCard title="Rejected" value={leaveReport.rejected} icon={<Calendar size={18} />} color="red" />
          </div>
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Leave Status Overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[
                { name: "Approved", value: leaveReport.approved },
                { name: "Pending", value: leaveReport.pending },
                { name: "Rejected", value: leaveReport.rejected },
              ]} barSize={60}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {[<Cell key="0" fill="#059669" />, <Cell key="1" fill="#d97706" />, <Cell key="2" fill="#dc2626" />]}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Employee Report */}
      {activeTab === "employee" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Employees" value={employees.length} icon={<Users size={18} />} color="indigo" />
            <StatCard title="Active" value={PROFILES.filter((p) => p.employment_status === "active").length} icon={<Users size={18} />} color="emerald" />
            <StatCard title="On Leave" value={PROFILES.filter((p) => p.employment_status === "on-leave").length} icon={<Users size={18} />} color="amber" />
            <StatCard title="Departments" value={depts.length} icon={<Users size={18} />} color="blue" />
          </div>
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Employees by Department</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptDist} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={90} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#4338ca" radius={[0, 4, 4, 0]} name="Total" />
                <Bar dataKey="active" fill="#059669" radius={[0, 4, 4, 0]} name="Active" />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Payroll Report */}
      {activeTab === "payroll" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="Total Payroll" value={`₹${payrolls.reduce((s, p) => s + p.net_salary, 0).toLocaleString()}`} icon={<IndianRupee size={18} />} color="indigo" />
            <StatCard title="Avg. Salary" value={`₹${Math.round(payrolls.reduce((s, p) => s + p.net_salary, 0) / Math.max(payrolls.length, 1)).toLocaleString()}`} icon={<IndianRupee size={18} />} color="emerald" />
            <StatCard title="Total Deductions" value={`₹${payrolls.reduce((s, p) => s + p.deductions, 0).toLocaleString()}`} icon={<IndianRupee size={18} />} color="amber" />
          </div>
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Payroll by Department</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={payrollChartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Net Payroll"]} />
                <Bar dataKey="value" fill="#4338ca" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
}
