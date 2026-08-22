import React, { useState, useEffect } from "react";
import { Check, X, ChevronDown, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Card, Button, Badge, Avatar, Modal, Input, Skeleton, EmptyState, PageHeader, LeaveStatusBadge, toast } from "@/components/ui";
import type { LeaveRequest } from "@/data/mockData";
import { PROFILES } from "@/data/mockData";

function RejectModal({ open, onClose, onReject }: { open: boolean; onClose: () => void; onReject: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) { setError("Rejection reason is required"); return; }
    setLoading(true);
    try { await onReject(reason); onClose(); setReason(""); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Reject Leave Request" size="sm">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Reason for rejection *</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Provide a reason for rejecting this request..." className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={loading} onClick={handleSubmit} icon={<X size={14} />}>Reject</Button>
        </div>
      </div>
    </Modal>
  );
}

const leaveTypeLabel: Record<string, string> = { paid: "Paid Leave", sick: "Sick Leave", unpaid: "Unpaid Leave" };

export default function LeaveApproval() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<ReturnType<typeof api.getEmployees> extends Promise<infer T> ? T : never>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [rejectModal, setRejectModal] = useState<{ open: boolean; leaveId: number | null }>({ open: false, leaveId: null });

  const load = async () => {
    setLoading(true);
    try {
      const [lv, emps] = await Promise.all([api.getAllLeaves(), api.getEmployees()]);
      setLeaves(lv);
      setEmployees(emps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (leaveId: number) => {
    if (!user) return;
    try {
      await api.approveLeave(leaveId, user.name, user.id);
      toast("Leave request approved", "success");
      load();
    } catch {
      toast("Failed to approve", "error");
    }
  };

  const handleReject = async (reason: string) => {
    if (!user || !rejectModal.leaveId) return;
    await api.rejectLeave(rejectModal.leaveId, user.name, reason);
    toast("Leave request rejected", "info");
    load();
  };

  const filtered = leaves.filter((l) => l.status === tab);
  const pendingCount = leaves.filter((l) => l.status === "pending").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Leave Management" subtitle="Review and manage employee leave requests" />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all flex items-center gap-1.5 ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t}
            {t === "pending" && pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <EmptyState icon={<Calendar size={36} />} title={`No ${tab} requests`} description={`There are no ${tab} leave requests at the moment.`} />
          </Card>
        ) : (
          filtered.map((lr) => {
            const emp = employees.find((e) => e.id === lr.employee_id);
            const profile = PROFILES.find((p) => p.user_id === lr.employee_id);
            return (
              <Card key={lr.id} className="p-5 hover:border-slate-300 transition-colors">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar src={profile?.profile_picture} name={emp?.name || "?"} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">{emp?.name || `Employee ${lr.employee_id}`}</p>
                        <Badge variant="neutral" className="text-[10px]">{profile?.department || ""}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{profile?.designation || ""}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 min-w-0">
                    <div>
                      <p className="text-xs text-slate-400">Leave Type</p>
                      <p className="text-sm font-medium text-slate-900">{leaveTypeLabel[lr.leave_type]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Duration</p>
                      <p className="text-sm font-medium text-slate-900">{lr.duration} day{lr.duration > 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Dates</p>
                      <p className="text-sm font-medium text-slate-900">{lr.start_date} → {lr.end_date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Status</p>
                      <LeaveStatusBadge status={lr.status} />
                    </div>
                  </div>

                  {tab === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="success" onClick={() => handleApprove(lr.id)} icon={<Check size={14} />}>Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => setRejectModal({ open: true, leaveId: lr.id })} icon={<X size={14} />}>Reject</Button>
                    </div>
                  )}
                </div>

                <div className="mt-3 ml-0 md:ml-16 pt-3 border-t border-slate-50">
                  <p className="text-xs text-slate-400 mb-0.5">Reason</p>
                  <p className="text-sm text-slate-600">{lr.reason}</p>
                  {lr.remarks && <p className="text-xs text-slate-400 mt-1.5">Remarks: {lr.remarks}</p>}
                  {lr.status === "rejected" && lr.rejection_reason && (
                    <p className="text-xs text-red-600 mt-1.5 bg-red-50 rounded-lg px-3 py-1.5">Rejection reason: {lr.rejection_reason}</p>
                  )}
                  {lr.status === "approved" && <p className="text-xs text-emerald-600 mt-1.5">Approved by {lr.approved_by} on {lr.updated_at}</p>}
                  <p className="text-xs text-slate-400 mt-1">Submitted: {lr.created_at}</p>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <RejectModal open={rejectModal.open} onClose={() => setRejectModal({ open: false, leaveId: null })} onReject={handleReject} />
    </div>
  );
}
