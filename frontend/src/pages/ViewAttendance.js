import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../axios';
import { UserContext } from '../UserContext';
import '../styles/styles.css';

const ViewAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user?.token) {
        setError('User information not available');
        setLoading(false);
        return;
      }

      // Get student ID from wherever it might be stored
      const studentId = user.student_id || user.id;
      
      if (!studentId) {
        setError('Student ID not found. Please contact administrator.');
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/api/attendance/student/${studentId}`);
        setAttendanceData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data');
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  if (loading) return <div className="loading-message">Loading attendance data...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="attendance-container">
      <h1 className="page-title">View Attendance</h1>
      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Marked By</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.length > 0 ? (
              attendanceData.map((record, index) => (
                <tr key={record.id || index}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td className={`status ${record.status}`}>{record.status}</td>
                  <td>{record.marked_by_name || 'Admin'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="no-data">No attendance records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>  
  );
};

export default ViewAttendance;