import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/styles.css"; // Import your CSS file
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faClipboardList, 
  faCalendarAlt, 
  faToolbox, 
  faBullhorn 
} from '@fortawesome/free-solid-svg-icons';
import { UserContext } from "../UserContext";
import axiosInstance from "../axios";

function StudentDashboard() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [notices, setNotices] = useState([]);
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState({
    leave: false,
    maintenance: false,
    notices: false,
    room: false
  });
  const [error, setError] = useState(null);
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user?.token) return;
    
    // Fetch all data for dashboard
    const fetchDashboardData = async () => {
      try {
        // Set loading states for all data types
        setLoading(prev => ({
          leave: true,
          maintenance: true,
          notices: true,
          room: true
        }));
        
        // Fetch recent leave requests
        try {
          const leaveResponse = await axiosInstance.get(`/api/leave-requests/student/${user.student_id || user.id}`);
          setLeaveRequests(leaveResponse.data);
        } catch (err) {
          console.error("Error fetching leave requests:", err);
        } finally {
          setLoading(prev => ({ ...prev, leave: false }));
        }
        
        // Fetch maintenance requests
        try {
          const maintenanceResponse = await axiosInstance.get(`/api/maintenance-requests/student/${user.student_id || user.id}`);
          setMaintenanceRequests(maintenanceResponse.data);
        } catch (err) {
          console.error("Error fetching maintenance requests:", err);
        } finally {
          setLoading(prev => ({ ...prev, maintenance: false }));
        }
        
        // Fetch notices
        try {
          const noticesResponse = await axiosInstance.get('/api/notices');
          setNotices(noticesResponse.data.slice(0, 3)); // Get most recent 3 notices
        } catch (err) {
          console.error("Error fetching notices:", err);
        } finally {
          setLoading(prev => ({ ...prev, notices: false }));
        }
        
        // Fetch room details if assigned
        if (user.room_number) {
          try {
            const roomResponse = await axiosInstance.get(`/api/rooms/${user.room_number}`);
            setRoomDetails(roomResponse.data);
          } catch (err) {
            console.error("Error fetching room details:", err);
          } finally {
            setLoading(prev => ({ ...prev, room: false }));
          }
        } else {
          setLoading(prev => ({ ...prev, room: false }));
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      }
    };

    fetchDashboardData();
  }, [user]);

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

  // Calculate total pending requests
  const pendingLeaveRequests = leaveRequests.filter(req => req.status === "pending").length;
  const pendingMaintenanceRequests = maintenanceRequests.filter(req => req.status === "pending").length;
  const totalPendingRequests = pendingLeaveRequests + pendingMaintenanceRequests;

  return (
    <div className="dashboard">
      {/* Page Title & Logout */}
      <div className="dashboard-header">
        <h1>Welcome, {user.name || "Student"}!</h1>
        <button className="logout-button" onClick={handleLogout}>
          <FontAwesomeIcon icon={faUser} /> Log Out
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px' }}>
          {error}
        </div>
      )}

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat">
          <h2>Room Number</h2>
          <p>{user.room_number || "Not Assigned"}</p>
        </div>
        <div className="stat">
          <h2>Student ID</h2>
          <p>{user.student_id || user.id || "N/A"}</p>
        </div>
        <div className="stat">
          <h2>Pending Requests</h2>
          <p>{totalPendingRequests || 0}</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Navigation Buttons - Vertical */}
        <div className="navigation">
          <Link to="/student/dashboard" className="nav-button">
            <FontAwesomeIcon icon={faUser} /> Dashboard
          </Link>
          <Link to="/student/maintenance-requests" className="nav-button">
            <FontAwesomeIcon icon={faToolbox} /> Maintenance Requests
          </Link>
          <Link to="/student/view-attendance" className="nav-button">
            <FontAwesomeIcon icon={faClipboardList} /> View Attendance
          </Link>
          <Link to="/student/view-notices" className="nav-button">
            <FontAwesomeIcon icon={faBullhorn} /> View Notices
          </Link>
          <Link to="/student/leave-requests" className="nav-button">
            <FontAwesomeIcon icon={faCalendarAlt} /> Request Leave
          </Link>
          <Link to="/student/profile" className="nav-button">
            <FontAwesomeIcon icon={faUser} /> My Profile
          </Link>
        </div>

        {/* Main Content Area - Horizontal cards */}
        <div className="main-content">
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Room Information</h3>
              {loading.room ? (
                <p>Loading room details...</p>
              ) : (
                <>
                  <p><strong>Room Number:</strong> {user.room_number || "Not assigned"}</p>
                  <p><strong>Room Type:</strong> {roomDetails?.type || (user.room_number ? "Standard" : "N/A")}</p>
                  <p><strong>Room Status:</strong> {roomDetails?.status || "N/A"}</p>
                  <p><strong>Block:</strong> {user.room_number ? user.room_number.charAt(0) : "N/A"}</p>
                </>
              )}
            </div>
            <div className="dashboard-card">
              <h3>Recent Notices</h3>
              {loading.notices ? (
                <p>Loading notices...</p>
              ) : notices.length > 0 ? (
                <ul className="dashboard-list">
                  {notices.map(notice => (
                    <li key={notice.id}>
                      <div className="list-item-header">{notice.title}</div>
                      <div className="list-item-content">{notice.content.substring(0, 50)}...</div>
                      <div className="list-item-date">{new Date(notice.created_at).toLocaleDateString()}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recent notices found.</p>
              )}
            </div>
          </div>
          
          {/* Leave Request Status */}
          <div className="student-list">
            <h2>Leave Request Status</h2>
            {loading.leave ? (
              <p>Loading leave requests...</p>
            ) : leaveRequests.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.slice(0, 3).map(request => (
                    <tr key={request.id}>
                      <td>{new Date(request.start_date).toLocaleDateString()}</td>
                      <td>{new Date(request.end_date).toLocaleDateString()}</td>
                      <td>{request.leave_type || "Personal"}</td>
                      <td className={`status ${request.status}`}>{request.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No leave requests found</p>
            )}
          </div>
          
          {/* Maintenance Request Status */}
          <div className="student-list">
            <h2>Maintenance Request Status</h2>
            {loading.maintenance ? (
              <p>Loading maintenance requests...</p>
            ) : maintenanceRequests.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Issue Type</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceRequests.slice(0, 3).map(request => (
                    <tr key={request.id}>
                      <td>{request.issue_type || "General"}</td>
                      <td>{request.description.substring(0, 30)}...</td>
                      <td>{new Date(request.created_at).toLocaleDateString()}</td>
                      <td className={`status ${request.status}`}>{request.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No maintenance requests found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
