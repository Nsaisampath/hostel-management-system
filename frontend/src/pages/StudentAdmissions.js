import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../axios";
import { UserContext } from "../UserContext";
import "../styles/styles.css"; // Import your CSS file

const StudentAdmissions = () => {
  const { user } = useContext(UserContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.token) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/students", {
          params: { status: filter !== "all" ? filter : undefined }
        });
        setStudents(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students data");
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user, filter]);

  const handleApprove = async (studentId) => {
    try {
      await axiosInstance.put(`/api/students/${studentId}/status`, {
        status: 'active'
      });
      
      // Update the student in the state
      setStudents(students.map(student => 
        student.student_id === studentId ? { ...student, status: 'active' } : student
      ));
      
      alert("Student admission approved successfully");
    } catch (err) {
      console.error("Error approving student:", err);
      alert(err.response?.data?.message || "Failed to approve student");
    }
  };

  const handleReject = async (studentId) => {
    if (!window.confirm("Are you sure you want to reject this student's admission?")) {
      return;
    }
    
    try {
      await axiosInstance.put(`/api/students/${studentId}/status`, {
        status: 'inactive'
      });
      
      // Update the student in the state
      setStudents(students.map(student => 
        student.student_id === studentId ? { ...student, status: 'inactive' } : student
      ));
      
      alert("Student admission rejected");
    } catch (err) {
      console.error("Error rejecting student:", err);
      alert(err.response?.data?.message || "Failed to reject student");
    }
  };

  if (loading) return <div className="loading">Loading student data...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="student-admissions-container">
      {/* Page Title */}
      <h1 className="page-title">Student Admissions</h1>

      {/* Filters */}
      <div className="filters">
        <label>
          Filter by Status:
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option key="all" value="all">All</option>
            <option key="pending" value="pending">Pending</option>
            <option key="active" value="active">Approved</option>
            <option key="inactive" value="inactive">Rejected</option>
          </select>
        </label>
      </div>

      {/* Student List */}
      <div className="student-list">
        {students.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Room Preference</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.student_id || student.id}>
                  <td>{student.student_id || student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.contact}</td>
                  <td>{student.room_preference}</td>
                  <td className={`status ${student.status || 'pending'}`}>
                    {(student.status || 'pending').charAt(0).toUpperCase() + 
                     (student.status || 'pending').slice(1)}
                  </td>
                  <td>
                    {student.status !== 'active' && (
                      <button
                        className="approve-button"
                        onClick={() => handleApprove(student.student_id || student.id)}
                        disabled={student.status === 'active'}
                      >
                        Approve
                      </button>
                    )}
                    {student.status !== 'inactive' && (
                      <button
                        className="reject-button"
                        onClick={() => handleReject(student.student_id || student.id)}
                        disabled={student.status === 'inactive'}
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No students found</p>
        )}
      </div>
    </div>
  );
};

export default StudentAdmissions;