import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });
      
      // Save token to local storage
      localStorage.setItem('token', response.data.token);
      
      // Notify that login status has changed
      window.dispatchEvent(new Event('loginStatusChanged'));
      
      setMessage("Login successful!");
      
      // Redirect to profile page
      navigate('/profile');
    } catch (error) {
      console.error('Error logging in:', error);
      setMessage("Error logging in: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mx-auto mt-4" style={{ maxWidth: '500px' }}>
      <div className="card-header">
        <h2 className="card-title">Login</h2>
      </div>
      
      <div className="card-body">
        {message && (
          <div className={`alert ${message.includes("Error") ? "alert-danger" : "alert-success"}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              className="form-control"
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              className="form-control"
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
      
      <div className="card-footer text-center">
        <p className="mb-0">
          Don't have an account? <Link to="/register" className="text-accent">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;