import React, { useState, useContext, useEffect } from "react";
import axiosInstance from "../axios";
import { UserContext } from "../UserContext";
import "../styles/styles.css";

const StudentMaintenance = () => {
  const [requestType, setRequestType] = useState("");
  const [description, setDescription] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { user } = useContext(UserContext);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    // Fetch user details to get the most up-to-date room assignment
    const fetchUserDetails = async () => {
      if (!user?.token || !user?.id) return;
      
      try {
        const response = await axiosInstance.get(`/api/students/${user.id}`);
        setUserDetails(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };
    
    // Fetch maintenance requests
    const fetchMaintenanceRequests = async () => {
      if (!user?.token) {
        setError("You must be logged in to view maintenance requests");
        setFetchLoading(false);
        return;
      }

      try {
        setFetchLoading(true);
        const response = await axiosInstance.get(`/api/maintenance-requests/student/${user.id || user.student_id}`);
        setRequests(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching maintenance requests:", err);
        setError("Failed to load maintenance requests. Please try again later.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUserDetails();
    fetchMaintenanceRequests();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.token) {
      setError("You must be logged in to submit a maintenance request");
      return;
    }
    
    if (!requestType || !description || !urgencyLevel) {
      setError("Please fill all required fields");
      return;
    }
    
    // Check if user has a room assigned - use userDetails which has the most current data
    const roomNumber = userDetails?.room_number || user?.room_number;
    if (!roomNumber) {
      setError("You must have a room assigned to create a maintenance request.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      setSuccess(false);
      
      const payload = {
        issue_type: requestType,
        description,
        priority: urgencyLevel,
        room_number: roomNumber
      };
      
      const response = await axiosInstance.post("/api/maintenance-requests", payload);
      
      console.log("Maintenance request submitted:", response.data);
      setSuccess(true);
      setRequestType("");
      setDescription("");
      setUrgencyLevel("");
      
      // Add the new request to the list
      setRequests([response.data, ...requests]);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting maintenance request:", error);
      setError(error.response?.data?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="loading-message">Loading maintenance requests...</div>;

  return (
    <div className="student-maintenance-container">
      <h1 className="page-title">Maintenance Requests</h1>

      {success && (
        <div className="success-message">
          Your maintenance request has been submitted successfully!
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {/* Show room number information */}
      {userDetails && (
        <div className="room-info">
          <p>Your Room: {userDetails.room_number || "Not Assigned"}</p>
          {!userDetails.room_number && (
            <p className="warning">You need a room assignment before you can submit maintenance requests.</p>
          )}
        </div>
      )}

      <div className="maintenance-requests-container">
        <h3>Create Maintenance Request</h3>
        <div className="maintenance-request-form">
          <form onSubmit={handleSubmit} className="request-form-vertical">
            <div className="form-field">
              <label htmlFor="requestType">Request Type:</label>
              <select
                id="requestType"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                required
              >
                <option value="">Select Request Type</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Furniture">Furniture</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Please describe the issue in detail"
              />
            </div>

            <div className="form-field">
              <label htmlFor="urgencyLevel">Urgency Level:</label>
              <select
                id="urgencyLevel"
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value)}
                required
              >
                <option value="">Select Urgency Level</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || !userDetails?.room_number}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>

      <h2>Your Maintenance Requests</h2>
      <div className="maintenance-requests-list">
        {requests.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.issue_type || request.request_type}</td>
                  <td>{request.description}</td>
                  <td>{request.priority}</td>
                  <td className={`status ${request.status}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No maintenance requests found</p>
        )}
      </div>
    </div>
  );
};

export default StudentMaintenance;