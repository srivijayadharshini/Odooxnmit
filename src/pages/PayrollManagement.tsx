import React, { useState, useEffect } from "react";
import { Edit3, Save, X, IndianRupee } from "lucide-react";
import { api } from "@/services/api";
import { Card, Button, Input, Avatar, Skeleton, PageHeader, Modal, toast, StatCard } from "@/components/ui";
import { PROFILES } from "@/data/mockData";
import type { Payroll } from "@/data/mockData";

interface PayrollRow extends Payroll {
  empName?: string;
  empPic?: string;
  department?: string;
}

function EditPayrollModal({ open, onClose, row, onSave }: { open: boolean; onClose: () => void; row: PayrollRow | null; onSave: () => void }) {
  const [form, setForm] = useState({ basic_salary: 0, allowances: 0, deductions: 0 });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (row) setForm({ basic_salary: row.basic_salary, allowances: row.allowances, deductions: row.deductions });
  }, [row]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.basic_salary < 0) errs.basic_salary = "Salary cannot be negative";
    if (form.allowances < 0) errs.allowances = "Allowances cannot be negative";
    if (form.deductions < 0) errs.deductions = "Deductions cannot be negative";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!row) return;
    setLoading(true);
    try {
      await api.updatePayroll(row.employee_id, form);
      toast("Payroll updated successfully", "success");
      onSave();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const net = form.basic_salary + form.allowances - form.deductions;

  return (
    <Modal open={open} onClose={onClose} title={`Edit Payroll — ${row?.empName || ""}`}>
      <div className="space-y-4">
        <Input label="Basic Salary (₹)" type="number" min={0} value={form.basic_salary} onChange={(e) => setForm({ ...form, basic_salary: Number(e.target.value) })} error={errors.basic_salary} />
        <Input label="Allowances (₹)" type="number" min={0} value={form.allowances} onChange={(e) => setForm({ ...form, allowances: Number(e.target.value) })} error={errors.allowances} />
        <Input label="Deductions (₹)" type="number" min={0} value={form.deductions} onChange={(e) => setForm({ ...form, deductions: Number(e.target.value) })} error={errors.deductions} />
        <div className="bg-indigo-50 rounded-xl p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-indigo-600">Calculated Net Salary</span>
          <span className="text-lg font-bold text-indigo-700">₹{net.toLocaleString()}</span>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={loading} onClick={handleSave} icon={<Save size={14} />}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function PayrollManagement() {
  const [payrolls, setPayrolls] = useState<PayrollRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState<PayrollRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getAllPayroll();
      const enriched: PayrollRow[] = data.map((p) => {
        const profile = PROFILES.find((pr) => pr.user_id === p.employee_id);
        return { ...p, empName: p.user?.name, empPic: profile?.profile_picture, department: profile?.department };
      });
      setPayrolls(enriched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const totalPayroll = payrolls.reduce((sum, p) => sum + p.net_salary, 0);
  const avgSalary = payrolls.length ? Math.round(totalPayroll / payrolls.length) : 0;
  const totalDeductions = payrolls.reduce((sum, p) => sum + p.deductions, 0);

  const fmt = (n: number) => `₹${n.toLocaleString()}`;

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
      <PageHeader title="Payroll Management" subtitle="Manage employee compensation and salary structures" />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Payroll" value={fmt(totalPayroll)} subtitle="Monthly expenditure" icon={<IndianRupee size={18} />} color="indigo" />
        <StatCard title="Average Salary" value={fmt(avgSalary)} subtitle="Per employee" icon={<IndianRupee size={18} />} color="emerald" />
        <StatCard title="Total Deductions" value={fmt(totalDeductions)} subtitle="Monthly" icon={<IndianRupee size={18} />} color="amber" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Employee", "Department", "Basic Salary", "Allowances", "Deductions", "Net Salary", "Updated", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payrolls.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={p.empPic} name={p.empName || "?"} size="sm" />
                      <span className="text-sm font-medium text-slate-900">{p.empName || `ID ${p.employee_id}`}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.department || "—"}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{fmt(p.basic_salary)}</td>
                  <td className="px-4 py-3 text-sm text-emerald-700 font-medium">+{fmt(p.allowances)}</td>
                  <td className="px-4 py-3 text-sm text-red-600 font-medium">-{fmt(p.deductions)}</td>
                  <td className="px-4 py-3 text-sm font-bold text-indigo-700">{fmt(p.net_salary)}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{p.updated_at}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setEditRow(p); setEditOpen(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EditPayrollModal open={editOpen} onClose={() => setEditOpen(false)} row={editRow} onSave={load} />
    </div>
  );
}
