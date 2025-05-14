import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";
import axiosInstance from "../axios";
import "../styles/styles.css";

function StudentLeaveRequests() {
  const { user } = useContext(UserContext);
  const [newRequest, setNewRequest] = useState({
    leaveType: "Personal",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      if (!user?.token) {
        setError("You must be logged in to view leave requests");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/leave-requests/student/${user.id || user.student_id}`);
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

  const handleAddRequest = async () => {
    if (!newRequest.reason || !newRequest.startDate || !newRequest.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitLoading(true);
      const response = await axiosInstance.post("/api/leave-requests", {
        start_date: newRequest.startDate,
        end_date: newRequest.endDate,
        reason: newRequest.reason,
        leave_type: newRequest.leaveType
      });

      setRequests([response.data, ...requests]);
      setNewRequest({ leaveType: "Personal", startDate: "", endDate: "", reason: "" });
      alert("Leave request submitted successfully!");
    } catch (err) {
      console.error("Error submitting leave request:", err);
      alert(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div className="loading-message">Loading leave requests...</div>;

  return (
    <div className="leave-requests-student">
      <h1 className="page-title">Request Leave</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="leave-request-form">
        <div className="form-group">
          <label>Leave Type</label>
          <select
            value={newRequest.leaveType}
            onChange={(e) =>
              setNewRequest({ ...newRequest, leaveType: e.target.value })
            }
          >
            <option value="Personal">Personal</option>
            <option value="Medical">Medical</option>
            <option value="Vacation">Vacation</option>
          </select>
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={newRequest.startDate}
            onChange={(e) =>
              setNewRequest({ ...newRequest, startDate: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={newRequest.endDate}
            onChange={(e) =>
              setNewRequest({ ...newRequest, endDate: e.target.value })
            }
          />
        </div>
        <div className="form-group">
          <label>Reason</label>
          <textarea
            value={newRequest.reason}
            onChange={(e) =>
              setNewRequest({ ...newRequest, reason: e.target.value })
            }
          />
        </div>
        <button 
          className="submit-button" 
          onClick={handleAddRequest}
          disabled={submitLoading}
        >
          {submitLoading ? "Submitting..." : "Submit Request"}
        </button>
      </div>

      <h2>Your Leave Requests</h2>
      <div className="leave-requests-list">
        {requests.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.leave_type}</td>
                  <td>{new Date(request.start_date).toLocaleDateString()}</td>
                  <td>{new Date(request.end_date).toLocaleDateString()}</td>
                  <td>{request.reason}</td>
                  <td className={`status ${request.status}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No leave requests found</p>
        )}
      </div>
    </div>
  );
}

export default StudentLeaveRequests;