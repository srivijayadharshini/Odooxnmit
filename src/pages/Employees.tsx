import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Eye, Edit3 } from "lucide-react";
import { api } from "@/services/api";
import { Card, Button, Input, Select, Badge, Avatar, Skeleton, EmptyState, PageHeader, Modal, toast } from "@/components/ui";
import type { EmployeeProfile } from "@/data/mockData";

interface EmployeeRow {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  role: string;
  profile?: EmployeeProfile;
}

function AddEmployeeModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ employee_id: "", name: "", email: "", department: "Engineering", designation: "", joining_date: "", role: "employee" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.employee_id) errs.employee_id = "Required";
    if (!form.name) errs.name = "Required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Valid email required";
    if (!form.designation) errs.designation = "Required";
    if (!form.joining_date) errs.joining_date = "Required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      await api.addEmployee(form);
      toast("Employee added successfully", "success");
      onSuccess();
      onClose();
      setForm({ employee_id: "", name: "", email: "", department: "Engineering", designation: "", joining_date: "", role: "employee" });
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const depts = api.getDepartments();

  return (
    <Modal open={open} onClose={onClose} title="Add New Employee" size="lg">
      {apiError && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{apiError}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Employee ID *" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} placeholder="EMP013" error={errors.employee_id} />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="employee">Employee</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
        <Input label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
        <Input label="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
            {depts.map((d) => <option key={d} value={d}>{d}</option>)}
            <option value="New Department">New Department</option>
          </Select>
          <Input label="Designation *" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} error={errors.designation} />
        </div>
        <Input label="Joining Date *" type="date" value={form.joining_date} onChange={(e) => setForm({ ...form, joining_date: e.target.value })} error={errors.joining_date} />
        <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">Default password: <span className="font-mono font-medium">Dayflow@123</span></p>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Add Employee</Button>
        </div>
      </form>
    </Modal>
  );
}

const statusBadge = (s: string) => {
  const map: Record<string, "success" | "warning" | "danger"> = { active: "success", "on-leave": "warning", terminated: "danger" };
  return <Badge variant={map[s] || "neutral"}>{s.replace("-", " ")}</Badge>;
};

export default function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const load = async () => {
    setLoading(true);
    try {
      const emps = await api.getEmployees();
      setEmployees(emps as EmployeeRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const depts = [...new Set(employees.map((e) => e.profile?.department).filter(Boolean))];

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !search || e.name.toLowerCase().includes(q) || e.employee_id.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.profile?.department?.toLowerCase().includes(q);
    const matchDept = !deptFilter || e.profile?.department === deptFilter;
    const matchStatus = !statusFilter || e.profile?.employment_status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-3"><Skeleton className="h-10 flex-1" /><Skeleton className="h-10 w-36" /><Skeleton className="h-10 w-36" /></div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} total employees`}
        action={<Button onClick={() => setAddOpen(true)} icon={<Plus size={16} />}>Add Employee</Button>}
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48">
          <Input placeholder="Search by name, ID, department..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} icon={<Search size={16} />} />
        </div>
        <Select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="w-44">
          <option value="">All Departments</option>
          {depts.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-36">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="on-leave">On Leave</option>
          <option value="terminated">Terminated</option>
        </Select>
      </div>

      <Card>
        {paged.length === 0 ? (
          <EmptyState icon={<Search size={36} />} title="No employees found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Employee", "ID", "Department", "Designation", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={emp.profile?.profile_picture} name={emp.name} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{emp.name}</p>
                            <p className="text-xs text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-600">{emp.employee_id}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{emp.profile?.department || "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{emp.profile?.designation || "—"}</td>
                      <td className="px-4 py-3">{statusBadge(emp.profile?.employment_status || "active")}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{emp.profile?.joining_date || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => navigate(`/employees/${emp.id}`)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => navigate(`/employees/${emp.id}/edit`)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                            <Edit3 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <p className="text-sm text-slate-500">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>←</Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i + 1} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{i + 1}</button>
                  ))}
                  <Button size="sm" variant="ghost" disabled={page === totalPages} onClick={() => setPage(page + 1)}>→</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <AddEmployeeModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={load} />
    </div>
  );
}
