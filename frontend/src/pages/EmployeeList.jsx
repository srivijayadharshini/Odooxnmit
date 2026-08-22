import EmployeeTable from "../components/EmployeeTable";

function EmployeeList() {
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
    {
      id: 4,
      name: "Sneha Devi",
      department: "Marketing",
      position: "Marketing Executive",
      salary: 40000,
    },
  ];

  return (
    <div className="employee-page">
      <h1>Employees</h1>

      <EmployeeTable employees={employees} />
    </div>
  );
}

export default EmployeeList;
