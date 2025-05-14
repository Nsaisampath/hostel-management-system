import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Hostel Management System</h1>
        <p>Efficiently manage your hostel accommodation with our comprehensive system</p>
        
        {!currentUser ? (
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-secondary">Register</Link>
          </div>
        ) : (
          <div className="dashboard-link">
            <Link to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-bed"></i>
            <h3>Room Management</h3>
            <p>Easily manage room allocations and track occupancy</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-users"></i>
            <h3>Student Portal</h3>
            <p>Access your hostel information and make requests</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-clipboard-list"></i>
            <h3>Maintenance Requests</h3>
            <p>Submit and track maintenance requests</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-calendar-alt"></i>
            <h3>Leave Management</h3>
            <p>Apply for leave and track approval status</p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>About Our System</h2>
        <p>
          Our Hostel Management System provides a comprehensive solution for managing
          student accommodations. It streamlines the process of room allocation,
          maintenance requests, and leave applications, making it easier for both
          students and administrators to manage hostel-related activities.
        </p>
      </div>
    </div>
  );
};

export default Home; 