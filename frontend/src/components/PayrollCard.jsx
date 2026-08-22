function PayrollCard({ title, value, description }) {
  return (
    <div className="payroll-card">
      <h3>{title}</h3>
      <h2>{value}</h2>
      <p>{description}</p>
    </div>
  );
}

export default PayrollCard;
