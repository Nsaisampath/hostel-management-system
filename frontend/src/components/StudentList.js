import React, { useEffect, useState } from 'react';
import { getStudents } from '../api';

function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudents();
        setStudents(data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div>
      <h1>Student List</h1>
      <ul>
        {students.map((student) => (
          <li key={student.student_id}>
            {student.name} - {student.contact}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentList;