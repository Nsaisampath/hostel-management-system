import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from '../axios';
import "../styles/styles.css";


function Registration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roomPreference, setRoomPreference] = useState("Single");
  const [registerId, setRegisterId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/students/register', {
        name,
        email,
        contact: phone,
        password,
        room_preference: roomPreference
      });

      console.log('Registration response:', response.data);

      if (response.data && response.data.user) {
        setRegisterId(response.data.user.id);
        setSubmitted(true);
        // Store the token in localStorage if needed
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      

      {/* Page Title */}
      <h1 className="page-title">Student Registration</h1>

      {/* Registration Form Box */}
      <div className="registration-box">
        {submitted ? (
          <div className="success-message">
            <p>
              Registration successful! Your Student ID is: <strong>{registerId}</strong>
            </p>
            <p>Please note this ID for future reference.</p>
            <p>Redirecting to login page...</p>
          </div>
        ) : (
          <form onSubmit={handleRegister}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Room Preference</label>
              <select
                value={roomPreference}
                onChange={(e) => setRoomPreference(e.target.value)}
              >
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Dormitory">Dormitory</option>
              </select>
            </div>
            <div className="form-group">
              <label>Upload Required Documents</label>
              <input type="file" />
            </div>
            <button 
              type="submit" 
              className="register-button"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
            <p className="login-link">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </form>
        )}
      </div>

      
    </div>
  );
}

export default Registration;