import React, { useState, useEffect } from "react";
import { Plus, Calendar, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Card, Button, Input, Select, Modal, Badge, Skeleton, EmptyState, PageHeader, LeaveStatusBadge, toast } from "@/components/ui";
import type { LeaveRequest, LeaveBalance, LeaveType } from "@/data/mockData";

function ApplyLeaveModal({ open, onClose, onSuccess, userId }: { open: boolean; onClose: () => void; onSuccess: () => void; userId: number }) {
  const [form, setForm] = useState({ leave_type: "paid" as LeaveType, start_date: "", end_date: "", reason: "", remarks: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.start_date) errs.start_date = "Start date is required";
    if (!form.end_date) errs.end_date = "End date is required";
    else if (form.end_date < form.start_date) errs.end_date = "End date cannot be before start date";
    if (!form.reason.trim()) errs.reason = "Reason is required";
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
      await api.applyLeave(userId, form);
      toast("Leave request submitted successfully", "success");
      onSuccess();
      onClose();
      setForm({ leave_type: "paid", start_date: "", end_date: "", reason: "", remarks: "" });
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Apply for Leave">
      {apiError && <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{apiError}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Leave Type" value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value as LeaveType })}>
          <option value="paid">Paid Leave</option>
          <option value="sick">Sick Leave</option>
          <option value="unpaid">Unpaid Leave</option>
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} error={errors.start_date} />
          <Input label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} error={errors.end_date} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Reason *</label>
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="Briefly describe your reason..." className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          {errors.reason && <p className="text-xs text-red-600">{errors.reason}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Remarks (optional)</label>
          <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2} placeholder="Additional notes..." className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Submit Request</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Leave() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyOpen, setApplyOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [lr, bal] = await Promise.all([api.getMyLeaves(user.id), api.getLeaveBalance(user.id)]);
      setLeaves(lr);
      setBalance(bal);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const filtered = filter === "all" ? leaves : leaves.filter((l) => l.status === filter);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const leaveTypeLabel: Record<string, string> = { paid: "Paid Leave", sick: "Sick Leave", unpaid: "Unpaid Leave" };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        subtitle="Apply for leave and track your requests"
        action={<Button onClick={() => setApplyOpen(true)} icon={<Plus size={16} />}>Apply for Leave</Button>}
      />

      {/* Balance Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Paid Leave", value: balance?.paid || 0, total: 12, color: "indigo" },
          { label: "Sick Leave", value: balance?.sick || 0, total: 8, color: "blue" },
          { label: "Unpaid Leave", value: balance?.unpaid || 0, total: 10, color: "slate" },
        ].map((b) => (
          <Card key={b.label} className="p-4">
            <p className="text-xs text-slate-500 mb-1">{b.label}</p>
            <p className="text-2xl font-bold text-slate-900">{b.value}</p>
            <p className="text-xs text-slate-400">of {b.total} days</p>
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(b.value / b.total) * 100}%` }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Requests */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Calendar size={36} />}
            title="No leave requests"
            description={filter === "all" ? "You haven't submitted any leave requests yet." : `No ${filter} leave requests.`}
            action={<Button onClick={() => setApplyOpen(true)} icon={<Plus size={16} />}>Apply for Leave</Button>}
          />
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((lr) => (
              <div key={lr.id} className="p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <Calendar size={18} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">{leaveTypeLabel[lr.leave_type]}</span>
                        <LeaveStatusBadge status={lr.status} />
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{lr.start_date} → {lr.end_date} <span className="text-slate-400">({lr.duration} day{lr.duration > 1 ? "s" : ""})</span></p>
                      <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">{lr.reason}</p>
                      {lr.status === "rejected" && lr.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1.5 bg-red-50 rounded-lg px-3 py-1.5">Rejection reason: {lr.rejection_reason}</p>
                      )}
                      {lr.approved_by && lr.status === "approved" && (
                        <p className="text-xs text-emerald-600 mt-1">Approved by {lr.approved_by}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{lr.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ApplyLeaveModal open={applyOpen} onClose={() => setApplyOpen(false)} onSuccess={load} userId={user?.id || 0} />
    </div>
  );
}
