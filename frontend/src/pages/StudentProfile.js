import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';
import axiosInstance from '../axios';
import '../styles/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard, faEnvelope, faPhone, faBed, faUser, faGraduationCap, faHome, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

const StudentProfile = () => {
  const { user } = useContext(UserContext);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!user?.token) {
        setError('User information not available');
        setLoading(false);
        return;
      }

      try {
        const studentId = user.student_id || user.id;
        const response = await axiosInstance.get(`/api/students/${studentId}`);
        setStudentDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Failed to load student information');
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [user]);

  if (loading) return <div className="loading-message">Loading profile...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="profile-container">
      <h1 className="page-title">My Profile</h1>
      
      {studentDetails ? (
        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-avatar">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <div className="profile-name">
              <h2>{studentDetails.name}</h2>
              <span className="student-id">{studentDetails.student_id || studentDetails.id}</span>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="detail-row">
              <div className="detail-label">
                <FontAwesomeIcon icon={faIdCard} />
                <span>Student ID</span>
              </div>
              <div className="detail-value">{studentDetails.student_id || studentDetails.id}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>Email</span>
              </div>
              <div className="detail-value">{studentDetails.email}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FontAwesomeIcon icon={faPhone} />
                <span>Contact</span>
              </div>
              <div className="detail-value">{studentDetails.contact || 'Not provided'}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FontAwesomeIcon icon={faBed} />
                <span>Room Number</span>
              </div>
              <div className="detail-value">{studentDetails.room_number || 'Not assigned'}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FontAwesomeIcon icon={faHome} />
                <span>Address</span>
              </div>
              <div className="detail-value">{studentDetails.address || 'Not provided'}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FontAwesomeIcon icon={faGraduationCap} />
                <span>Department</span>
              </div>
              <div className="detail-value">{studentDetails.department || 'Not specified'}</div>
            </div>
            
            <div className="detail-row">
              <div className="detail-label">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Joined Date</span>
              </div>
              <div className="detail-value">
                {studentDetails.created_at ? new Date(studentDetails.created_at).toLocaleDateString() : 'Not available'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-profile-data">No profile information available</div>
      )}
    </div>
  );
};

export default StudentProfile; 