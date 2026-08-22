import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Save, X, Mail, Phone, MapPin, Briefcase, Building, Calendar, Shield } from "lucide-react";
import { api } from "@/services/api";
import { Card, Button, Input, Select, Badge, Avatar, Skeleton, AttendanceBadge, LeaveStatusBadge, toast } from "@/components/ui";
import type { EmployeeProfile, Payroll, Attendance, LeaveRequest } from "@/data/mockData";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = window.location.pathname.includes("/edit");
  const [data, setData] = useState<{ user: { id: number; employee_id: string; name: string; email: string; role: string }; profile?: EmployeeProfile; payroll?: Payroll; balance?: unknown; attendance?: Attendance[]; leaves?: LeaveRequest[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(isEdit);
  const [form, setForm] = useState<Partial<EmployeeProfile & { role: string }>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const d = await api.getEmployee(Number(id));
      setData(d as unknown as typeof data);
      setForm({
        phone: d.profile?.phone || "",
        address: d.profile?.address || "",
        department: d.profile?.department || "",
        designation: d.profile?.designation || "",
        employment_status: d.profile?.employment_status || "active",
        manager: d.profile?.manager || "",
        role: d.user?.role || "employee",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await api.updateEmployee(Number(id), form);
      toast("Employee updated successfully", "success");
      setEditing(false);
      load();
    } catch {
      toast("Failed to update employee", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-16 text-slate-500">Employee not found.</div>;

  const { user, profile, payroll, attendance = [], leaves = [] } = data as {
    user: { id: number; employee_id: string; name: string; email: string; role: string };
    profile?: EmployeeProfile; payroll?: Payroll; attendance: Attendance[]; leaves: LeaveRequest[];
  };

  const fmt = (n: number) => `₹${n.toLocaleString()}`;
  const presentCount = attendance.filter((a) => a.status === "present" || a.status === "half-day").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const pendingLeaves = leaves.filter((l) => l.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/employees")} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium">
          <ArrowLeft size={16} /> Employees
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-900">{user.name}</span>
        <div className="ml-auto flex gap-2">
          {!editing ? (
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)} icon={<Edit3 size={14} />}>Edit</Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} icon={<X size={14} />}>Cancel</Button>
              <Button size="sm" loading={saving} onClick={handleSave} icon={<Save size={14} />}>Save Changes</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6 flex flex-col items-center text-center">
          <Avatar src={profile?.profile_picture} name={user.name} size="xl" />
          <h2 className="text-lg font-bold text-slate-900 mt-4">{user.name}</h2>
          <p className="text-sm text-slate-500">{profile?.designation}</p>
          <p className="text-xs text-slate-400 mt-0.5">{profile?.department}</p>
          <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
            <Badge variant={profile?.employment_status === "active" ? "success" : profile?.employment_status === "on-leave" ? "warning" : "danger"}>
              {profile?.employment_status?.replace("-", " ") || "active"}
            </Badge>
            <Badge variant="primary" className="capitalize">{user.role}</Badge>
          </div>
          <div className="w-full mt-5 pt-5 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Employee ID</span><span className="font-mono font-semibold text-slate-900">{user.employee_id}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Joined</span><span className="font-medium text-slate-900">{profile?.joining_date || "—"}</span>
            </div>
          </div>

          {/* Mini stats */}
          <div className="w-full mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Present", value: presentCount, color: "text-emerald-700" },
              { label: "Absent", value: absentCount, color: "text-red-600" },
              { label: "Leaves", value: pendingLeaves, color: "text-amber-600" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-xl py-2 px-1 text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact + Employment */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Employee Information</h3>
            {editing ? (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} icon={<Phone size={16} />} />
                <Input label="Address" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} icon={<MapPin size={16} />} />
                <Input label="Department" value={form.department || ""} onChange={(e) => setForm({ ...form, department: e.target.value })} icon={<Building size={16} />} />
                <Input label="Designation" value={form.designation || ""} onChange={(e) => setForm({ ...form, designation: e.target.value })} icon={<Briefcase size={16} />} />
                <Input label="Manager" value={form.manager || ""} onChange={(e) => setForm({ ...form, manager: e.target.value })} icon={<Shield size={16} />} />
                <Select label="Status" value={form.employment_status || "active"} onChange={(e) => setForm({ ...form, employment_status: e.target.value as EmployeeProfile["employment_status"] })}>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="terminated">Terminated</option>
                </Select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6">
                {[
                  { icon: <Mail size={14} />, label: "Email", val: user.email },
                  { icon: <Phone size={14} />, label: "Phone", val: profile?.phone || "—" },
                  { icon: <MapPin size={14} />, label: "Address", val: profile?.address || "—" },
                  { icon: <Building size={14} />, label: "Department", val: profile?.department || "—" },
                  { icon: <Briefcase size={14} />, label: "Designation", val: profile?.designation || "—" },
                  { icon: <Shield size={14} />, label: "Manager", val: profile?.manager || "—" },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-2.5 py-2.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-400 mt-0.5 shrink-0">{row.icon}</span>
                    <div>
                      <p className="text-xs text-slate-400">{row.label}</p>
                      <p className="text-sm font-medium text-slate-900">{row.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Payroll */}
          {payroll && (
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Salary Information</h3>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Basic Salary", value: fmt(payroll.basic_salary), color: "text-slate-900" },
                  { label: "Allowances", value: fmt(payroll.allowances), color: "text-emerald-700" },
                  { label: "Deductions", value: fmt(payroll.deductions), color: "text-red-600" },
                  { label: "Net Salary", value: fmt(payroll.net_salary), color: "text-indigo-700" },
                ].map((r) => (
                  <div key={r.label} className={`bg-slate-50 rounded-xl p-3 ${r.label === "Net Salary" ? "bg-indigo-50" : ""}`}>
                    <p className="text-xs text-slate-400 mb-1">{r.label}</p>
                    <p className={`text-base font-bold ${r.color}`}>{r.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Recent Attendance */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Recent Attendance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Date", "Check-in", "Check-out", "Hours", "Status"].map((h) => (
                      <th key={h} className="text-left px-2 py-2 text-xs font-medium text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendance.slice(0, 5).map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="px-2 py-2 text-sm text-slate-700">{r.date}</td>
                      <td className="px-2 py-2 text-sm font-mono text-slate-600">{r.check_in || "—"}</td>
                      <td className="px-2 py-2 text-sm font-mono text-slate-600">{r.check_out || "—"}</td>
                      <td className="px-2 py-2 text-sm text-slate-600">{r.working_hours ? `${r.working_hours}h` : "—"}</td>
                      <td className="px-2 py-2"><AttendanceBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Leave Summary */}
          <Card className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Leave Requests</h3>
            {leaves.length === 0 ? (
              <p className="text-sm text-slate-400">No leave requests.</p>
            ) : (
              <div className="space-y-2">
                {leaves.slice(0, 4).map((l) => (
                  <div key={l.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800 capitalize">{l.leave_type} Leave</p>
                      <p className="text-xs text-slate-400">{l.start_date} → {l.end_date}</p>
                    </div>
                    <LeaveStatusBadge status={l.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
