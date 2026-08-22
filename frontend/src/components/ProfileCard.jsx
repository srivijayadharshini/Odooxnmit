import React from "react";

const ProfileCard = ({ employee }) => {
  if (!employee) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar">
          {employee.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2>{employee.name}</h2>
          <p>{employee.role}</p>
        </div>
      </div>

      <div className="profile-details">
        <p>
          <strong>Employee ID:</strong> {employee.employeeId}
        </p>

        <p>
          <strong>Email:</strong> {employee.email}
        </p>

        <p>
          <strong>Department:</strong> {employee.department}
        </p>

        <p>
          <strong>Phone:</strong> {employee.phone}
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;
