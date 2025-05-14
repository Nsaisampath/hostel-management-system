import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../axios";
import { UserContext } from "../UserContext";
import "../styles/styles.css"; // Import your CSS file

const ViewNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(UserContext);

  useEffect(() => {
    // Fetch notices from the backend
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/notices");
        setNotices(response.data);
        setError("");
      } catch (error) {
        console.error("Error fetching notices:", error);
        setError("Failed to load notices. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchNotices();
    } else {
      setError("You must be logged in to view notices");
      setLoading(false);
    }
  }, [user]);

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'urgent':
        return 'priority-urgent';
      case 'high':
        return 'priority-high';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-normal';
    }
  };

  if (loading) return <div className="loading">Loading notices...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="student-notices-container">
      

      {/* Page Title */}
      <h1 className="page-title">View Notices</h1>

      {/* Notices List */}
      <div className="notices-list">
        {notices.length > 0 ? (
          notices.map((notice) => (
            <div 
              key={notice.id || notice.notice_id} 
              className={`notice-card ${getPriorityClass(notice.priority)}`}
            >
              <h3>{notice.title}</h3>
              <p>{notice.content || notice.description}</p>
              <div className="notice-footer">
                <small>Posted by: {notice.admin_name || "Admin"}</small>
                <small>Posted on: {new Date(notice.created_at).toLocaleDateString()}</small>
                {notice.priority && (
                  <small className="notice-priority">
                    Priority: {notice.priority.charAt(0).toUpperCase() + notice.priority.slice(1)}
                  </small>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No notices available.</p>
        )}
      </div>

      
    </div>
  );
};

export default ViewNotices;