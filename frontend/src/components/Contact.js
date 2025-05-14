import React from "react";
import "../styles/styles.css";

function Contact() {
  return (
    <div className="page-container">
      

      {/* Page Content */}
      <div className="contact-content">
        <h1>Contact Us</h1>
        <div className="contact-section">
          <h2>Chief Warden</h2>
          <p>Dr. G. Anjaneyulu, Prof, Dept of ECE</p>
          <p>Email: <a href="mailto:warden.bh@mvgrce.edu.in">warden.bh@mvgrce.edu.in</a></p>
          <p>Mobile: <a href="tel:9491759682">9491759682</a></p>
        </div>
        <div className="contact-section">
          <h2>Address</h2>
          <p>Abhinava Andhra Bhoja Maharajah Ananda Gajapathi Hostel</p>
          <p>Inside the College premises towards the South-West of the Campus.</p>
        </div>
      </div>

      
    </div>
  );
}

export default Contact;