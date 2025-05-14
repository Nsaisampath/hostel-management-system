import React, { useState, useContext } from "react";
import axiosInstance from "../axios";
import { UserContext } from "../UserContext";
import "../styles/styles.css"; // Import your CSS file

const SendNotices = () => {
  const { user } = useContext(UserContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.token) {
      setError("You must be logged in as admin to send notices");
      return;
    }
    
    if (!title || !content) {
      setError("Please provide both title and content for the notice");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      setSuccess(false);
      
      const response = await axiosInstance.post("/api/notices", { 
        title, 
        content, 
        priority 
      });
      
      console.log("Notice sent successfully:", response.data);
      setSuccess(true);
      setTitle("");
      setContent("");
      setPriority("normal");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error sending notice:", err);
      setError(err.response?.data?.message || "Failed to send notice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-notices-container">
      <h1 className="page-title">Send Notices</h1>
      
      {success && (
        <div className="success-message">
          Notice sent successfully!
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}

      <div className="notice-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notice title"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter notice content"
              rows="6"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Notice"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendNotices;