# Hostel Management System

A modern, secure, and scalable hostel management system API built with Node.js, Express, and PostgreSQL.

## Features

- **Student Management**: Register, update, and manage student information
- **Room Management**: Track room availability, assignments, and maintenance
- **Fee Management**: Record and track fee payments
- **Leave Management**: Process student leave requests
- **Maintenance Requests**: Handle room maintenance requests
- **Notice Board**: Publish announcements for students
- **Authentication & Authorization**: Secure JWT-based authentication
- **Role-Based Access Control**: Different permissions for students and admins

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt
- **Validation**: Joi
- **Logging**: Winston, Morgan
- **Security**: Helmet, Rate Limiting, CORS
- **Email**: Nodemailer

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hostel-management-system.git
   cd hostel-management-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` (if not already created)
   - Update the database credentials and other settings in `.env`

4. Run the setup script to initialize the database:
   ```bash
   npm run setup
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/students/register` - Register a new student
- `POST /api/students/login` - Student login
- `POST /api/admin/login` - Admin login

### Students
- `GET /api/students` - Get all students (Admin only)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Add a new student (Admin only)
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student (Admin only)

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Add a new room (Admin only)
- `PUT /api/rooms/:id` - Update a room (Admin only)
- `DELETE /api/rooms/:id` - Delete a room (Admin only)
- `GET /api/rooms/available` - Get all available rooms
- `GET /api/rooms/:id/students` - Get all students in a room (Admin only)

### Notices
- `GET /api/notices` - Get all notices
- `GET /api/notices/:id` - Get notice by ID
- `POST /api/notices` - Add a new notice (Admin only)
- `PUT /api/notices/:id` - Update a notice (Admin only)
- `DELETE /api/notices/:id` - Delete a notice (Admin only)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics (Admin only)
- `POST /api/admin/change-password` - Change admin password (Admin only)

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Rate limiting to prevent brute force attacks
- Helmet for setting security-related HTTP headers
- Input validation with Joi
- CORS protection
- Error handling middleware
- Logging for security events

## License

This project is licensed under the MIT License - see the LICENSE file for details. 