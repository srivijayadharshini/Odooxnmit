import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Input, Button } from "@/components/ui";

const FEATURES = [
  "Real-time attendance tracking",
  "Leave management & approvals",
  "Payroll transparency",
  "HR analytics & insights",
];

const DEMO_ACCOUNTS = [
  { label: "Admin", sublabel: "Full access", email: "sarah@dayflow.io", password: "Admin@1234", color: "bg-indigo-600" },
  { label: "HR", sublabel: "HR Manager", email: "hr@dayflow.io", password: "Hr@12345", color: "bg-violet-600" },
  { label: "Employee", sublabel: "Staff view", email: "emily@dayflow.io", password: "Emp@1234", color: "bg-blue-600" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.password) errs.password = "Password is required";
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
      const res = await api.login(form.email, form.password);
      login(res.user as Parameters<typeof login>[0], res.access_token);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ─── Left panel ─── */}
      <div className="hidden lg:flex flex-col flex-1 bg-[#1e1b4b] relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-80 h-80 bg-violet-700/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
              <Briefcase size={20} className="text-indigo-300" />
            </div>
            <div>
              <span className="text-white font-bold text-lg tracking-tight">DAYFLOW</span>
              <p className="text-indigo-300/70 text-xs">Human Resource Management</p>
            </div>
          </div>

          {/* Hero content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-500/30 mb-6">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                HR Platform
              </div>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                Every workday,<br />
                <span className="text-indigo-300">perfectly aligned.</span>
              </h1>
              <p className="text-indigo-200/70 text-base leading-relaxed max-w-sm">
                The modern HRMS that keeps your workforce organized, engaged, and on track — from Day 1.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3 mb-10">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={12} className="text-indigo-300" />
                  </div>
                  <span className="text-indigo-100/80 text-sm">{f}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 border-t border-white/10 pt-6">
              <div className="flex -space-x-2">
                {["?name=S+M", "?name=J+C", "?name=E+J", "?name=M+C"].map((q, i) => (
                  <img
                    key={i}
                    src={`https://ui-avatars.com/api/${q}&background=4338ca&color=fff&size=32`}
                    alt="User"
                    className="w-8 h-8 rounded-full ring-2 ring-indigo-900"
                  />
                ))}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Trusted by teams</p>
                <p className="text-indigo-300/60 text-xs">12 employees across 7 departments</p>
              </div>
            </div>
          </div>

          <p className="text-indigo-400/50 text-xs">© 2026 Dayflow Inc. · Privacy · Terms</p>
        </div>
      </div>

      {/* ─── Right panel ─── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white lg:max-w-lg xl:max-w-xl">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Briefcase size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight">DAYFLOW</span>
              <p className="text-[10px] text-slate-400">Every workday, perfectly aligned.</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Sign in to Dayflow</h2>
            <p className="text-slate-500 text-sm mt-1.5">Welcome back — pick up where you left off.</p>
          </div>

          {/* Demo accounts */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">Quick Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  onClick={() => setForm({ ...form, email: acc.email, password: acc.password })}
                  className="group flex flex-col items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-2.5 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-center"
                >
                  <span className={`w-7 h-7 ${acc.color} rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}>
                    {acc.label[0]}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-700">{acc.label}</span>
                  <span className="text-[10px] text-slate-400">{acc.sublabel}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400 font-medium">or sign in with email</span></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <span className="text-red-500 shrink-0">⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@dayflow.io"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              icon={<Mail size={16} />}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              icon={<Lock size={16} />}
              error={errors.password}
              autoComplete="current-password"
              rightElement={
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full justify-center"
              icon={!loading ? <ArrowRight size={16} /> : undefined}
            >
              Sign In
            </Button>
          </form>

          <p className="text-sm text-center text-slate-500">
            New to Dayflow?{" "}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
