import React, { useState } from "react";
import { Bell, Lock, Globe, Moon, Sun, User, Shield, ChevronRight, Check, Briefcase } from "lucide-react";
import { Card, Button, PageHeader, Badge } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";

interface ToggleProps { checked: boolean; onChange: (v: boolean) => void; }
function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${checked ? "bg-indigo-600" : "bg-slate-200"}`}
    >
      <span className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState({ email: true, push: true, leave: true, attendance: false, payroll: true });
  const [darkMode, setDarkMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const settingGroups = [
    {
      title: "Notifications",
      icon: <Bell size={16} className="text-indigo-500" />,
      items: [
        { key: "email", label: "Email Notifications", desc: "Receive updates to your registered email" },
        { key: "push", label: "Push Notifications", desc: "Browser push notifications for urgent alerts" },
        { key: "leave", label: "Leave Updates", desc: "Notify when leave status changes" },
        { key: "attendance", label: "Attendance Reminders", desc: "Daily check-in reminders" },
        { key: "payroll", label: "Payroll Alerts", desc: "Monthly payslip and salary notifications" },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account preferences and notifications" />

      {/* Profile summary */}
      <Card className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white text-lg font-bold">{user?.name?.[0] || "U"}</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900">{user?.name}</p>
          <p className="text-sm text-slate-400">{user?.email} · <span className="capitalize">{user?.role}</span></p>
        </div>
        <Badge variant="primary" className="capitalize">{user?.role}</Badge>
      </Card>

      {/* Notification preferences */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Bell size={16} className="text-indigo-500" />
          <h3 className="font-semibold text-slate-900">Notification Preferences</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {settingGroups[0].items.map((item) => (
            <div key={item.key} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle
                checked={notifs[item.key as keyof typeof notifs]}
                onChange={(v) => setNotifs({ ...notifs, [item.key]: v })}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Moon size={16} className="text-indigo-500" />
          <h3 className="font-semibold text-slate-900">Appearance</h3>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={18} className="text-slate-500" /> : <Sun size={18} className="text-amber-500" />}
            <div>
              <p className="text-sm font-medium text-slate-800">Dark Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">Switch to dark theme (full dark mode coming soon)</p>
            </div>
          </div>
          <Toggle checked={darkMode} onChange={setDarkMode} />
        </div>
      </Card>

      {/* Security */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Lock size={16} className="text-indigo-500" />
          <h3 className="font-semibold text-slate-900">Security</h3>
        </div>
        {[
          { label: "Change Password", desc: "Update your account password", icon: <Lock size={15} /> },
          { label: "Two-Factor Authentication", desc: "Add an extra layer of security", icon: <Shield size={15} /> },
          { label: "Active Sessions", desc: "View and manage login sessions", icon: <Globe size={15} /> },
        ].map((item) => (
          <button key={item.label} className="flex items-center gap-3 w-full px-5 py-4 text-left border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
            <span className="text-slate-400">{item.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
            </div>
            <ChevronRight size={15} className="text-slate-300" />
          </button>
        ))}
      </Card>

      {/* Account danger zone */}
      <Card className="border-red-100">
        <div className="px-5 py-4 border-b border-red-50 flex items-center gap-2">
          <User size={16} className="text-red-400" />
          <h3 className="font-semibold text-red-700">Account</h3>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-800">Deactivate Account</p>
            <p className="text-xs text-slate-400 mt-0.5">Temporarily disable your Dayflow account</p>
          </div>
          <Button size="sm" variant="danger">Deactivate</Button>
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} icon={saved ? <Check size={14} /> : undefined} className={saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
          {saved ? "Saved!" : "Save Preferences"}
        </Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Briefcase size={12} />
        <span>Dayflow HRMS v2.4.1 · © 2026 Dayflow Inc.</span>
      </div>
    </div>
  );
}
