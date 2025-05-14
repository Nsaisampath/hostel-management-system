import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTools, faBed, faUserPlus, faCalendarCheck, faEnvelope, faChartBar, faSignOutAlt, faUserCheck } from "@fortawesome/free-solid-svg-icons";
import { UserContext } from "../UserContext";
import axiosInstance from "../axios";

function AdminDashboard() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Dashboard statistics
  const [totalStudents, setTotalStudents] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [studentList, setStudentList] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  
  // Fetch dashboard data
  useEffect(() => {
    let isComponentMounted = true;
    let refreshInterval;
    let retryTimeout;
    
    const fetchDashboardData = async (retryDelay = 5000) => {
      if (!isComponentMounted) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Authentication required. Please log in.");
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        
        // Fetch total students
        const studentsResponse = await axiosInstance.get('/api/students');
        if (isComponentMounted) {
          setTotalStudents(studentsResponse.data.length);
        }
        
        // Fetch rooms
        const roomsResponse = await axiosInstance.get('/api/rooms');
        const rooms = roomsResponse.data;
        if (isComponentMounted) {
          const availableRoomsCount = rooms.filter(room => room.status === 'available').length;
          setAvailableRooms(availableRoomsCount);
          
          // Get the most recent students (limited to 5)
          const recentStudents = studentsResponse.data
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
            .slice(0, 5);
          setStudentList(recentStudents);
        }
        
        // Fetch pending requests
        const leaveResponse = await axiosInstance.get('/api/leave-requests?status=pending');
        const maintenanceResponse = await axiosInstance.get('/api/maintenance-requests?status=pending');
        if (isComponentMounted) {
          const pendingLeaveRequests = leaveResponse.data.length;
          const pendingMaintenanceRequests = maintenanceResponse.data.length;
          setPendingRequests(pendingLeaveRequests + pendingMaintenanceRequests);
          
          // Set pending approvals
          setPendingApprovals([
            ...leaveResponse.data.map(req => ({
              id: req.id,
              type: 'Leave Request',
              student: req.student_name || 'Unknown Student',
              date: new Date(req.created_at).toLocaleDateString(),
              status: req.status
            })),
            ...maintenanceResponse.data.map(req => ({
              id: req.id,
              type: 'Maintenance Request',
              student: req.student_name || 'Unknown Student',
              date: new Date(req.created_at).toLocaleDateString(),
              status: req.status
            }))
          ]);
        }
        
        // Fetch notices
        const noticesResponse = await axiosInstance.get('/api/notices');
        if (isComponentMounted) {
          // Get the most recent notices (limited to 5)
          const recentNotices = noticesResponse.data
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
            .slice(0, 5);
          setRecentNotices(recentNotices);
          
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (isComponentMounted) {
          if (err.response && err.response.status === 401) {
            setError("Authentication expired. Please log in again.");
            localStorage.removeItem('token');
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          } else if (err.response && err.response.status === 429) {
            // Set a user-friendly message for rate limit errors
            setError("Dashboard temporarily unavailable due to high traffic. Will retry automatically.");
            setLoading(false);
            
            // Clear any existing retry timeout
            if (retryTimeout) clearTimeout(retryTimeout);
            
            // Exponential backoff - wait longer between retries
            const nextRetryDelay = Math.min(retryDelay * 2, 60000); // Cap at 1 minute
            
            // Schedule a retry after the delay
            retryTimeout = setTimeout(() => {
              if (isComponentMounted) {
                fetchDashboardData(nextRetryDelay);
              }
            }, retryDelay);
            
            return; // Exit early to avoid setting up the regular refresh interval
          } else {
            setError("Failed to load dashboard data.");
          }
          setLoading(false);
        }
      }
    };
    
    // Initial fetch
    fetchDashboardData();
    
    // Set up periodic refresh every 5 minutes instead of 3 minutes to reduce API calls
    refreshInterval = setInterval(() => fetchDashboardData(), 300000);
    
    // Cleanup
    return () => {
      isComponentMounted = false;
      clearInterval(refreshInterval);
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [navigate]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="error-container">
        <div className="error-message">Not logged in. Please log in to access the dashboard.</div>
        <button className="action-button" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Page Title & Logout */}
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-button" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
        </button>
      </div>

      {/* Show error if any */}
      {error && <div className="error-message">{error}</div>}

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat">
          <h2>Total Students</h2>
          <p>{loading ? "..." : totalStudents}</p>
        </div>
        <div className="stat">
          <h2>Available Rooms</h2>
          <p>{loading ? "..." : availableRooms}</p>
        </div>
        <div className="stat">
          <h2>Pending Requests</h2>
          <p>{loading ? "..." : pendingRequests}</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Navigation Buttons - Vertical */}
        <div className="navigation">
          <Link to="/admin/room-management" className="nav-button">
            <FontAwesomeIcon icon={faBed} /> Room Management
          </Link>
          <Link to="/admin/student-admissions" className="nav-button">
            <FontAwesomeIcon icon={faUserPlus} /> Student Admissions
          </Link>
          <Link to="/admin/upload-attendance" className="nav-button">
            <FontAwesomeIcon icon={faUserCheck} /> Upload Attendance
          </Link>
          <Link to="/admin/maintenance-requests" className="nav-button">
            <FontAwesomeIcon icon={faTools} /> Maintenance Requests
          </Link>
          <Link to="/admin/leave-requests" className="nav-button">
            <FontAwesomeIcon icon={faCalendarCheck} /> Leave Requests
          </Link>
          <Link to="/admin/send-notices" className="nav-button">
            <FontAwesomeIcon icon={faEnvelope} /> Send Notices
          </Link>
          <Link to="/admin/reports" className="nav-button">
            <FontAwesomeIcon icon={faChartBar} /> Reports & Analytics
          </Link>
        </div>

        {/* Main Content Area - Horizontal cards */}
        <div className="main-content">
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Recent Notices</h3>
              {loading ? (
                <p>Loading...</p>
              ) : recentNotices.length > 0 ? (
                <ul className="dashboard-list">
                  {recentNotices.map(notice => (
                    <li key={notice.id}>
                      <div className="list-item-header">{notice.title}</div>
                      <div className="list-item-date">{new Date(notice.created_at).toLocaleDateString()}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recent notices found.</p>
              )}
            </div>
            <div className="dashboard-card">
              <h3>Pending Approvals</h3>
              {loading ? (
                <p>Loading...</p>
              ) : pendingApprovals.length > 0 ? (
                <ul className="dashboard-list">
                  {pendingApprovals.map(item => (
                    <li key={`${item.type}-${item.id}`}>
                      <div className="list-item-header">{item.type}</div>
                      <div className="list-item-content">From: {item.student}</div>
                      <div className="list-item-date">{item.date}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No pending approvals.</p>
              )}
            </div>
          </div>
          
          {/* Student List */}
          <div className="student-list">
            <h2>Student List</h2>
            {loading ? (
              <p>Loading students...</p>
            ) : studentList.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Room</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map(student => (
                    <tr key={student.id || student.student_id}>
                      <td>{student.student_id || student.id}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.room_number || "Not Assigned"}</td>
                      <td className={`status ${student.status || "pending"}`}>
                        {(student.status || "pending").charAt(0).toUpperCase() + 
                         (student.status || "pending").slice(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No students found. Students will be displayed here after registration.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;