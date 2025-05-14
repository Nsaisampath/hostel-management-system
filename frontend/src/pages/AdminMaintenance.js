import React, { useState, useEffect, useContext, useCallback } from "react";
import axiosInstance from "../axios";
import { UserContext } from "../UserContext";
import "../styles/styles.css";

const AdminMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(UserContext);

  const fetchRequests = useCallback(async () => {
    if (!user?.token) {
      setError("You must be logged in as admin to view maintenance requests");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/maintenance-requests", {
        params: { status: statusFilter }
      });
      setRequests(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching maintenance requests:", err);
      setError("Failed to load maintenance requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, user]); // Dependencies: statusFilter and user

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleResolve = async (id) => {
    try {
      const response = await axiosInstance.put(`/api/maintenance-requests/${id}`, { 
        status: "completed" 
      });
      
      if (response.data) {
        // Update the request in the local state
        setRequests(requests.map(request => 
          request.id === id ? { ...request, status: "completed" } : request
        ));
      }
    } catch (error) {
      console.error("Error resolving request:", error);
      alert("Failed to resolve the request. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/api/maintenance-requests/${id}`);
      // Remove the request from the local state
      setRequests(requests.filter(request => request.id !== id));
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete the request. Please try again.");
    }
  };

  if (loading) return <div className="loading-message">Loading maintenance requests...</div>;

  return (
    <div className="admin-maintenance-container">
      <h1 className="page-title">Maintenance Requests</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="maintenance-content">
        <div className="filters">
          <label>
            Filter by Status:
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>

        <div className="request-list">
          {requests.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.student_name || "Unknown"}</td>
                    <td>{request.request_type}</td>
                    <td>{request.description}</td>
                    <td>{request.priority}</td>
                    <td className={`status ${request.status}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </td>
                    <td>
                      {request.status === "pending" && (
                        <button
                          className="resolve-button"
                          onClick={() => handleResolve(request.id)}
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(request.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data-message">No maintenance requests found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMaintenance;