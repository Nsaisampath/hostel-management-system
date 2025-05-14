// UserContext.js
import React, { createContext, useState, useEffect } from 'react';

// Create the context
export const UserContext = createContext();

// Create the provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on component mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    // Safe check for both values
    if (storedUser && storedToken && 
        storedUser !== 'undefined' && 
        storedToken !== 'undefined' && 
        storedUser !== 'null' && 
        storedToken !== 'null') {
      try {
        // Attempt to parse the user data
        const parsedUser = JSON.parse(storedUser);
        
        // Ensure the parsed object is valid and has expected properties
        if (parsedUser && typeof parsedUser === 'object') {
          console.log("Restoring user session from localStorage");
          
          setUser({
            ...parsedUser,
            token: storedToken
          });
        } else {
          throw new Error('Invalid user data format');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      // Clear any potentially corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      console.log("No valid user session found");
    }
    
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    if (!userData || !token) {
      console.error("Attempted to login with invalid data", { userData, token });
      return;
    }
    
    console.log("Setting user data:", { ...userData, token: token ? "TOKEN_EXISTS" : "NO_TOKEN" });
    
    // Create a clean user object with only needed properties
    const cleanUser = {
      id: userData.id || userData.student_id || userData.admin_id,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'student',
      token: token
    };
    
    setUser(cleanUser);
    
    try {
      localStorage.setItem('user', JSON.stringify(cleanUser));
      localStorage.setItem('token', token);
    } catch (error) {
      console.error("Failed to save user data to localStorage:", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log("User logged out");
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};