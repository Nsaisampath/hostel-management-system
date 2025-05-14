import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";
import axiosInstance from "../axios";
import "../styles/styles.css";

function AdminLeaveRequests() {
  const { user } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // Moved the fetch function inside useEffect to avoid dependency issues
    const fetchLeaveRequests = async () => {
      if (!user?.token) {
        setError("You must be logged in as admin to view leave requests");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/leave-requests");
        setRequests(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching leave requests:", err);
        setError("Failed to load leave requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [user]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/api/leave-requests/${id}`, { status });
      
      // Update state to reflect the change
      setRequests(
        requests.map((req) =>
          req.id === id ? { ...req, status } : req
        )
      );
      
      alert(`Leave request ${status} successfully`);
    } catch (err) {
      console.error("Error updating leave request status:", err);
      alert("Failed to update leave request status");
    }
  };

  // Filter requests based on search term and status filter
  const filteredRequests = requests.filter(req => {
    // Filter by search term (student name or ID)
    const matchesSearch = searchTerm === "" || 
      (req.student_name && req.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (req.student_id && req.student_id.toString().includes(searchTerm));
    
    // Filter by status
    const matchesFilter = filter === "all" || req.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="loading-message">Loading leave requests...</div>;

  return (
    <div className="leave-requests-admin">
      <h1 className="page-title">Leave Requests</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Student Name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="status-filter">
          <label>Filter by Status:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="leave-requests-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Name</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.id}</td>
                  <td>{req.student_name || "Unknown"}</td>
                  <td>{req.leave_type || "Personal"}</td>
                  <td>{new Date(req.start_date).toLocaleDateString()} to {new Date(req.end_date).toLocaleDateString()}</td>
                  <td>{req.reason}</td>
                  <td className={`status ${req.status}`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </td>
                  <td>
                    {req.status === "pending" && (
                      <>
                        <button 
                          className="approve-button"
                          onClick={() => handleUpdateStatus(req.id, "approved")}
                        >
                          Approve
                        </button>
                        <button 
                          className="reject-button"
                          onClick={() => handleUpdateStatus(req.id, "rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No leave requests found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminLeaveRequests;