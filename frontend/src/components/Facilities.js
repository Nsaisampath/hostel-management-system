import React from "react";
import "../styles/styles.css";

function Facilities() {
  return (
    <div className="page-container">
      

      {/* Page Content */}
      <div className="facilities-content">
        <h1>Facilities</h1>
        <div className="facilities-section">
          <h2>Recreational Facilities</h2>
          <ul>
            <li>Gym</li>
            <li>TV Room</li>
            <li>Massive Play Areas including:
              <ul>
                <li>Badminton Courts</li>
                <li>Complete access to College Campus play areas</li>
              </ul>
            </li>
            <li>Spacious Dining Areas</li>
            <li>Reading Lounges</li>
          </ul>
        </div>
        <div className="facilities-section">
          <h2>Support Systems</h2>
          <ul>
            <li>24*7 Security</li>
            <li>Adequate CCTV Coverage</li>
            <li>Enclosed Campus</li>
            <li>Assistant Wardens (available 24*7 in shifts)</li>
            <li>A Warden who is teaching staff of the college</li>
            <li>First-Class Sanitation</li>
            <li>Housekeeping Maintenance to ensure up-keep and Hygiene</li>
            <li>24*7 Generator Backup</li>
          </ul>
        </div>
        <div className="facilities-section">
          <h2>Food Services</h2>
          <ul>
            <li>Breakfast</li>
            <li>Lunch</li>
            <li>Evening Snack</li>
            <li>Dinner</li>
            <li>Special Meal on Sunday Lunch</li>
          </ul>
        </div>
      </div>

      
    </div>
  );
}

export default Facilities;