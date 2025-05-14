import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../axios";
import { UserContext } from "../UserContext";
import "../styles/styles.css"; // Import your CSS file

function RoomManagement() {
  const { user } = useContext(UserContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    type: "Single",
    capacity: "",
    floor: "1"
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New state for student assignment
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user?.token) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/rooms");
        setRooms(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Failed to load rooms data");
        setLoading(false);
      }
    };

    fetchRooms();
  }, [user]);

  // New function to fetch available students (those without assigned rooms)
  const fetchAvailableStudents = async () => {
    try {
      setAssignLoading(true);
      const response = await axiosInstance.get("/api/students", {
        params: { status: "active", unassigned: true }
      });
      setAvailableStudents(response.data);
      setAssignLoading(false);
    } catch (err) {
      console.error("Error fetching available students:", err);
      alert("Failed to load available students");
      setAssignLoading(false);
    }
  };

  const handleAddRoom = async () => {
    if (!newRoom.roomNumber || !newRoom.capacity || !newRoom.floor) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await axiosInstance.post("/api/rooms", {
        room_number: newRoom.roomNumber,
        capacity: parseInt(newRoom.capacity),
        room_type: newRoom.type,
        floor: newRoom.floor
      });

      setRooms([...rooms, response.data]);
      setNewRoom({ roomNumber: "", type: "Single", capacity: "", floor: "1" });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding room:", err);
      alert(err.response?.data?.message || "Failed to add room");
    }
  };

  const handleDeleteRoom = async (roomNumber) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/rooms/${roomNumber}`);
      setRooms(rooms.filter(room => room.room_number !== roomNumber));
    } catch (err) {
      console.error("Error deleting room:", err);
      alert(err.response?.data?.message || "Failed to delete room");
    }
  };

  // New function to open assign modal
  const openAssignModal = (room) => {
    setSelectedRoom(room);
    setSelectedStudent("");
    fetchAvailableStudents();
    setIsAssignModalOpen(true);
  };

  // New function to handle student assignment
  const handleAssignStudent = async () => {
    if (!selectedStudent) {
      alert("Please select a student");
      return;
    }

    try {
      await axiosInstance.post(`/api/rooms/${selectedRoom.room_number}/assign`, {
        student_id: selectedStudent
      });
      
      // Update rooms data to reflect the new assignment
      const updatedRooms = await axiosInstance.get("/api/rooms");
      setRooms(updatedRooms.data);
      
      alert("Student assigned to room successfully");
      setIsAssignModalOpen(false);
    } catch (err) {
      console.error("Error assigning student:", err);
      alert(err.response?.data?.message || "Failed to assign student to room");
    }
  };

  if (loading) return <div className="loading">Loading rooms...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="room-management-page">
      

      {/* Page Title */}
      <h1 className="page-title">Room Management</h1>

      {/* Add New Room Button */}
      <button className="add-room-button" onClick={() => setIsModalOpen(true)}>
        Add New Room
      </button>

      {/* Room List */}
      <div className="room-list">
        {rooms.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Room No.</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Floor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.room_number}>
                  <td>{room.room_number}</td>
                  <td>{room.room_type}</td>
                  <td>{room.capacity}</td>
                  <td>{room.floor}</td>
                  <td>
                    {room.occupied_beds || 0}/{room.capacity} ({room.availability_status})
                  </td>
                  <td>
                    <button className="edit-button">Edit</button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteRoom(room.room_number)}
                    >
                      Delete
                    </button>
                    {room.availability_status !== "Full" && (
                      <button
                        className="assign-button"
                        onClick={() => openAssignModal(room)}
                      >
                        Assign Student
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No rooms found</p>
        )}
      </div>

      {/* Add New Room Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={() => setIsModalOpen(false)}>
              &times;
            </span>
            <h2>Add New Room</h2>
            <div className="form-group">
              <label>Room Number</label>
              <input
                type="text"
                placeholder="Enter room number"
                value={newRoom.roomNumber}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, roomNumber: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Room Type</label>
              <select
                value={newRoom.type}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, type: e.target.value })
                }
              >
                <option key="standard" value="standard">Standard</option>
                <option key="deluxe" value="deluxe">Deluxe</option>
                <option key="premium" value="premium">Premium</option>
              </select>
            </div>
            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                placeholder="Enter capacity"
                value={newRoom.capacity}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, capacity: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Floor</label>
              <input
                type="text"
                placeholder="Enter floor"
                value={newRoom.floor}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, floor: e.target.value })
                }
                required
              />
            </div>
            <button className="save-button" onClick={handleAddRoom}>
              Save
            </button>
          </div>
        </div>
      )}

      {/* Assign Student Modal */}
      {isAssignModalOpen && selectedRoom && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={() => setIsAssignModalOpen(false)}>
              &times;
            </span>
            <h2>Assign Student to Room {selectedRoom.room_number}</h2>
            
            {assignLoading ? (
              <div className="loading">Loading available students...</div>
            ) : (
              <>
                {availableStudents.length > 0 ? (
                  <div className="form-group">
                    <label>Select Student</label>
                    <select
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                      <option value="">Select a student</option>
                      {availableStudents.map((student) => (
                        <option key={student.student_id} value={student.student_id}>
                          {student.student_id} - {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <p>No available students without room assignments</p>
                )}
                
                {availableStudents.length > 0 && (
                  <button 
                    className="save-button" 
                    onClick={handleAssignStudent}
                    disabled={!selectedStudent}
                  >
                    Assign
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      
    </div>
  );
}

export default RoomManagement;