import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import RoomManagement from "./pages/RoomManagement";
import StudentAdmissions from "./pages/StudentAdmissions";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import Registration from "./pages/Registration";
import AdminLeaveRequests from "./components/AdminLeaveRequests";
import StudentLeaveRequests from "./components/StudentLeaveRequests";
import About from "./components/About";
import Facilities from "./components/Facilities";
import Contact from "./components/Contact";
import "./styles/styles.css"; // Import the shared CSS file
import ViewNotices from "./pages/ViewNotices"; // Import the new component
import SendNotices from "./pages/SendNotices"; // Import the new component
import StudentMaintenance from "./pages/StudentMaintenance";
import AdminMaintenance from "./pages/AdminMaintenance";
import Footer from "./components/Footer"; 
import Header from "./components/Header";
import { UserProvider } from "./UserContext"; // Import UserProvider
import ViewAttendance from './pages/ViewAttendance'; // Import the new page
import UploadAttendance from './pages/UploadAttendance'; // Import the new page
import StudentProfile from './pages/StudentProfile'; // Import the profile page

// Protected route component
function ProtectedRoute({ children, allowedRoles }) {
  // Check if user is logged in from localStorage
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!userStr || !token) {
    // User is not logged in
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    
    // Check if user has allowed role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // User doesn't have the required role
      return <Navigate to="/" replace />;
    }
    
    // User is authenticated and has the required role
    return children;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return <Navigate to="/login" replace />;
  }
}

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Header />
        <div className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/about" element={<About />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/room-management" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RoomManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/student-admissions" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentAdmissions />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportsAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/leave-requests" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLeaveRequests />
              </ProtectedRoute>
            } />
            <Route path="/admin/send-notices" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SendNotices />
              </ProtectedRoute>
            } />
            <Route path="/admin/maintenance-requests" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminMaintenance />
              </ProtectedRoute>
            } />
            <Route path="/admin/upload-attendance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UploadAttendance />
              </ProtectedRoute>
            } />
            
            {/* Student routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/leave-requests" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLeaveRequests />
              </ProtectedRoute>
            } />
            <Route path="/student/view-notices" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ViewNotices />
              </ProtectedRoute>
            } />
            <Route path="/student/maintenance-requests" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentMaintenance />
              </ProtectedRoute>
            } />
            <Route path="/student/view-attendance" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ViewAttendance />
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProfile />
              </ProtectedRoute>
            } />
            
            {/* Fallback route - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </UserProvider>
  );
}

export default App;