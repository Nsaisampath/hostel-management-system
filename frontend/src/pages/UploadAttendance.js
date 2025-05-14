import React, { useState, useContext } from 'react';
import axiosInstance from '../axios';
import { UserContext } from '../UserContext';

const UploadAttendance = () => {
  const { user } = useContext(UserContext);
  const [file, setFile] = useState(null);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.token) {
      setError('You must be logged in to upload attendance');
      return;
    }
    
    if (!file || !date) {
      setError('Please select a file and date');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('date', date);
      
      await axiosInstance.post('/api/attendance/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Attendance uploaded successfully!');
      setFile(null);
      // Reset the file input
      document.getElementById('attendanceFile').value = '';
    } catch (err) {
      console.error('Error uploading attendance:', err);
      setError(err.response?.data?.message || 'Failed to upload attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-attendance-container">
      <h2 className="page-title">Upload Attendance</h2>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="attendanceDate">
            Attendance Date
          </label>
          <input
            type="date"
            className="form-control"
            id="attendanceDate"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="attendanceFile">
            Select Attendance File (CSV or Excel)
          </label>
          <input
            type="file"
            className="form-control"
            id="attendanceFile"
            onChange={handleFileChange}
            accept=".csv, .xlsx"
            required
          />
          <small className="form-text">
            File should contain columns: student_id, status (present/absent/late)
          </small>
        </div>
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
};

export default UploadAttendance;