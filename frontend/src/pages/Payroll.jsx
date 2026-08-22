import PayrollCard from "../components/PayrollCard";

function Payroll() {
  return (
    <div className="payroll-page">
      <h1>Payroll Management</h1>

      <div className="payroll-container">
        <PayrollCard
          title="Total Payroll"
          value="₹65,00,000"
          description="Total monthly payroll"
        />

        <PayrollCard
          title="Processed"
          value="₹62,50,000"
          description="Payroll successfully processed"
        />

        <PayrollCard
          title="Pending"
          value="₹2,50,000"
          description="Payroll waiting for processing"
        />
      </div>

      <div className="payroll-table">
        <h2>Payroll Details</h2>

        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Basic Salary</th>
              <th>Bonus</th>
              <th>Deductions</th>
              <th>Net Salary</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Arun Kumar</td>
              <td>₹50,000</td>
              <td>₹5,000</td>
              <td>₹2,000</td>
              <td>₹53,000</td>
            </tr>

            <tr>
              <td>Priya Sharma</td>
              <td>₹60,000</td>
              <td>₹6,000</td>
              <td>₹3,000</td>
              <td>₹63,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Payroll;
