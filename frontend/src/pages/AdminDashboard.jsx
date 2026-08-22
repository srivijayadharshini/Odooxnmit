import EmployeeTable from "../components/EmployeeTable";
import PayrollCard from "../components/PayrollCard";

function AdminDashboard() {
  const employees = [
    {
      id: 1,
      name: "Arun Kumar",
      department: "IT",
      position: "Software Developer",
      salary: 50000,
    },
    {
      id: 2,
      name: "Priya Sharma",
      department: "HR",
      position: "HR Manager",
      salary: 60000,
    },
    {
      id: 3,
      name: "Rahul Raj",
      department: "Finance",
      position: "Accountant",
      salary: 45000,
    },
  ];

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      <div className="payroll-container">
        <PayrollCard
          title="Total Employees"
          value="120"
          description="Employees currently registered"
        />

        <PayrollCard
          title="Total Payroll"
          value="₹65,00,000"
          description="Monthly payroll amount"
        />

        <PayrollCard
          title="Pending Payroll"
          value="₹2,50,000"
          description="Payroll pending for processing"
        />
      </div>

      <EmployeeTable employees={employees} />
    </div>
  );
}

export default AdminDashboard;
