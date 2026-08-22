import React, { useState, useEffect } from "react";
import { IndianRupee, TrendingDown, TrendingUp, Download, Printer, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { Card, Badge, Skeleton, StatCard, Button, toast } from "@/components/ui";
import type { Payroll as PayrollType } from "@/data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TREND_DATA = [
  { month: "Mar", net: 6100 },
  { month: "Apr", net: 6200 },
  { month: "May", net: 6000 },
  { month: "Jun", net: 6250 },
  { month: "Jul", net: 6180 },
  { month: "Aug", net: 6300 },
];

export default function Payroll() {
  const { user } = useAuth();
  const [payroll, setPayroll] = useState<PayrollType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const p = await api.getMyPayroll(user.id);
        setPayroll(p);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const fmt = (n: number) => `₹${n.toLocaleString()}`;

  const handleDownload = () => {
    toast("Payslip download would generate a PDF in production", "info");
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-slide">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!payroll) {
    return <div className="text-center py-16 text-slate-500">No payroll data available.</div>;
  }

  const trendData = TREND_DATA.map((d, i) => ({
    ...d,
    net: i === TREND_DATA.length - 1 ? payroll.net_salary : Math.round(payroll.net_salary * (0.92 + i * 0.015)),
  }));

  const earnings = [
    { label: "Basic Salary", amount: payroll.basic_salary },
    { label: "House Rent Allowance", amount: Math.round(payroll.allowances * 0.5) },
    { label: "Transport Allowance", amount: Math.round(payroll.allowances * 0.3) },
    { label: "Medical Allowance", amount: Math.round(payroll.allowances * 0.2) },
  ];
  const deductions = [
    { label: "Income Tax (TDS)", amount: Math.round(payroll.deductions * 0.5) },
    { label: "Social Security", amount: Math.round(payroll.deductions * 0.3) },
    { label: "Health Insurance", amount: Math.round(payroll.deductions * 0.2) },
  ];

  return (
    <div className="space-y-6 animate-fade-slide">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Payroll</h1>
          <p className="text-sm text-slate-500 mt-0.5">Salary breakdown and payment history</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={<Printer size={14} />} onClick={handleDownload}>Print</Button>
          <Button size="sm" variant="primary" icon={<Download size={14} />} onClick={handleDownload}>Download PDF</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger animate-fade-slide">
        <StatCard title="Basic Salary" value={fmt(payroll.basic_salary)} icon={<IndianRupee size={18} />} color="indigo" />
        <StatCard title="Allowances" value={fmt(payroll.allowances)} icon={<TrendingUp size={18} />} color="emerald" />
        <StatCard title="Deductions" value={fmt(payroll.deductions)} icon={<TrendingDown size={18} />} color="red" />
        <StatCard title="Net Pay" value={fmt(payroll.net_salary)} subtitle="This month" icon={<IndianRupee size={18} />} color="blue" />
      </div>

      {/* Payslip */}
      <Card className="overflow-hidden shadow-md">
        {/* Payslip header */}
        <div className="relative bg-gradient-to-r from-indigo-700 to-indigo-800 px-6 py-6 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 right-20 w-24 h-24 bg-indigo-500/20 rounded-full" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
                <Briefcase size={18} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white tracking-tight">DAYFLOW</p>
                <p className="text-indigo-200 text-xs">Official Payslip · Confidential</p>
              </div>
            </div>
            <Badge variant="neutral" className="bg-white/15 text-white ring-white/25 self-start sm:self-auto">
              Pay Period: {payroll.pay_period}
            </Badge>
          </div>
        </div>

        {/* Employee details */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {[
              { label: "Employee Name", value: user?.name || "" },
              { label: "Employee ID", value: user?.employee_id || "", mono: true },
              { label: "Pay Date", value: payroll.updated_at },
              { label: "Bank Account", value: "****-****-7654" },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">{f.label}</p>
                <p className={`text-sm font-semibold text-slate-900 ${f.mono ? "font-mono" : ""}`}>{f.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings / Deductions */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Earnings */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-emerald-100">
                <div className="w-2 h-4 bg-emerald-500 rounded-full" />
                <h3 className="text-sm font-bold text-slate-800">Earnings</h3>
              </div>
              <div className="space-y-3">
                {earnings.map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-1 group">
                    <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{row.label}</span>
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">{fmt(row.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-emerald-100">
                  <span className="text-sm font-bold text-emerald-700">Gross Earnings</span>
                  <span className="text-sm font-bold text-emerald-700 tabular-nums">{fmt(payroll.basic_salary + payroll.allowances)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-red-100">
                <div className="w-2 h-4 bg-red-400 rounded-full" />
                <h3 className="text-sm font-bold text-slate-800">Deductions</h3>
              </div>
              <div className="space-y-3">
                {deductions.map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-1 group">
                    <span className="text-sm text-slate-600">{row.label}</span>
                    <span className="text-sm font-semibold text-red-500 tabular-nums">({fmt(row.amount)})</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-red-100">
                  <span className="text-sm font-bold text-red-700">Total Deductions</span>
                  <span className="text-sm font-bold text-red-700 tabular-nums">({fmt(payroll.deductions)})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-indigo-700">Net Pay (Take Home)</p>
                <p className="text-xs text-indigo-400 mt-0.5">Credited to your registered bank account</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-indigo-700 tabular-nums">{fmt(payroll.net_salary)}</p>
                <p className="text-xs text-indigo-400">per month</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center mt-5">
            This is a computer-generated payslip and does not require a physical signature. For queries, contact{" "}
            <span className="text-indigo-500 font-medium">hr@dayflow.io</span>
          </p>
        </div>
      </Card>

      {/* Net Pay Trend */}
      <Card className="p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Net Pay Trend (6 Months)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Net Pay"]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2} fill="url(#netGrad)" dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
