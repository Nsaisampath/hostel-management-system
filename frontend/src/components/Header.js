import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { UserContext } from "../UserContext";
import "../styles/styles.css";
import hostelLogo from "../assets/hostel-logo.png";

const Header = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(UserContext);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1); // Go back to the previous page
    } else {
      navigate("/"); // Navigate to home if no history
    }
  };

  return (
    <div className="header">
      {/* Logo */}
      <div className="logo">
        <img src={hostelLogo} alt="Hostel Logo" className="logo-image" />
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/facilities">Facilities</Link>
        <Link to="/contact">Contact</Link>
      </div>

      {/* Login/Logout and Back Button */}
      <div className="auth-buttons">
        {isLoggedIn ? (
          <Link to="/logout" className="auth-button" onClick={() => setIsLoggedIn(false)}>
            Logout
          </Link>
        ) : (
          <Link to="/login" className="auth-button">
            Login
          </Link>
        )}
        <button className="back-button" onClick={handleBack}>
          Back
        </button>
      </div>
    </div>
  );
};

export default Header;