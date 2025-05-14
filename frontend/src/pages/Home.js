import React from "react";
import "../styles/styles.css"; // Import your CSS file
import student1 from "../assets/student1.jpg";
import student2 from "../assets/student2.jpg";
import student3 from "../assets/student3.jpg";
import ImageCarousel from '../components/ImageCarousel';
function Home() {
  return (
    <div className="home-container">
      

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>WELCOME TO MVGR COLLEGE HOSTEL...</h1>
          <div className="cta-buttons">
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="highlights-section">
        <h2>Why Choose Us?</h2>
        <div className="highlights">
          <div className="highlight">
            <i className="fas fa-wifi"></i>
            <p>High-Speed Wi-Fi</p>
          </div>
          <div className="highlight">
            <i className="fas fa-tshirt"></i>
            <p>Laundry Facilities</p>
          </div>
          <div className="highlight">
            <i className="fas fa-shield-alt"></i>
            <p>24/7 Security</p>
          </div>
          <div className="highlight">
            <i className="fas fa-book"></i>
            <p>Quiet Study Rooms</p>
          </div>
        </div>
        <h2>GALLERY</h2>
        <ImageCarousel /> 
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
      <h2>What Our Students Say</h2>
      <div className="testimonials">
        <div className="testimonial">
          <img src={student1} alt="Student" />
          <p className="name">Sai Sampath, 3rd Year</p>
          <p className="quote">"Great experience!"</p>
        </div>
        <div className="testimonial">
          <img src={student2} alt="Student" />
          <p className="name">Sai Ganesh, 3rd Year</p>
          <p className="quote">"Very comfortable!"</p>
        </div>
        <div className="testimonial">
          <img src={student3} alt="Student" />
          <p className="name">Naveen, 3rd Year</p>
          <p className="quote">"Best hostel ever!"</p>
        </div>
      </div>
    </div>

      
    </div>
  );
}

export default Home;