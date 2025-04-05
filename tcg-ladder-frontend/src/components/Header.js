// Header.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUserFromToken } from '../utils/auth';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check login status and get username
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      
      if (token) {
        const userData = getUserFromToken();
        if (userData && userData.username) {
          setUsername(userData.username);
        }
      }
    };

    // Check initial status
    checkLoginStatus();

    // Set up event listeners for storage changes and login status changes
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('loginStatusChanged', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu and dropdown when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  // Direct logout without using auth.js to isolate the issue
  const handleLogout = () => {
    // Quick cleanup of any socket
    if (window.socket) {
      try {
        window.socket.disconnect();
      } catch (e) {
        console.error('Socket disconnect error:', e);
      }
    }
    
    // Clear token immediately
    localStorage.removeItem('token');
    
    // Update local state
    setIsLoggedIn(false);
    setDropdownOpen(false);
    
    // Force a full page reload instead of navigation
    window.location.href = '/login';
  };

  // Check if the given path is the current route
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container container">
        <Link to="/" className="logo">
          TCG Ladder
        </Link>

        <button 
          className="menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {mobileMenuOpen ? (
              <path 
                d="M6 18L18 6M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            ) : (
              <path 
                d="M4 6H20M4 12H20M4 18H20" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            )}
          </svg>
        </button>

        <nav className={`nav ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            {!isLoggedIn && (
              <>
                <li>
                  <Link 
                    to="/register" 
                    className={`nav-link ${isActive('/register') ? 'active' : ''}`}
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/login" 
                    className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                  >
                    Login
                  </Link>
                </li>
              </>
            )}
            
            {isLoggedIn && (
              <li>
                <Link 
                  to="/matchmaking" 
                  className={`nav-link ${isActive('/matchmaking') ? 'active' : ''}`}
                >
                  Matchmaking
                </Link>
              </li>
            )}
            
            <li>
              <Link 
                to="/leaderboard" 
                className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}
              >
                Leaderboard
              </Link>
            </li>
          </ul>
        </nav>
        
        {isLoggedIn && (
          <div className="user-menu" ref={dropdownRef}>
            <button 
              className="user-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span>{username}</span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ 
                  transition: 'transform 0.2s ease',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'none'
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            
            {dropdownOpen && (
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item">
                  My Profile
                </Link>
                <button onClick={handleLogout} className="dropdown-item">
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
