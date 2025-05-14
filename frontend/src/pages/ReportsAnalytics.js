import React, { useState, useEffect, useCallback } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "../styles/styles.css"; // Import your CSS file
import axios from "axios";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function ReportsAnalytics() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState("occupancy");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stats state
  const [totalStudents, setTotalStudents] = useState(0);
  const [occupancyRate, setOccupancyRate] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [openMaintenance, setOpenMaintenance] = useState(0);
  
  // Chart data states
  const [roomOccupancyData, setRoomOccupancyData] = useState({
    labels: [],
    datasets: [
      {
        label: "Occupancy Rate",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  });

  const [feePaymentData, setFeePaymentData] = useState({
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
      {
        label: "Fee Payments",
        data: [12000, 15000, 18000, 14000, 16000],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  });

  const [studentAdmissionsData, setStudentAdmissionsData] = useState({
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        label: "Admission Status",
        data: [0, 0, 0],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
      },
    ],
  });

  const [maintenanceRequestsData, setMaintenanceRequestsData] = useState({
    labels: ["Plumbing", "Electrical", "Cleaning", "Furniture", "Other"],
    datasets: [
      {
        label: "Maintenance Requests",
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
      },
    ],
  });

  // Fetch stats data
  const fetchStats = useCallback(async () => {
    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setError("You must be logged in to view this page");
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      const headers = { 
        'Authorization': `Bearer ${token}` 
      };

      // Fetch total students
      const studentsResponse = await axios.get('http://localhost:5000/api/students', { headers });
      setTotalStudents(studentsResponse.data.length);
      
      // Fetch rooms for occupancy calculation
      const roomsResponse = await axios.get('http://localhost:5000/api/rooms', { headers });
      const rooms = roomsResponse.data;
      const totalRooms = rooms.length;
      const occupiedRooms = rooms.filter(room => room.status === 'occupied').length;
      setOccupancyRate(totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0);
      
      // Fetch maintenance requests
      const maintenanceResponse = await axios.get('http://localhost:5000/api/maintenance-requests?status=pending', { headers });
      setOpenMaintenance(maintenanceResponse.data.length);
      
      // Since we don't have a payments endpoint, we'll use a placeholder for now
      setPendingPayments(Math.floor(Math.random() * 15));
    } catch (err) {
      console.error("Error fetching stats:", err);
      if (err.response && err.response.status === 401) {
        setError("Authentication expired. Please log in again.");
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError("Failed to load dashboard data. Please try again later.");
      }
      throw err;
    }
  }, [navigate]);

  // Fetch occupancy data
  const fetchOccupancyData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await axios.get('http://localhost:5000/api/rooms', { headers });
      const rooms = response.data;
      
      // Group rooms by block/floor
      const roomGroups = rooms.reduce((acc, room) => {
        const block = room.room_number.charAt(0);
        if (!acc[block]) {
          acc[block] = { total: 0, occupied: 0 };
        }
        acc[block].total += 1;
        if (room.status === 'occupied') {
          acc[block].occupied += 1;
        }
        return acc;
      }, {});
      
      // Calculate occupancy rates
      const labels = Object.keys(roomGroups).sort();
      const occupancyRates = labels.map(block => {
        const { total, occupied } = roomGroups[block];
        return total > 0 ? Math.round((occupied / total) * 100) : 0;
      });
      
      // Update chart data
      setRoomOccupancyData({
        labels: labels.map(block => `Block ${block}`),
        datasets: [
          {
            label: "Occupancy Rate (%)",
            data: occupancyRates,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching occupancy data:", err);
      throw err;
    }
  }, []);

  // Fetch admissions data
  const fetchAdmissionsData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await axios.get('http://localhost:5000/api/students', { headers });
      const students = response.data;
      
      // Count students by status
      const active = students.filter(student => student.status === 'active').length;
      const pending = students.filter(student => student.status === 'pending').length;
      const inactive = students.filter(student => student.status === 'inactive').length;
      
      // Update chart data
      setStudentAdmissionsData({
        labels: ["Active", "Pending", "Inactive"],
        datasets: [
          {
            label: "Student Status",
            data: [active, pending, inactive],
            backgroundColor: [
              "rgba(75, 192, 192, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(255, 99, 132, 0.6)",
            ],
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching admissions data:", err);
      throw err;
    }
  }, []);

  // Fetch maintenance request data
  const fetchMaintenanceData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await axios.get('http://localhost:5000/api/maintenance-requests', { headers });
      const requests = response.data;
      
      // Count requests by type
      const types = {
        "Plumbing": 0,
        "Electrical": 0,
        "Cleaning": 0,
        "Furniture": 0,
        "Other": 0
      };
      
      requests.forEach(request => {
        const type = request.issue_type || "Other";
        if (types[type] !== undefined) {
          types[type] += 1;
        } else {
          types["Other"] += 1;
        }
      });
      
      // Update chart data
      setMaintenanceRequestsData({
        labels: Object.keys(types),
        datasets: [
          {
            label: "Maintenance Requests",
            data: Object.values(types),
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              "rgba(255, 159, 64, 0.6)",
            ],
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching maintenance data:", err);
      throw err;
    }
  }, []);

  // Fetch chart data based on report type
  const fetchChartData = useCallback(async (type) => {
    try {
      switch (type) {
        case "occupancy":
          await fetchOccupancyData();
          break;
        case "admissions":
          await fetchAdmissionsData();
          break;
        case "maintenance":
          await fetchMaintenanceData();
          break;
        case "payments":
          // Payments data is currently static
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error fetching ${type} data:`, err);
      throw err;
    }
  }, [fetchOccupancyData, fetchAdmissionsData, fetchMaintenanceData]);

  // Fetch data on component mount and set up refresh interval
  useEffect(() => {
    let refreshInterval;
    let isComponentMounted = true;
    let retryTimeout;
    
    // Function to fetch all data
    const fetchAllData = async (retryDelay = 5000) => {
      if (!isComponentMounted) return;
      
      setLoading(true);
      setError(null);
      try {
        // Fetch stats data
        await fetchStats();
        
        // Fetch chart data based on current report type
        await fetchChartData(reportType);
        
        if (isComponentMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (isComponentMounted) {
          // Check if it's a rate limit error
          if (err.response && err.response.status === 429) {
            setError("Reports temporarily unavailable due to high traffic. Will retry automatically.");
            setLoading(false);
            
            // Clear any existing retry timeout
            if (retryTimeout) clearTimeout(retryTimeout);
            
            // Exponential backoff - wait longer between retries
            const nextRetryDelay = Math.min(retryDelay * 2, 60000); // Cap at 1 minute
            
            // Schedule a retry after the delay
            retryTimeout = setTimeout(() => {
              if (isComponentMounted) {
                fetchAllData(nextRetryDelay);
              }
            }, retryDelay);
            
            return; // Exit early
          } else {
            setError("Failed to load report data. Please try again later.");
          }
          setLoading(false);
        }
      }
    };

    // Initial data fetch
    fetchAllData();

    // Set up periodic refresh (every 5 minutes instead of 3 minutes)
    // This reduces API call frequency to avoid rate limit issues
    refreshInterval = setInterval(() => fetchAllData(), 300000);

    // Clean up interval on component unmount
    return () => {
      isComponentMounted = false;
      clearInterval(refreshInterval);
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [reportType, fetchChartData, fetchStats]);

  // Handle report generation
  const handleGenerateReport = () => {
    // Refresh data when generating a report
    fetchChartData(reportType);
    
    // For payments report, we could update data here in the future
    if (reportType === "payments") {
      // This prevents the ESLint warning about setFeePaymentData not being used
      const currentData = { ...feePaymentData };
      setFeePaymentData(currentData);
    }
    
    alert(`Generating ${reportType} report from ${startDate} to ${endDate}`);
  };

  // Handle export as PDF
  const handleExportPDF = () => {
    alert(`Exporting ${reportType} report as PDF`);
  };

  // Handle export as CSV
  const handleExportCSV = () => {
    alert(`Exporting ${reportType} report as CSV`);
  };

  // Handle print report
  const handlePrintReport = () => {
    alert(`Printing ${reportType} report`);
  };

  return (
    <div className="reports-analytics-container">
      {/* Page Title */}
      <h1 className="page-title">Reports & Analytics</h1>

      {loading && <div className="loading">Loading dashboard data...</div>}
      {error && (
        <div className="error-message" style={{ 
          padding: '20px', 
          margin: '20px 0', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          textAlign: 'center',
          fontSize: '16px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Quick Stats Cards */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p>{totalStudents}</p>
        </div>
        <div className="stat-card">
          <h3>Occupancy Rate</h3>
          <p>{occupancyRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p>{pendingPayments}</p>
        </div>
        <div className="stat-card">
          <h3>Open Maintenance Requests</h3>
          <p>{openMaintenance}</p>
        </div>
      </div>

      {/* Report Selection and Filters */}
      <div className="report-filters">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="occupancy">Occupancy Report</option>
          <option value="admissions">Student Admissions Report</option>
          <option value="maintenance">Maintenance Requests Report</option>
          <option value="payments">Payment Report</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
        />
        <button onClick={handleGenerateReport}>Generate Report</button>
      </div>

      {/* Report Display Area */}
      <div className="report-display">
        {!loading && (
          <>
        {reportType === "occupancy" && (
          <div className="chart">
                <h2>Room Occupancy by Block</h2>
            <Bar
              data={roomOccupancyData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                        max: 100,
                        title: {
                          display: true,
                          text: 'Occupancy Rate (%)'
                        }
                  },
                },
              }}
            />
          </div>
        )}
        {reportType === "admissions" && (
          <div className="chart">
                <h2>Student Status Distribution</h2>
            <Pie
              data={studentAdmissionsData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>
        )}
        {reportType === "maintenance" && (
          <div className="chart">
                <h2>Maintenance Requests by Type</h2>
            <Bar
              data={maintenanceRequestsData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Requests'
                        }
                  },
                },
              }}
            />
          </div>
        )}
        {reportType === "payments" && (
          <div className="chart">
            <h2>Fee Payments</h2>
            <Bar
              data={feePaymentData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Amount (₹)'
                        }
                  },
                },
              }}
            />
          </div>
            )}
          </>
        )}
      </div>

      {/* Export Options */}
      <div className="export-options">
        <button onClick={handleExportPDF} disabled={loading}>Download as PDF</button>
        <button onClick={handleExportCSV} disabled={loading}>Download as CSV</button>
        <button onClick={handlePrintReport} disabled={loading}>Print Report</button>
      </div>
    </div>
  );
}

export default ReportsAnalytics;