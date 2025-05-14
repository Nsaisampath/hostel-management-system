-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS maintenance_requests;
DROP TABLE IF EXISTS fees;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS notices;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS counters;

-- Create counters table to track auto-incrementing values
CREATE TABLE counters (
  counter_name VARCHAR(50) PRIMARY KEY,
  counter_value INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial counter for student IDs
INSERT INTO counters (counter_name, counter_value) VALUES ('student_number', 0);

-- Create admins table
CREATE TABLE admins (
  admin_id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE rooms (
  room_id SERIAL PRIMARY KEY,
  room_number VARCHAR(10) UNIQUE NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('available', 'occupied', 'maintenance')),
  floor VARCHAR(10),
  room_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE students (
  student_id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  contact VARCHAR(15),
  password VARCHAR(100) NOT NULL,
  room_number VARCHAR(10) REFERENCES rooms(room_number) ON DELETE SET NULL,
  room_preference VARCHAR(20),
  check_in_date DATE,
  check_out_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fees table
CREATE TABLE fees (
  fee_id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(student_id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_date DATE,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'overdue')),
  payment_method VARCHAR(20),
  transaction_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create maintenance_requests table
CREATE TABLE maintenance_requests (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(student_id) ON DELETE SET NULL,
  room_number VARCHAR(10) REFERENCES rooms(room_number) ON DELETE CASCADE,
  issue_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create leave_requests table
CREATE TABLE leave_requests (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(student_id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  leave_type VARCHAR(20) DEFAULT 'Personal',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create notices table
CREATE TABLE notices (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admins(admin_id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance table
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(student_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by INTEGER REFERENCES admins(admin_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_students_room_number ON students(room_number);
CREATE INDEX idx_fees_student_id ON fees(student_id);
CREATE INDEX idx_maintenance_room_number ON maintenance_requests(room_number);
CREATE INDEX idx_leave_requests_student_id ON leave_requests(student_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_notices_created_at ON notices(created_at);
CREATE INDEX idx_attendance_student_id ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(date);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_students_modtime BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_rooms_modtime BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_fees_modtime BEFORE UPDATE ON fees FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_maintenance_modtime BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_leave_modtime BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_notices_modtime BEFORE UPDATE ON notices FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_admins_modtime BEFORE UPDATE ON admins FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Insert sample admin
INSERT INTO admins (username, password, email) 
VALUES ('admin', '$2b$10$X9f4bfPgR5vBj3yZunY5.O6kZRQZ8vqR.kuO.9gYBLu4Eq7WzRGOq', 'admin@hostel.com'); -- password: admin123

-- Insert sample rooms
INSERT INTO rooms (room_number, capacity, availability_status, floor, room_type) VALUES
('A101', 2, 'available', '1', 'standard'),
('A102', 2, 'available', '1', 'standard'),
('B201', 1, 'available', '2', 'premium'),
('B202', 3, 'available', '2', 'deluxe'); 