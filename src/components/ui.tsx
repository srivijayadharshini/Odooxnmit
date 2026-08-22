import React, {
  type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, forwardRef,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

// ─── Badge ────────────────────────────────────────────────────────
export type BadgeVariant = "success" | "danger" | "warning" | "info" | "neutral" | "primary";
const BADGE_STYLES: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  danger:  "bg-red-50 text-red-700 ring-red-200/70",
  warning: "bg-amber-50 text-amber-700 ring-amber-200/70",
  info:    "bg-blue-50 text-blue-700 ring-blue-200/70",
  neutral: "bg-slate-100 text-slate-600 ring-slate-200/70",
  primary: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
};
export function Badge({ variant = "neutral", children, className = "" }: { variant?: BadgeVariant; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${BADGE_STYLES[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────
export function Card({ children, className = "", onClick, hover = false }: { children: ReactNode; className?: string; onClick?: () => void; hover?: boolean }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm ${onClick || hover ? "cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all duration-200" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
const BTN_STYLES: Record<BtnVariant, string> = {
  primary:   "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm ring-1 ring-indigo-700/20",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
  ghost:     "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger:    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
  success:   "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  outline:   "bg-transparent text-indigo-600 border border-indigo-200 hover:bg-indigo-50",
};
const BTN_SIZES: Record<string, string> = {
  xs: "px-2.5 py-1 text-xs gap-1",
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-1.5",
  lg: "px-5 py-2.5 text-sm gap-2",
  xl: "px-6 py-3 text-base gap-2",
};
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}
export function Button({ variant = "primary", size = "md", loading, icon, iconRight, children, className = "", disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none ${BTN_STYLES[variant]} ${BTN_SIZES[size]} ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? <span className="shrink-0">{icon}</span> : null}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, icon, rightElement, className = "", ...props }, ref) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
    <div className="relative group">
      {icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:opacity-50 disabled:bg-slate-50 ${error ? "border-red-400 focus:ring-red-500/30 focus:border-red-400" : "border-slate-200 hover:border-slate-300"} ${icon ? "pl-10" : "pl-3.5"} ${rightElement ? "pr-10" : "pr-3.5"} py-2.5 ${className}`}
      />
      {rightElement && <span className="absolute inset-y-0 right-0 flex items-center pr-3">{rightElement}</span>}
    </div>
    {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} /> {error}</p>}
    {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
));
Input.displayName = "Input";

// ─── Textarea ─────────────────────────────────────────────────────
export function Textarea({ label, error, rows = 3, className = "", ...props }: { label?: string; error?: string; rows?: number; className?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <textarea rows={rows} {...props} className={`w-full rounded-xl border border-slate-200 hover:border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none ${error ? "border-red-400" : ""} ${className}`} />
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} /> {error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────
export function Select({ label, error, children, className = "", ...props }: { label?: string; error?: string; className?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <select {...props} className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 cursor-pointer ${error ? "border-red-400" : "border-slate-200 hover:border-slate-300"} ${className}`}>
        {children}
      </select>
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} /> {error}</p>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = "md", description }: { open: boolean; onClose: () => void; title?: string; description?: string; children: ReactNode; size?: "sm" | "md" | "lg" | "xl" }) {
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} bg-white rounded-2xl shadow-2xl animate-scale overflow-hidden`}>
        {title && (
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">{title}</h2>
              {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100 -mr-1 ml-3 shrink-0">
              <X size={15} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────
const STAT_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  indigo:  { bg: "bg-indigo-50",  icon: "text-indigo-600",  border: "border-indigo-100" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
  amber:   { bg: "bg-amber-50",   icon: "text-amber-600",   border: "border-amber-100" },
  red:     { bg: "bg-red-50",     icon: "text-red-600",     border: "border-red-100" },
  blue:    { bg: "bg-blue-50",    icon: "text-blue-600",    border: "border-blue-100" },
  violet:  { bg: "bg-violet-50",  icon: "text-violet-600",  border: "border-violet-100" },
  slate:   { bg: "bg-slate-100",  icon: "text-slate-600",   border: "border-slate-200" },
};
export function StatCard({ title, value, subtitle, icon, trend, color = "indigo" }: { title: string; value: string | number; subtitle?: string; icon?: ReactNode; trend?: { value: string; up: boolean }; color?: string }) {
  const c = STAT_COLORS[color] || STAT_COLORS.indigo;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight" style={{ fontVariantNumeric: "tabular-nums" }}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-semibold flex items-center gap-1 mt-1.5 ${trend.up ? "text-emerald-600" : "text-red-500"}`}>
              {trend.up ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        {icon && <div className={`p-2.5 rounded-xl border ${c.bg} ${c.icon} ${c.border} shrink-0`}>{icon}</div>}
      </div>
    </Card>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />;
}

// ─── EmptyState ───────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 p-4 bg-slate-50 rounded-2xl text-slate-300">{icon}</div>}
      <h3 className="text-base font-bold text-slate-700">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1.5 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info" | "warning";
let _toastCb: ((msg: string, type: ToastType) => void) | null = null;
export const setToastCallback = (cb: typeof _toastCb) => { _toastCb = cb; };
export const toast = (msg: string, type: ToastType = "info") => { _toastCb?.(msg, type); };

const TOAST_STYLES: Record<ToastType, { bar: string; bg: string; icon: ReactNode }> = {
  success: { bar: "bg-emerald-500", bg: "bg-white border-slate-200", icon: <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> },
  error:   { bar: "bg-red-500",     bg: "bg-white border-slate-200", icon: <AlertCircle  size={16} className="text-red-500 shrink-0" /> },
  warning: { bar: "bg-amber-400",   bg: "bg-white border-slate-200", icon: <AlertCircle  size={16} className="text-amber-500 shrink-0" /> },
  info:    { bar: "bg-indigo-500",  bg: "bg-white border-slate-200", icon: <Info         size={16} className="text-indigo-500 shrink-0" /> },
};

export function ToastContainer() {
  const [toasts, setToasts] = React.useState<Array<{ id: number; msg: string; type: ToastType }>>([]);
  React.useEffect(() => {
    setToastCallback((msg, type) => {
      const id = Date.now();
      setToasts((p) => [...p, { id, msg, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
    });
  }, []);
  return (
    <div className="fixed bottom-20 lg:bottom-5 right-4 z-[100] space-y-2.5 pointer-events-none" role="alert" aria-live="polite">
      {toasts.map((t) => {
        const s = TOAST_STYLES[t.type];
        return (
          <div key={t.id} className={`flex items-center gap-3 min-w-72 max-w-sm border rounded-2xl shadow-lg px-4 py-3 pointer-events-auto ${s.bg}`}>
            <div className={`w-1 h-8 rounded-full shrink-0 ${s.bar}`} />
            {s.icon}
            <p className="text-sm font-semibold text-slate-800 flex-1">{t.msg}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────
const AVATAR_COLORS = ["bg-indigo-600", "bg-violet-600", "bg-blue-600", "bg-emerald-600", "bg-amber-600", "bg-rose-600", "bg-cyan-600"];
function nameToColor(name: string) {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
const AVATAR_SIZES: Record<string, string> = {
  xs: "w-6 h-6 text-[9px]", sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-sm", xl: "w-16 h-16 text-base", "2xl": "w-20 h-20 text-lg",
};
export function Avatar({ src, name, size = "md", ring = false }: { src?: string; name: string; size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl"; ring?: boolean }) {
  const initials = name.split(" ").map((n) => n[0] || "").slice(0, 2).join("").toUpperCase();
  const s = AVATAR_SIZES[size] || AVATAR_SIZES.md;
  const r = ring ? "ring-2 ring-white ring-offset-1" : "";
  if (src) return <img src={src} alt={name} className={`${s} rounded-full object-cover shrink-0 ${r}`} />;
  return (
    <div className={`${s} ${nameToColor(name)} text-white rounded-full flex items-center justify-center font-bold shrink-0 ${r}`}>
      {initials}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action, back }: { title: string; subtitle?: string; action?: ReactNode; back?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {back && <div className="mb-1.5">{back}</div>}
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}

// ─── AttendanceBadge ──────────────────────────────────────────────
export function AttendanceBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = { present: "success", absent: "danger", "half-day": "warning", leave: "info" };
  return <Badge variant={map[status] || "neutral"}>{status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>;
}

// ─── LeaveStatusBadge ─────────────────────────────────────────────
export function LeaveStatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = { approved: "success", rejected: "danger", pending: "warning" };
  return <Badge variant={map[status] || "neutral"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}

// ─── ConfirmDialog ────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", variant = "danger" }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; variant?: "danger" | "primary" }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="space-y-4 text-center">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${variant === "danger" ? "bg-red-50" : "bg-indigo-50"}`}>
          {variant === "danger" ? <AlertCircle size={22} className="text-red-500" /> : <Info size={22} className="text-indigo-500" />}
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2 justify-center pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={variant === "danger" ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────
export function InfoRow({ icon, label, value, mono = false }: { icon?: ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      {icon && <span className="text-slate-400 mt-0.5 shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-sm font-medium text-slate-900 break-words ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
      </div>
    </div>
  );
}
