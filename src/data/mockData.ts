export type Role = "employee" | "hr" | "admin";
export type EmploymentStatus = "active" | "on-leave" | "terminated";
export type AttendanceStatus = "present" | "absent" | "half-day" | "leave";
export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveType = "paid" | "sick" | "unpaid";
export type NotificationType = "leave" | "attendance" | "payroll" | "profile" | "system";

export interface User {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  created_at: string;
}

export interface EmployeeProfile {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  address: string;
  profile_picture: string;
  department: string;
  designation: string;
  joining_date: string;
  employment_status: EmploymentStatus;
  manager: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in: string | null;
  check_out: string | null;
  working_hours: number | null;
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  duration: number;
  reason: string;
  remarks: string;
  status: LeaveStatus;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

export interface Payroll {
  id: number;
  employee_id: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  pay_period: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface LeaveBalance {
  employee_id: number;
  paid: number;
  sick: number;
  unpaid: number;
}

const today = new Date();
const fmt = (d: Date) => d.toISOString().split("T")[0];
const daysAgo = (n: number) => fmt(new Date(today.getTime() - n * 86400000));
const hoursAgo = (n: number) =>
  new Date(today.getTime() - n * 3600000).toTimeString().slice(0, 5);

export const USERS: User[] = [
  { id: 1, employee_id: "EMP001", name: "Sarah Mitchell", email: "sarah@dayflow.io", password: "Admin@1234", role: "admin", created_at: "2022-01-15" },
  { id: 2, employee_id: "EMP002", name: "James Carter", email: "hr@dayflow.io", password: "Hr@12345", role: "hr", created_at: "2022-01-20" },
  { id: 3, employee_id: "EMP003", name: "Emily Johnson", email: "emily@dayflow.io", password: "Emp@1234", role: "employee", created_at: "2022-03-01" },
  { id: 4, employee_id: "EMP004", name: "Michael Chen", email: "michael@dayflow.io", password: "Emp@1234", role: "employee", created_at: "2022-04-15" },
  { id: 5, employee_id: "EMP005", name: "Priya Sharma", email: "priya@dayflow.io", password: "Emp@1234", role: "employee", created_at: "2022-05-01" },
  { id: 6, employee_id: "EMP006", name: "David Williams", email: "david@dayflow.io", password: "Emp@1234", role: "employee", created_at: "2022-06-10" },
  { id: 7, employee_id: "EMP007", name: "Aisha Patel", email: "aisha@dayflow.io", password: "Emp@1234", role: "employee", created_at: "2022-07-22" },
  { id: 8, employee_id: "EMP008", name: "Robert Kim", email: "robert@dayflow.io", password: "Emp@1234", role: "employee", created_at: "2022-08-05" },
  { id: 9, employee_id: "EMP009", name: "Sofia Martinez", email: "sofia@dayflow.io", password: "Emp@1234", role: "employee", created_at: "2022-09-18" },
  { id: 10, employee_id: "EMP010", name: "Liam Thompson", email: "liam@dayflow.io", password: "Emp@1234", role: "employee", created_at: "2022-10-30" },
  { id: 11, employee_id: "EMP011", name: "Nina Rodriguez", email: "nina@dayflow.io", password: "Emp@1234", role: "employee", created_at: "2022-11-14" },
  { id: 12, employee_id: "EMP012", name: "Oliver Zhang", email: "oliver@dayflow.io", password: "Emp@1234", role: "employee", created_at: "2023-01-09" },
];

export const PROFILES: EmployeeProfile[] = [
  { id: 1, user_id: 1, full_name: "Sarah Mitchell", phone: "+1 (555) 101-0001", address: "42 Executive Blvd, New York, NY 10001", profile_picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format", department: "Executive", designation: "Chief HR Officer", joining_date: "2022-01-15", employment_status: "active", manager: "Board of Directors" },
  { id: 2, user_id: 2, full_name: "James Carter", phone: "+1 (555) 101-0002", address: "88 HR Lane, New York, NY 10002", profile_picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format", department: "Human Resources", designation: "HR Manager", joining_date: "2022-01-20", employment_status: "active", manager: "Sarah Mitchell" },
  { id: 3, user_id: 3, full_name: "Emily Johnson", phone: "+1 (555) 101-0003", address: "12 Elm Street, Brooklyn, NY 11201", profile_picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format", department: "Engineering", designation: "Senior Software Engineer", joining_date: "2022-03-01", employment_status: "active", manager: "Michael Chen" },
  { id: 4, user_id: 4, full_name: "Michael Chen", phone: "+1 (555) 101-0004", address: "5 Park Ave, New York, NY 10016", profile_picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format", department: "Engineering", designation: "Engineering Lead", joining_date: "2022-04-15", employment_status: "active", manager: "Sarah Mitchell" },
  { id: 5, user_id: 5, full_name: "Priya Sharma", phone: "+1 (555) 101-0005", address: "77 Queens Blvd, Queens, NY 11373", profile_picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format", department: "Design", designation: "Product Designer", joining_date: "2022-05-01", employment_status: "active", manager: "Sarah Mitchell" },
  { id: 6, user_id: 6, full_name: "David Williams", phone: "+1 (555) 101-0006", address: "33 Market Street, Manhattan, NY 10013", profile_picture: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&auto=format", department: "Sales", designation: "Sales Executive", joining_date: "2022-06-10", employment_status: "active", manager: "James Carter" },
  { id: 7, user_id: 7, full_name: "Aisha Patel", phone: "+1 (555) 101-0007", address: "21 Broadway, New York, NY 10006", profile_picture: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&auto=format", department: "Marketing", designation: "Marketing Specialist", joining_date: "2022-07-22", employment_status: "active", manager: "James Carter" },
  { id: 8, user_id: 8, full_name: "Robert Kim", phone: "+1 (555) 101-0008", address: "9 Hudson Yard, New York, NY 10001", profile_picture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&auto=format", department: "Finance", designation: "Financial Analyst", joining_date: "2022-08-05", employment_status: "active", manager: "Sarah Mitchell" },
  { id: 9, user_id: 9, full_name: "Sofia Martinez", phone: "+1 (555) 101-0009", address: "55 Wall Street, New York, NY 10005", profile_picture: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&auto=format", department: "Operations", designation: "Operations Manager", joining_date: "2022-09-18", employment_status: "active", manager: "Sarah Mitchell" },
  { id: 10, user_id: 10, full_name: "Liam Thompson", phone: "+1 (555) 101-0010", address: "17 Fulton Street, Brooklyn, NY 11201", profile_picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format", department: "Engineering", designation: "Backend Developer", joining_date: "2022-10-30", employment_status: "active", manager: "Michael Chen" },
  { id: 11, user_id: 11, full_name: "Nina Rodriguez", phone: "+1 (555) 101-0011", address: "44 Astoria Blvd, Queens, NY 11105", profile_picture: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&auto=format", department: "Sales", designation: "Sales Manager", joining_date: "2022-11-14", employment_status: "on-leave", manager: "James Carter" },
  { id: 12, user_id: 12, full_name: "Oliver Zhang", phone: "+1 (555) 101-0012", address: "66 Lexington Ave, New York, NY 10010", profile_picture: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&auto=format", department: "Design", designation: "UX Researcher", joining_date: "2023-01-09", employment_status: "active", manager: "Priya Sharma" },
];

export const PAYROLL_DATA: Payroll[] = [
  { id: 1, employee_id: 1, basic_salary: 180000, allowances: 24000, deductions: 18000, net_salary: 186000, pay_period: "2026-08", updated_at: "2026-08-01" },
  { id: 2, employee_id: 2, basic_salary: 110000, allowances: 14000, deductions: 11000, net_salary: 113000, pay_period: "2026-08", updated_at: "2026-08-01" },
  { id: 3, employee_id: 3, basic_salary: 95000, allowances: 12000, deductions: 9500, net_salary: 97500, pay_period: "2026-08", updated_at: "2026-08-01" },
  { id: 4, employee_id: 4, basic_salary: 130000, allowances: 18000, deductions: 13000, net_salary: 135000, pay_period: "2026-08", updated_at: "2026-08-01" },
  { id: 5, employee_id: 5, basic_salary: 88000, allowances: 10000, deductions: 8800, net_salary: 89200, pay_period: "2026-08", updated_at: "2026-08-01" },
  { id: 6, employee_id: 6, basic_salary: 75000, allowances: 9000, deductions: 7500, net_salary: 76500, pay_period: "2026-08", updated_at: "2026-08-01" },
  { id: 7, employee_id: 7, basic_salary: 72000, allowances: 8500, deductions: 7200, net_salary: 73300, pay_period: "2026-08", updated_at: "2026-08-01" },
  { id: 8, employee_id: 8, basic_salary: 98000, allowances: 13000, deductions: 9800, net_salary: 101200, pay_period: "2026-08", updated_at: "2026-08-01" },
  { id: 9, employee_id: 9, basic_salary: 105000, allowances: 15000, deductions: 10500, net_salary: 109500, pay_period: "2026-08", updated_at: "2026-08-01" },
  { id: 10, employee_id: 10, basic_salary: 85000, allowances: 10000, deductions: 8500, net_salary: 86500, pay_period: "2026-08", updated_at: "2026-08-01" },
  { id: 11, employee_id: 11, basic_salary: 92000, allowances: 12000, deductions: 9200, net_salary: 94800, pay_period: "2026-08", updated_at: "2026-08-01" },
  { id: 12, employee_id: 12, basic_salary: 78000, allowances: 9500, deductions: 7800, net_salary: 79700, pay_period: "2026-08", updated_at: "2026-08-01" },
];

const genAttendance = (): Attendance[] => {
  const records: Attendance[] = [];
  let id = 1;
  for (let emp = 1; emp <= 12; emp++) {
    for (let day = 20; day >= 1; day--) {
      const date = daysAgo(day);
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      const rand = Math.random();
      let status: AttendanceStatus = "present";
      let check_in = null, check_out = null, working_hours = null;
      if (rand > 0.85) {
        status = "absent";
      } else if (rand > 0.78) {
        status = "leave";
      } else if (rand > 0.72) {
        status = "half-day";
        check_in = "09:" + String(Math.floor(Math.random() * 30)).padStart(2, "0");
        check_out = "13:" + String(Math.floor(Math.random() * 30)).padStart(2, "0");
        working_hours = 4;
      } else {
        const minOffset = Math.floor(Math.random() * 20);
        check_in = `09:${String(minOffset).padStart(2, "0")}`;
        check_out = `18:${String(Math.floor(Math.random() * 30)).padStart(2, "0")}`;
        working_hours = parseFloat((8.5 + Math.random() * 0.5 - Math.random() * 0.5).toFixed(1));
      }
      records.push({ id: id++, employee_id: emp, date, check_in, check_out, working_hours, status });
    }
    // Today's record
    if (emp <= 9) {
      records.push({ id: id++, employee_id: emp, date: fmt(today), check_in: "09:02", check_out: null, working_hours: null, status: "present" });
    }
  }
  return records;
};

export const ATTENDANCE_DATA: Attendance[] = genAttendance();

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 1, employee_id: 3, leave_type: "paid", start_date: daysAgo(2), end_date: daysAgo(1), duration: 2, reason: "Family vacation planned in advance", remarks: "Will be available on phone if needed", status: "approved", approved_by: "James Carter", created_at: daysAgo(5), updated_at: daysAgo(3) },
  { id: 2, employee_id: 6, leave_type: "sick", start_date: fmt(today), end_date: daysAgo(-1), duration: 2, reason: "Fever and flu symptoms", remarks: "Doctor certificate will be provided", status: "pending", approved_by: null, created_at: daysAgo(1), updated_at: daysAgo(1) },
  { id: 3, employee_id: 7, leave_type: "paid", start_date: daysAgo(-3), end_date: daysAgo(-5), duration: 3, reason: "Personal travel", remarks: "", status: "pending", approved_by: null, created_at: daysAgo(2), updated_at: daysAgo(2) },
  { id: 4, employee_id: 10, leave_type: "unpaid", start_date: daysAgo(10), end_date: daysAgo(8), duration: 3, reason: "Personal emergency", remarks: "Family matter", status: "rejected", approved_by: "James Carter", created_at: daysAgo(12), updated_at: daysAgo(9), rejection_reason: "Insufficient unpaid leave balance" },
  { id: 5, employee_id: 5, leave_type: "sick", start_date: daysAgo(15), end_date: daysAgo(14), duration: 2, reason: "Medical appointment and recovery", remarks: "Submitted doctor note", status: "approved", approved_by: "James Carter", created_at: daysAgo(16), updated_at: daysAgo(14) },
  { id: 6, employee_id: 8, leave_type: "paid", start_date: daysAgo(-7), end_date: daysAgo(-9), duration: 3, reason: "Annual family trip", remarks: "", status: "pending", approved_by: null, created_at: daysAgo(1), updated_at: daysAgo(1) },
  { id: 7, employee_id: 11, leave_type: "paid", start_date: daysAgo(5), end_date: daysAgo(3), duration: 3, reason: "Maternity preparation leave", remarks: "Will provide documentation", status: "approved", approved_by: "James Carter", created_at: daysAgo(8), updated_at: daysAgo(4) },
  { id: 8, employee_id: 4, leave_type: "sick", start_date: daysAgo(-2), end_date: daysAgo(-2), duration: 1, reason: "Dental surgery", remarks: "Doctor appointment confirmed", status: "pending", approved_by: null, created_at: fmt(today), updated_at: fmt(today) },
];

export const LEAVE_BALANCES: LeaveBalance[] = USERS.map((u) => ({
  employee_id: u.id,
  paid: Math.floor(Math.random() * 8) + 5,
  sick: Math.floor(Math.random() * 5) + 3,
  unpaid: 10,
}));

export const NOTIFICATIONS: Notification[] = [
  { id: 1, user_id: 3, title: "Leave Approved", message: "Your paid leave request for Aug 19–20 has been approved by James Carter.", type: "leave", is_read: false, created_at: daysAgo(3) },
  { id: 2, user_id: 3, title: "Attendance Recorded", message: "Your check-in for today has been recorded at 09:02 AM.", type: "attendance", is_read: false, created_at: fmt(today) },
  { id: 3, user_id: 3, title: "Payroll Updated", message: "Your August 2026 payroll has been processed. Net salary: $97,500.", type: "payroll", is_read: true, created_at: daysAgo(7) },
  { id: 4, user_id: 2, title: "New Leave Request", message: "David Williams has submitted a sick leave request for Aug 22–23.", type: "leave", is_read: false, created_at: daysAgo(1) },
  { id: 5, user_id: 2, title: "New Leave Request", message: "Aisha Patel has submitted a paid leave request for Aug 25–27.", type: "leave", is_read: false, created_at: daysAgo(2) },
  { id: 6, user_id: 2, title: "Attendance Alert", message: "3 employees in the Sales department were absent yesterday without prior notice.", type: "attendance", is_read: false, created_at: daysAgo(1) },
  { id: 7, user_id: 2, title: "Payroll Processed", message: "August 2026 payroll has been processed for all 12 employees.", type: "payroll", is_read: true, created_at: daysAgo(7) },
  { id: 8, user_id: 6, title: "Leave Request Submitted", message: "Your sick leave request has been submitted and is pending approval.", type: "leave", is_read: false, created_at: daysAgo(1) },
  { id: 9, user_id: 1, title: "System Update", message: "Dayflow has been updated to v2.4.1. New features available in Reports.", type: "system", is_read: true, created_at: daysAgo(5) },
  { id: 10, user_id: 4, title: "New Leave Request", message: "Emily Johnson has approved her vacation leave.", type: "leave", is_read: false, created_at: daysAgo(1) },
  { id: 11, user_id: 7, title: "Leave Request Submitted", message: "Your paid leave request for Aug 25–27 is pending HR approval.", type: "leave", is_read: false, created_at: daysAgo(2) },
  { id: 12, user_id: 10, title: "Leave Rejected", message: "Your unpaid leave request has been rejected. Reason: Insufficient unpaid leave balance.", type: "leave", is_read: false, created_at: daysAgo(9) },
];
