import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Avatar } from "@/components/ui";
import {
  LayoutDashboard, Users, Clock, Calendar, DollarSign, BarChart3,
  Bell, Settings, LogOut, Menu, X, ChevronRight, Briefcase, FileText,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  hrOnly?: boolean;
  employeeOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard size={18} />, label: "Dashboard", to: "/dashboard" },
  { icon: <Users size={18} />, label: "Employees", to: "/employees", hrOnly: true },
  { icon: <Clock size={18} />, label: "Attendance", to: "/attendance" },
  { icon: <Calendar size={18} />, label: "Leave", to: "/leave" },
  { icon: <DollarSign size={18} />, label: "Payroll", to: "/payroll" },
  { icon: <FileText size={18} />, label: "Documents", to: "/documents", employeeOnly: true },
  { icon: <BarChart3 size={18} />, label: "Reports", to: "/reports", hrOnly: true },
  { icon: <Bell size={18} />, label: "Notifications", to: "/notifications" },
];

// Mobile bottom nav items (condensed)
const MOBILE_NAV: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: "Home", to: "/dashboard" },
  { icon: <Clock size={20} />, label: "Attendance", to: "/attendance" },
  { icon: <Calendar size={20} />, label: "Leave", to: "/leave" },
  { icon: <Bell size={20} />, label: "Alerts", to: "/notifications" },
  { icon: <Users size={20} />, label: "More", to: "/profile" },
];

function SidebarContent({ unreadCount, onClose }: { unreadCount: number; onClose?: () => void }) {
  const { user, logout, isHR } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose?.();
  };

  const filteredNav = NAV_ITEMS.filter((item) => {
    if (item.hrOnly) return isHR;
    if (item.employeeOnly) return !isHR;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100/80 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
            <Briefcase size={15} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">DAYFLOW</span>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5 font-medium">Every workday, aligned.</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 lg:hidden transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-600 rounded-r-full" />}
                <span className={`transition-colors ${isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-3 space-y-0.5 shrink-0">
        <button
          onClick={() => { navigate("/settings"); onClose?.(); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <Settings size={18} className="text-slate-400" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} className="text-slate-400" />
          Log Out
        </button>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1.5 rounded-xl bg-slate-50 border border-slate-100">
          <Avatar src={user?.profile_picture} name={user?.name || "U"} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate capitalize">{user?.employee_id} · {user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/attendance": "Attendance",
  "/leave": "Leave",
  "/payroll": "Payroll",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/profile": "My Profile",
  "/documents": "Documents",
  "/settings": "Settings",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? "Dayflow";

  return (
    <div className="flex h-full bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-100 shrink-0 fixed inset-y-0 left-0 z-30 shadow-sm">
        <SidebarContent unreadCount={unreadCount} />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white shadow-2xl h-full flex flex-col">
            <SidebarContent unreadCount={unreadCount} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-60 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 lg:px-6 h-14 flex items-center justify-between shadow-[0_1px_0_0_rgb(226,232,240)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            {/* Mobile brand */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
                <Briefcase size={12} className="text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900">DAYFLOW</span>
            </div>
            <h2 className="hidden lg:block text-sm font-semibold text-slate-900">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 ml-1 hover:opacity-85 transition-opacity"
              aria-label="Profile"
            >
              <Avatar src={user?.profile_picture} name={user?.name || "U"} size="sm" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-lg">
          <div className="flex items-center justify-around h-16 px-2">
            {MOBILE_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                    isActive ? "text-indigo-600" : "text-slate-400"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`relative transition-transform ${isActive ? "scale-110" : ""}`}>
                      {item.icon}
                      {item.label === "Alerts" && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? "9" : unreadCount}
                        </span>
                      )}
                    </span>
                    <span className={`text-[10px] font-medium ${isActive ? "text-indigo-600" : "text-slate-400"}`}>
                      {item.label}
                    </span>
                    {isActive && <span className="w-1 h-1 bg-indigo-600 rounded-full" />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
