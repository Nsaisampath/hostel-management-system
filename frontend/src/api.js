import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Fetch all students
export const getStudents = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/students`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Add a new student
export const addStudent = async (studentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/students`, studentData);
    return response.data;
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
};

// Update a student
export const updateStudent = async (id, studentData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/students/${id}`, studentData);
    return response.data;
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

// Delete a student
export const deleteStudent = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/students/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

// Fetch all rooms
export const getRooms = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rooms`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

// Add a new room
export const addRoom = async (roomData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/rooms`, roomData);
    return response.data;
  } catch (error) {
    console.error('Error adding room:', error);
    throw error;
  }
};

// Update a room
export const updateRoom = async (id, roomData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/rooms/${id}`, roomData);
    return response.data;
  } catch (error) {
    console.error('Error updating room:', error);
    throw error;
  }
};

// Delete a room
export const deleteRoom = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/rooms/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
};

// Fetch all fee records
export const getFees = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/fees`);
    return response.data;
  } catch (error) {
    console.error('Error fetching fees:', error);
    throw error;
  }
};

// Add a new fee record
export const addFee = async (feeData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/fees`, feeData);
    return response.data;
  } catch (error) {
    console.error('Error adding fee:', error);
    throw error;
  }
};

// Update a fee record
export const updateFee = async (id, feeData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/fees/${id}`, feeData);
    return response.data;
  } catch (error) {
    console.error('Error updating fee:', error);
    throw error;
  }
};

// Delete a fee record
export const deleteFee = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/fees/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting fee:', error);
    throw error;
  }
};

// Fetch all maintenance requests
export const getMaintenanceRequests = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/maintenance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    throw error;
  }
};

// Add a new maintenance request
export const addMaintenanceRequest = async (maintenanceData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/maintenance`, maintenanceData);
    return response.data;
  } catch (error) {
    console.error('Error adding maintenance request:', error);
    throw error;
  }
};

// Update a maintenance request
export const updateMaintenanceRequest = async (id, maintenanceData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/maintenance/${id}`, maintenanceData);
    return response.data;
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    throw error;
  }
};

// Delete a maintenance request
export const deleteMaintenanceRequest = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/maintenance/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting maintenance request:', error);
    throw error;
  }
};

// Fetch all leave requests
export const getLeaveRequests = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/leave`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    throw error;
  }
};

// Add a new leave request
export const addLeaveRequest = async (leaveData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/leave`, leaveData);
    return response.data;
  } catch (error) {
    console.error('Error adding leave request:', error);
    throw error;
  }
};

// Update a leave request
export const updateLeaveRequest = async (id, leaveData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/leave/${id}`, leaveData);
    return response.data;
  } catch (error) {
    console.error('Error updating leave request:', error);
    throw error;
  }
};

// Delete a leave request
export const deleteLeaveRequest = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/leave/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting leave request:', error);
    throw error;
  }
};

// Register a new student
export const registerStudent = async (studentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/students/register`, studentData);
    return response.data;
  } catch (error) {
    console.error('Error registering student:', error);
    throw error;
  }
};

// Fetch all notices
export const getNotices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notices`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notices:', error);
    throw error;
  }
};

// Add a new notice
export const addNotice = async (noticeData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/notices`, noticeData);
    return response.data;
  } catch (error) {
    console.error('Error adding notice:', error);
    throw error;
  }
};