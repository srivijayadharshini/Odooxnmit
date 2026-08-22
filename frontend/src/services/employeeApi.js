import axios from "axios";

const API_URL = "http://localhost:5000/api/employees";

const employeeApi = {
  // Get employee profile
  getProfile: async (employeeId) => {
    const response = await axios.get(`${API_URL}/${employeeId}`);
    return response.data;
  },

  // Get employee salary
  getSalary: async (employeeId) => {
    const response = await axios.get(`${API_URL}/${employeeId}/salary`);
    return response.data;
  },

  // Update employee profile
  updateProfile: async (employeeId, data) => {
    const response = await axios.put(
      `${API_URL}/${employeeId}`,
      data
    );
    return response.data;
  },
};

export default employeeApi;
