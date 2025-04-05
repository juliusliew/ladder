import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const location = useLocation();

  useEffect(() => {
    // Check login status initially and when it changes
    const checkLoginStatus = () => {
      setLoggedIn(isLoggedIn());
    };

    // Set up event listener for login status changes
    window.addEventListener('loginStatusChanged', checkLoginStatus);
    window.addEventListener('storage', checkLoginStatus);
    
    return () => {
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  if (!loggedIn) {
    // Redirect to login page, but save the current location to
    // redirect back after successful login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
