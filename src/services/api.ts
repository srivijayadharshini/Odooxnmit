import {
  USERS, PROFILES, ATTENDANCE_DATA, LEAVE_REQUESTS, PAYROLL_DATA,
  NOTIFICATIONS, LEAVE_BALANCES,
  type User, type EmployeeProfile, type Attendance, type LeaveRequest,
  type Payroll, type Notification, type LeaveBalance, type LeaveType,
} from "@/data/mockData";

// Mutable in-memory store (initialized from mock data)
let users = [...USERS];
let profiles = [...PROFILES];
let attendances = [...ATTENDANCE_DATA];
let leaveRequests = [...LEAVE_REQUESTS];
let payrolls = [...PAYROLL_DATA];
let notifications = [...NOTIFICATIONS];
let leaveBalances = [...LEAVE_BALANCES];
let nextId = { user: 13, profile: 13, attendance: 10000, leave: 9, payroll: 13, notification: 13 };

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const api = {
  // Auth
  async login(email: string, password: string) {
    await delay(600);
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid email or password.");
    const profile = profiles.find((p) => p.user_id === user.id);
    return {
      access_token: btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 })),
      user: { id: user.id, employee_id: user.employee_id, name: user.name, email: user.email, role: user.role, profile_picture: profile?.profile_picture || "" },
    };
  },

  async signup(data: { employee_id: string; name: string; email: string; password: string; role: string }) {
    await delay(800);
    if (users.find((u) => u.email === data.email)) throw new Error("Email already registered.");
    if (users.find((u) => u.employee_id === data.employee_id)) throw new Error("Employee ID already exists.");
    const newUser: User = {
      id: nextId.user++,
      employee_id: data.employee_id,
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as User["role"],
      created_at: new Date().toISOString().split("T")[0],
    };
    users.push(newUser);
    const newProfile: EmployeeProfile = {
      id: nextId.profile++,
      user_id: newUser.id,
      full_name: data.name,
      phone: "",
      address: "",
      profile_picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=4338ca&color=fff&size=200`,
      department: "Unassigned",
      designation: "New Employee",
      joining_date: new Date().toISOString().split("T")[0],
      employment_status: "active",
      manager: "TBD",
    };
    profiles.push(newProfile);
    payrolls.push({ id: nextId.payroll++, employee_id: newUser.id, basic_salary: 60000, allowances: 5000, deductions: 6000, net_salary: 59000, pay_period: "2026-08", updated_at: new Date().toISOString().split("T")[0] });
    leaveBalances.push({ employee_id: newUser.id, paid: 12, sick: 8, unpaid: 10 });
    return { message: "Account created successfully." };
  },

  // Profile
  async getProfile(userId: number) {
    await delay(300);
    const user = users.find((u) => u.id === userId);
    const profile = profiles.find((p) => p.user_id === userId);
    if (!user || !profile) throw new Error("Profile not found.");
    return { user, profile };
  },

  async updateProfile(userId: number, data: Partial<EmployeeProfile>) {
    await delay(500);
    const idx = profiles.findIndex((p) => p.user_id === userId);
    if (idx === -1) throw new Error("Profile not found.");
    profiles[idx] = { ...profiles[idx], ...data };
    return profiles[idx];
  },

  // Employees (HR/Admin)
  async getEmployees() {
    await delay(400);
    return users.map((u) => {
      const p = profiles.find((pr) => pr.user_id === u.id);
      return { ...u, profile: p };
    });
  },

  async getEmployee(id: number) {
    await delay(300);
    const user = users.find((u) => u.id === id);
    const profile = profiles.find((p) => p.user_id === id);
    const payroll = payrolls.find((py) => py.employee_id === id);
    const balance = leaveBalances.find((lb) => lb.employee_id === id);
    const empAttendance = attendances.filter((a) => a.employee_id === id);
    const empLeaves = leaveRequests.filter((l) => l.employee_id === id);
    if (!user) throw new Error("Employee not found.");
    return { user, profile, payroll, balance, attendance: empAttendance, leaves: empLeaves };
  },

  async addEmployee(data: { employee_id: string; name: string; email: string; department: string; designation: string; joining_date: string; role: string }) {
    await delay(600);
    if (users.find((u) => u.email === data.email)) throw new Error("Email already exists.");
    if (users.find((u) => u.employee_id === data.employee_id)) throw new Error("Employee ID exists.");
    const newUser: User = { id: nextId.user++, employee_id: data.employee_id, name: data.name, email: data.email, password: "Dayflow@123", role: data.role as User["role"], created_at: new Date().toISOString().split("T")[0] };
    users.push(newUser);
    const newProfile: EmployeeProfile = { id: nextId.profile++, user_id: newUser.id, full_name: data.name, phone: "", address: "", profile_picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=4338ca&color=fff&size=200`, department: data.department, designation: data.designation, joining_date: data.joining_date, employment_status: "active", manager: "" };
    profiles.push(newProfile);
    payrolls.push({ id: nextId.payroll++, employee_id: newUser.id, basic_salary: 60000, allowances: 5000, deductions: 6000, net_salary: 59000, pay_period: "2026-08", updated_at: new Date().toISOString().split("T")[0] });
    leaveBalances.push({ employee_id: newUser.id, paid: 12, sick: 8, unpaid: 10 });
    return newUser;
  },

  async updateEmployee(id: number, data: Partial<EmployeeProfile & { name: string; role: string }>) {
    await delay(500);
    const pIdx = profiles.findIndex((p) => p.user_id === id);
    if (pIdx !== -1) profiles[pIdx] = { ...profiles[pIdx], ...data };
    const uIdx = users.findIndex((u) => u.id === id);
    if (uIdx !== -1 && data.name) users[uIdx] = { ...users[uIdx], name: data.name };
    return profiles[pIdx];
  },

  // Attendance
  async getMyAttendance(userId: number) {
    await delay(300);
    return attendances.filter((a) => a.employee_id === userId).sort((a, b) => b.date.localeCompare(a.date));
  },

  async getAllAttendance(filters?: { date?: string; department?: string; employee_id?: number }) {
    await delay(400);
    let result = [...attendances];
    if (filters?.date) result = result.filter((a) => a.date === filters.date);
    if (filters?.employee_id) result = result.filter((a) => a.employee_id === filters.employee_id);
    if (filters?.department) {
      const deptUsers = profiles.filter((p) => p.department === filters.department).map((p) => p.user_id);
      result = result.filter((a) => deptUsers.includes(a.employee_id));
    }
    return result.sort((a, b) => b.date.localeCompare(a.date));
  },

  async checkIn(userId: number) {
    await delay(400);
    const today = new Date().toISOString().split("T")[0];
    const existing = attendances.find((a) => a.employee_id === userId && a.date === today);
    if (existing?.check_in) throw new Error("Already checked in today.");
    const time = new Date().toTimeString().slice(0, 5);
    if (existing) {
      existing.check_in = time;
      existing.status = "present";
    } else {
      attendances.push({ id: nextId.attendance++, employee_id: userId, date: today, check_in: time, check_out: null, working_hours: null, status: "present" });
    }
    // Notification
    notifications.push({ id: nextId.notification++, user_id: userId, title: "Attendance Recorded", message: `Check-in recorded at ${time}.`, type: "attendance", is_read: false, created_at: today });
    return { time };
  },

  async checkOut(userId: number) {
    await delay(400);
    const today = new Date().toISOString().split("T")[0];
    const record = attendances.find((a) => a.employee_id === userId && a.date === today);
    if (!record?.check_in) throw new Error("You haven't checked in today.");
    if (record.check_out) throw new Error("Already checked out today.");
    const time = new Date().toTimeString().slice(0, 5);
    const [inH, inM] = record.check_in.split(":").map(Number);
    const [outH, outM] = time.split(":").map(Number);
    const hours = parseFloat(((outH * 60 + outM - (inH * 60 + inM)) / 60).toFixed(1));
    record.check_out = time;
    record.working_hours = hours;
    return { time, working_hours: hours };
  },

  async getTodayAttendance(userId: number) {
    await delay(200);
    const today = new Date().toISOString().split("T")[0];
    return attendances.find((a) => a.employee_id === userId && a.date === today) || null;
  },

  // Leave
  async getMyLeaves(userId: number) {
    await delay(300);
    return leaveRequests.filter((l) => l.employee_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async getAllLeaves() {
    await delay(300);
    return leaveRequests.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async applyLeave(userId: number, data: { leave_type: LeaveType; start_date: string; end_date: string; reason: string; remarks: string }) {
    await delay(600);
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    if (end < start) throw new Error("End date cannot be before start date.");
    const duration = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
    const bal = leaveBalances.find((lb) => lb.employee_id === userId);
    if (bal) {
      if (data.leave_type === "paid" && bal.paid < duration) throw new Error("Insufficient paid leave balance.");
      if (data.leave_type === "sick" && bal.sick < duration) throw new Error("Insufficient sick leave balance.");
    }
    const today = new Date().toISOString().split("T")[0];
    const newLeave: LeaveRequest = { id: nextId.leave++, employee_id: userId, leave_type: data.leave_type, start_date: data.start_date, end_date: data.end_date, duration, reason: data.reason, remarks: data.remarks, status: "pending", approved_by: null, created_at: today, updated_at: today };
    leaveRequests.push(newLeave);
    notifications.push({ id: nextId.notification++, user_id: userId, title: "Leave Request Submitted", message: `Your ${data.leave_type} leave request for ${data.start_date} to ${data.end_date} is pending approval.`, type: "leave", is_read: false, created_at: today });
    // Notify HR (user_id 2)
    notifications.push({ id: nextId.notification++, user_id: 2, title: "New Leave Request", message: `A new leave request has been submitted and requires your review.`, type: "leave", is_read: false, created_at: today });
    return newLeave;
  },

  async approveLeave(leaveId: number, approverName: string, approverId: number) {
    await delay(500);
    const leave = leaveRequests.find((l) => l.id === leaveId);
    if (!leave) throw new Error("Leave request not found.");
    leave.status = "approved";
    leave.approved_by = approverName;
    leave.updated_at = new Date().toISOString().split("T")[0];
    // Deduct balance
    const bal = leaveBalances.find((lb) => lb.employee_id === leave.employee_id);
    if (bal) {
      if (leave.leave_type === "paid") bal.paid -= leave.duration;
      else if (leave.leave_type === "sick") bal.sick -= leave.duration;
    }
    notifications.push({ id: nextId.notification++, user_id: leave.employee_id, title: "Leave Approved", message: `Your ${leave.leave_type} leave request for ${leave.start_date} to ${leave.end_date} has been approved by ${approverName}.`, type: "leave", is_read: false, created_at: new Date().toISOString().split("T")[0] });
    return leave;
  },

  async rejectLeave(leaveId: number, approverName: string, rejection_reason: string) {
    await delay(500);
    const leave = leaveRequests.find((l) => l.id === leaveId);
    if (!leave) throw new Error("Leave request not found.");
    leave.status = "rejected";
    leave.approved_by = approverName;
    leave.rejection_reason = rejection_reason;
    leave.updated_at = new Date().toISOString().split("T")[0];
    notifications.push({ id: nextId.notification++, user_id: leave.employee_id, title: "Leave Rejected", message: `Your ${leave.leave_type} leave request has been rejected. Reason: ${rejection_reason}`, type: "leave", is_read: false, created_at: new Date().toISOString().split("T")[0] });
    return leave;
  },

  // Payroll
  async getMyPayroll(userId: number) {
    await delay(300);
    return payrolls.find((p) => p.employee_id === userId) || null;
  },

  async getAllPayroll() {
    await delay(400);
    return payrolls.map((p) => {
      const u = users.find((u) => u.id === p.employee_id);
      const pr = profiles.find((pr) => pr.user_id === p.employee_id);
      return { ...p, user: u, profile: pr };
    });
  },

  async updatePayroll(employeeId: number, data: Partial<Payroll>) {
    await delay(500);
    const idx = payrolls.findIndex((p) => p.employee_id === employeeId);
    if (idx === -1) throw new Error("Payroll not found.");
    const net = (data.basic_salary ?? payrolls[idx].basic_salary) + (data.allowances ?? payrolls[idx].allowances) - (data.deductions ?? payrolls[idx].deductions);
    payrolls[idx] = { ...payrolls[idx], ...data, net_salary: net, updated_at: new Date().toISOString().split("T")[0] };
    return payrolls[idx];
  },

  // Notifications
  async getNotifications(userId: number) {
    await delay(200);
    return notifications.filter((n) => n.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async markNotificationRead(notificationId: number) {
    await delay(100);
    const n = notifications.find((n) => n.id === notificationId);
    if (n) n.is_read = true;
    return n;
  },

  async markAllRead(userId: number) {
    await delay(200);
    notifications.filter((n) => n.user_id === userId).forEach((n) => (n.is_read = true));
  },

  // Leave Balance
  async getLeaveBalance(userId: number): Promise<LeaveBalance | null> {
    await delay(200);
    return leaveBalances.find((lb) => lb.employee_id === userId) || null;
  },

  // Reports
  async getAttendanceReport(filters?: { department?: string; from?: string; to?: string }) {
    await delay(500);
    let result = [...attendances];
    if (filters?.from) result = result.filter((a) => a.date >= filters.from!);
    if (filters?.to) result = result.filter((a) => a.date <= filters.to!);
    if (filters?.department) {
      const deptUsers = profiles.filter((p) => p.department === filters.department).map((p) => p.user_id);
      result = result.filter((a) => deptUsers.includes(a.employee_id));
    }
    const total = result.length;
    const present = result.filter((a) => a.status === "present").length;
    const absent = result.filter((a) => a.status === "absent").length;
    const leave = result.filter((a) => a.status === "leave").length;
    const halfDay = result.filter((a) => a.status === "half-day").length;
    return { total, present, absent, leave, halfDay, records: result };
  },

  async getLeaveReport(filters?: { department?: string }) {
    await delay(400);
    let result = [...leaveRequests];
    if (filters?.department) {
      const deptUsers = profiles.filter((p) => p.department === filters.department).map((p) => p.user_id);
      result = result.filter((l) => deptUsers.includes(l.employee_id));
    }
    return { total: result.length, approved: result.filter((l) => l.status === "approved").length, pending: result.filter((l) => l.status === "pending").length, rejected: result.filter((l) => l.status === "rejected").length, records: result };
  },

  // Helpers
  getProfile_sync: (userId: number) => profiles.find((p) => p.user_id === userId),
  getUser_sync: (userId: number) => users.find((u) => u.id === userId),
  getDepartments: () => [...new Set(profiles.map((p) => p.department))],
};
