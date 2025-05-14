import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import "../styles/styles.css";

function LeaveRequests({ userRole = "student" }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(UserContext);

  const [newRequest, setNewRequest] = useState({
    leaveType: "Personal",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Fetch leave requests on component mount
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        setLoading(true);
        let response;
        
        if (userRole === "admin") {
          response = await axios.get("/api/leave-requests", {
            headers: {
              Authorization: `Bearer ${user?.token}`
            }
          });
        } else {
          response = await axios.get(`/api/leave-requests/student/${user?.student_id || user?.id}`, {
            headers: {
              Authorization: `Bearer ${user?.token}`
            }
          });
        }
        
        setRequests(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching leave requests:", err);
        setError("Failed to load leave requests");
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchLeaveRequests();
    }
  }, [userRole, user]);

  const handleAddRequest = async () => {
    if (!newRequest.reason || !newRequest.startDate || !newRequest.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const newLeaveRequest = await axios.post("/api/leave-requests", {
        start_date: newRequest.startDate,
        end_date: newRequest.endDate,
        reason: newRequest.reason,
        leave_type: newRequest.leaveType
      }, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      setRequests([newLeaveRequest.data, ...requests]);
      setNewRequest({ leaveType: "Personal", startDate: "", endDate: "", reason: "" });
      alert("Leave request submitted successfully!");
    } catch (err) {
      console.error("Error submitting leave request:", err);
      alert(err.response?.data?.message || "Failed to submit leave request");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      // Call the API but don't need to store the response since we're updating locally
      await axios.put(`/api/leave-requests/${id}/status`, {
        status: status.toLowerCase()
      }, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      setRequests(
        requests.map((req) =>
          req.id === id ? { ...req, status: status.toLowerCase() } : req
        )
      );
      alert(`Leave request ${status.toLowerCase()}`);
    } catch (err) {
      console.error("Error updating leave request:", err);
      alert(err.response?.data?.message || "Failed to update leave request");
    }
  };

  if (loading) return <div>Loading leave requests...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="leave-requests">
      <h1>Leave Requests</h1>

      {/* Student View */}
      {userRole === "student" && (
        <div className="student-view">
          <h2>Submit a Leave Request</h2>
          <div className="request-form">
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
            <input
              type="date"
              placeholder="Start Date"
              value={newRequest.startDate}
              onChange={(e) =>
                setNewRequest({ ...newRequest, startDate: e.target.value })
              }
            />
            <input
              type="date"
              placeholder="End Date"
              value={newRequest.endDate}
              onChange={(e) =>
                setNewRequest({ ...newRequest, endDate: e.target.value })
              }
            />
            <textarea
              placeholder="Reason for leave"
              value={newRequest.reason}
              onChange={(e) =>
                setNewRequest({ ...newRequest, reason: e.target.value })
              }
            />
            <button onClick={handleAddRequest}>Submit Request</button>
          </div>

          <h2>Your Leave Requests</h2>
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.leave_type || "Personal"}</td>
                    <td>{new Date(req.start_date).toLocaleDateString()} to {new Date(req.end_date).toLocaleDateString()}</td>
                    <td>{req.reason}</td>
                    <td>{req.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No leave requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin View */}
      {userRole === "admin" && (
        <div className="admin-view">
          <h2>Manage Leave Requests</h2>
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
              {requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.id}</td>
                    <td>{req.student_name || "Student"}</td>
                    <td>{req.leave_type || "Personal"}</td>
                    <td>{new Date(req.start_date).toLocaleDateString()} to {new Date(req.end_date).toLocaleDateString()}</td>
                    <td>{req.reason}</td>
                    <td>{req.status}</td>
                    <td>
                      {req.status === "pending" && (
                        <>
                          <button onClick={() => handleUpdateStatus(req.id, "Approved")}>
                            Approve
                          </button>
                          <button onClick={() => handleUpdateStatus(req.id, "Rejected")}>
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
      )}
    </div>
  );
}

export default LeaveRequests;