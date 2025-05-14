import React from "react";
import "../styles/styles.css"; // Import your CSS file

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
    

        {/* Contact Information */}
        <div className="contact-info">
          <p>Address: MVGR College of Engineering(A),</p>
          <p>  Vijayaram Nagar campus, Chintalavalasa, Vizianagaram,</p>
          <p> Andhra Pradesh 535005,</p>
          <p>Phone: 9491759682 | Email:  warden.bh@mvgrce.edu.in</p>
        </div>

        {/* Social Media Links */}
        <div className="social-media">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-twitter"></i>
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="copyright">
        <p>&copy; {new Date().getFullYear()} Hostel Management System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;