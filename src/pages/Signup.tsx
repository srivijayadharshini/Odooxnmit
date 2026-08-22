import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Badge as BadgeIcon } from "lucide-react";
import { api } from "@/services/api";
import { Input, Button, Select } from "@/components/ui";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Lowercase", ok: /[a-z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Special char", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const strength = passed <= 1 ? "Weak" : passed <= 3 ? "Fair" : passed === 4 ? "Good" : "Strong";
  const colors = { Weak: "bg-red-500", Fair: "bg-amber-500", Good: "bg-blue-500", Strong: "bg-emerald-500" };
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= passed ? colors[strength] : "bg-slate-200"} transition-all`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${passed < 3 ? "text-red-600" : passed < 5 ? "text-amber-600" : "text-emerald-600"}`}>{strength}</span>
        <div className="flex gap-3">
          {checks.map((c) => (
            <span key={c.label} className={`text-[11px] ${c.ok ? "text-emerald-600" : "text-slate-400"}`}>
              {c.ok ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ employee_id: "", name: "", email: "", password: "", confirm_password: "", role: "employee", terms: false });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.employee_id) errs.employee_id = "Employee ID is required";
    if (!form.name || form.name.length < 2) errs.name = "Full name is required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Valid email is required";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(form.password)) errs.password = "Password must meet all requirements";
    if (form.password !== form.confirm_password) errs.confirm_password = "Passwords do not match";
    if (!form.terms) errs.terms = "You must accept the terms";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setError("");
    try {
      await api.signup({ employee_id: form.employee_id, name: form.name, email: form.email, password: form.password, role: form.role });
      navigate("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Briefcase size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-tight">DAYFLOW</span>
            <p className="text-xs text-slate-400">Create your account</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
          <p className="text-slate-500 text-sm mt-1">Join your organization&apos;s Dayflow workspace</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">⚠ {error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              placeholder="EMP013"
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              icon={<BadgeIcon size={16} />}
              error={errors.employee_id}
            />
            <Select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          <Input
            label="Full Name"
            placeholder="Jane Smith"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            icon={<User size={16} />}
            error={errors.name}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@dayflow.io"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            icon={<Mail size={16} />}
            error={errors.email}
          />

          <div>
            <Input
              label="Password"
              type={showPwd ? "text" : "password"}
              placeholder="Create a strong password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              icon={<Lock size={16} />}
              error={errors.password}
              rightElement={
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            {form.password && <PasswordStrength password={form.password} />}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            value={form.confirm_password}
            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            icon={<Lock size={16} />}
            error={errors.confirm_password}
          />

          <div className="space-y-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-600">
                I agree to the{" "}
                <button type="button" className="text-indigo-600 hover:underline">Terms of Service</button>
                {" "}and{" "}
                <button type="button" className="text-indigo-600 hover:underline">Privacy Policy</button>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-600">{errors.terms}</p>}
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full justify-center">
            Create Account
          </Button>
        </form>

        <p className="text-sm text-center text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
