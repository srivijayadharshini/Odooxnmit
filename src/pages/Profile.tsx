import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Briefcase, Building, Calendar, Shield, Edit3, Save, X, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Card, Button, Input, Badge, Avatar, InfoRow, Skeleton, toast, PageHeader } from "@/components/ui";
import type { EmployeeProfile, Payroll } from "@/data/mockData";

export default function Profile() {
  const { user, isHR } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ profile: p }, pay] = await Promise.all([
        api.getProfile(user.id),
        api.getMyPayroll(user.id),
      ]);
      setProfile(p);
      setPayroll(pay);
      setForm({ phone: p.phone, address: p.address });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await api.updateProfile(user.id, form);
      setProfile(updated);
      setEditing(false);
      toast("Profile updated successfully", "success");
    } catch {
      toast("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-slide">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40 lg:col-span-2" />
        </div>
      </div>
    );
  }

  const statusMap: Record<string, "success" | "warning" | "danger"> = { active: "success", "on-leave": "warning", terminated: "danger" };
  const fmt = (n: number) => `₹${n.toLocaleString()}`;
  const initials = (user?.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 shadow-lg">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute top-8 right-32 w-20 h-20 bg-indigo-500/30 rounded-full" />
        </div>

        <div className="relative px-6 pt-8 pb-16 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl ring-4 ring-white/30 overflow-hidden shadow-xl">
              {profile?.profile_picture
                ? <img src={profile.profile_picture} alt={user?.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-indigo-800/60 flex items-center justify-center text-white text-2xl font-bold">{initials}</div>
              }
            </div>
            <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md text-indigo-600 hover:bg-indigo-50 transition-colors">
              <Camera size={13} />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white tracking-tight">{profile?.full_name}</h1>
              <Badge variant="primary" className="bg-white/15 text-white ring-white/25 text-[10px]">
                {profile?.employment_status?.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Badge>
            </div>
            <p className="text-indigo-200 text-sm font-medium">{profile?.designation}</p>
            <p className="text-indigo-300 text-xs mt-0.5">{profile?.department} · Joined {profile?.joining_date}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="text-xs text-indigo-200 flex items-center gap-1.5">
                <Mail size={12} /> {user?.email}
              </span>
              {profile?.phone && (
                <span className="text-xs text-indigo-200 flex items-center gap-1.5">
                  <Phone size={12} /> {profile.phone}
                </span>
              )}
            </div>
          </div>

          {/* Employee ID chip */}
          <div className="shrink-0 self-start sm:self-center bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center">
            <p className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold mb-0.5">Employee ID</p>
            <p className="text-sm font-mono font-bold text-white">{user?.employee_id}</p>
          </div>
        </div>

        {/* Quick stats strip */}
        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 border-t border-white/10">
          {[
            { label: "Role", value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "—" },
            { label: "Manager", value: profile?.manager?.split(" ")[0] || "—" },
            { label: "Net Pay", value: payroll ? fmt(payroll.net_salary) : "—" },
          ].map((s) => (
            <div key={s.label} className="text-center py-2.5 border-r border-white/10 last:border-r-0">
              <p className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider">{s.label}</p>
              <p className="text-sm font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact card */}
        <Card className="p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <User size={15} className="text-indigo-500" /> Contact Info
            </h3>
            {!editing ? (
              <Button size="xs" variant="ghost" onClick={() => setEditing(true)} icon={<Edit3 size={13} />}>Edit</Button>
            ) : (
              <div className="flex gap-1.5">
                <Button size="xs" variant="ghost" onClick={() => setEditing(false)}><X size={13} /></Button>
                <Button size="xs" loading={saving} onClick={handleSave} icon={<Save size={13} />}>Save</Button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} icon={<Phone size={14} />} placeholder="+1 (555) 000-0000" />
              <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} icon={<MapPin size={14} />} placeholder="Street, City, State ZIP" />
              <p className="text-[11px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">Only phone and address can be self-edited. Contact HR to update other fields.</p>
            </div>
          ) : (
            <>
              <InfoRow icon={<Mail size={15} />} label="Email Address" value={user?.email || ""} />
              <InfoRow icon={<Phone size={15} />} label="Phone" value={profile?.phone || ""} />
              <InfoRow icon={<MapPin size={15} />} label="Address" value={profile?.address || ""} />
            </>
          )}
        </Card>

        {/* Employment + Payroll */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
              <Briefcase size={15} className="text-indigo-500" /> Employment Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
              <InfoRow icon={<Building size={15} />} label="Department" value={profile?.department || ""} />
              <InfoRow icon={<Briefcase size={15} />} label="Designation" value={profile?.designation || ""} />
              <InfoRow icon={<Calendar size={15} />} label="Joining Date" value={profile?.joining_date || ""} />
              <InfoRow icon={<User size={15} />} label="Reporting Manager" value={profile?.manager || ""} />
              <InfoRow icon={<Shield size={15} />} label="Employment Type" value="Full-time" />
              <InfoRow icon={<Shield size={15} />} label="Status" value={profile?.employment_status?.replace("-", " ") || ""} />
            </div>
          </Card>

          {payroll && !isHR && (
            <Card className="p-5">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
                <span className="text-emerald-500 font-mono text-base leading-none">₹</span> Salary Overview
                <Badge variant="neutral" className="ml-auto text-[10px]">{payroll.pay_period}</Badge>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Basic", value: fmt(payroll.basic_salary), cls: "bg-slate-50 border-slate-100" },
                  { label: "Allowances", value: fmt(payroll.allowances), cls: "bg-emerald-50 border-emerald-100" },
                  { label: "Deductions", value: fmt(payroll.deductions), cls: "bg-red-50 border-red-100" },
                  { label: "Net Pay", value: fmt(payroll.net_salary), cls: "bg-indigo-50 border-indigo-100" },
                ].map((c) => (
                  <div key={c.label} className={`rounded-xl border p-3.5 ${c.cls}`}>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">{c.label}</p>
                    <p className="text-base font-bold text-slate-900 tabular-nums">{c.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
