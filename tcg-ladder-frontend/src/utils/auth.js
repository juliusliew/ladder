/**
 * Authentication utility functions
 */

// Check if user is logged in
export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

// Get user data from token
export const getUserFromToken = () => {
  const token = localStorage.getItem('token');
  
  if (!token) return null;
  
  try {
    // Parse the token (JWT format: header.payload.signature)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

// Get auth header for API requests
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Check if token is expired
export const isTokenExpired = () => {
  const userData = getUserFromToken();
  if (!userData || !userData.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return userData.exp < currentTime;
};

// Logout user with optimized performance
export const logout = (navigate) => {
  // Use setTimeout to prevent UI freezing
  setTimeout(() => {
    try {
      // 1. Clean up socket connections
      if (window.socket && typeof window.socket.disconnect === 'function') {
        console.log('Disconnecting socket connection...');
        window.socket.disconnect();
      }
      
      // 2. Clear any active intervals or timers
      // If you have specific intervals to clear, do it here
      
      // 3. Cancel any pending API requests
      // If you're using axios cancel tokens, cancel them here
      
      // 4. Remove token and session data
      console.log('Removing auth token...');
      localStorage.removeItem('token');
      
      // 5. Clear any app-specific state from localStorage if needed
      // localStorage.removeItem('other-app-data');
      
      // 6. Notify components about logout
      console.log('Dispatching logout event...');
      window.dispatchEvent(new Event('loginStatusChanged'));
      
      // 7. Navigate last (after cleanup is done)
      if (navigate) {
        console.log('Navigating to login page...');
        navigate('/login');
      }
      
      console.log('Logout complete');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback logout - ensure user can still log out even if errors occur
      localStorage.removeItem('token');
      if (navigate) navigate('/login');
    }
  }, 0); // Moving to next event loop cycle
};