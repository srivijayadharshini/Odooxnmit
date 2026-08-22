import React from "react";

const SalaryCard = ({ salary }) => {
  if (!salary) {
    return <p>Loading salary...</p>;
  }

  return (
    <div className="salary-card">
      <h2>Salary Details</h2>

      <div className="salary-row">
        <span>Basic Salary</span>
        <strong>₹{salary.basicSalary}</strong>
      </div>

      <div className="salary-row">
        <span>Allowances</span>
        <strong>₹{salary.allowances}</strong>
      </div>

      <div className="salary-row">
        <span>Deductions</span>
        <strong>₹{salary.deductions}</strong>
      </div>

      <hr />

      <div className="salary-total">
        <span>Net Salary</span>
        <strong>₹{salary.netSalary}</strong>
      </div>
    </div>
  );
};

export default SalaryCard;
