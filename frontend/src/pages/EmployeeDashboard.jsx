import React, { useEffect, useState } from "react";
import ProfileCard from "../components/ProfileCard";
import SalaryCard from "../components/SalaryCard";
import employeeApi from "../services/employeeApi";

const EmployeeDashboard = () => {
  const [employee, setEmployee] = useState(null);
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Example employee ID
  const employeeId = "EMP001";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const profileData = await employeeApi.getProfile(employeeId);
        const salaryData = await employeeApi.getSalary(employeeId);

        setEmployee(profileData);
        setSalary(salaryData);
      } catch (err) {
        console.error(err);
        setError("Unable to load employee details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Employee Dashboard</h1>
          <p>Welcome back, {employee?.name}</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <ProfileCard employee={employee} />
        <SalaryCard salary={salary} />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
