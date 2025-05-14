import React from "react";
import "../styles/styles.css";

function About() {
  return (
    <div className="page-container">
      

      {/* Page Content */}
      <div className="about-content">
        <h1>About the Hostel</h1>
        <div className="about-section">
          <h2>Location</h2>
          <p>Inside the College premises towards the South-West of the Campus.</p>
        </div>
        <div className="about-section">
          <h2>Built-Up Space</h2>
          <p>98,450 SFT (293.00 SFT Per Student)</p>
        </div>
        <div className="about-section">
          <h2>Maximum Occupancy</h2>
          <p>336 Students</p>
          <ul>
            <li>2 Students per room for 240 Capacity</li>
            <li>3 Students per room (larger room) for 96 Capacity</li>
          </ul>
        </div>
        <div className="about-section">
          <h2>Basic Furniture Per Student</h2>
          <ul>
            <li>Cot</li>
            <li>Bedding</li>
            <li>Study Table</li>
            <li>Chair</li>
            <li>Wardrobe</li>
          </ul>
        </div>
      </div>

      
    </div>
  );
}

export default About;