import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import axiosInstance from '../axios';
import "../styles/styles.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role is student
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }

    try {
      const endpoint = role === "admin" 
        ? "/api/admin/login"
        : "/api/students/login";

      console.log("Sending login request to:", endpoint, { email, password, role });
      
      const response = await axiosInstance.post(endpoint, {
        email,
        password
      });

      console.log("Login response:", response.data);

      if (response.data) {
        // Use the login method from UserContext
        // Handle different response formats from backend
        const userData = role === "admin" 
          ? response.data.admin 
          : (response.data.user || response.data.student); // Check for both user and student
        
        if (userData) {
          // Add role to user data
          userData.role = role;
          
          // Log successful login data
          console.log("Login successful, user data:", userData);
          
          login(userData, response.data.token);
          
          // Redirect based on role
          if (role === "admin") {
            navigate("/admin");
          } else {
            navigate("/student");
          }
        } else {
          console.error("No user data in response:", response.data);
          setError("Login failed: Invalid response from server");
        }
      }
    } catch (err) {
      console.error('Login error details:', err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Image */}
      <div className="background-image"></div>
      

      {/* Login Form */}
      <div className="login-form-container">
        <div className="login-form">
          <h1>Login to Your Account</h1>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Select Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <div className="forgot-password">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="register-prompt">
            Don't have an account? {role === "admin" ? (
              <button 
                onClick={() => {
                  const username = prompt("Enter admin username:");
                  const password = prompt("Enter admin password:");
                  const email = prompt("Enter admin email:");
                  if (username && password && email) {
                    axiosInstance.post("/api/admin/register", {
                      username,
                      password,
                      email
                    })
                    .then(response => {
                      alert("Admin registered successfully! Please login.");
                    })
                    .catch(error => {
                      alert(error.response?.data?.message || "Registration failed");
                    });
                  }
                }}
                className="register-link"
              >
                Register as Admin
              </button>
            ) : (
              <Link to="/register">Register here</Link>
            )}
          </p>
        </div>
      </div>

      
    </div>
  );
}

export default Login;