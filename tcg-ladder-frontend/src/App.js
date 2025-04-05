import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MatchmakingProvider } from './context/MatchmakingContext';
import Header from './components/Header';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import Matchmaking from './components/Matchmaking';
import Leaderboard from './components/Leaderboard';
import PlayerProfile from './components/PlayerProfile';
import ProtectedRoute from './components/ProtectedRoute';
import { isLoggedIn } from './utils/auth';

// Import main stylesheet instead of index.css
import './styles/main.css';

function App() {
  return (
    <MatchmakingProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="content">
            <div className="container">
              <Routes>
                {/* Public routes */}
                <Route path="/register" element={
                  isLoggedIn() ? <Navigate to="/profile" replace /> : <Register />
                } />
                <Route path="/login" element={
                  isLoggedIn() ? <Navigate to="/profile" replace /> : <Login />
                } />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/player/:playerId" element={<PlayerProfile />} />
                
                {/* Protected routes (require authentication) */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/matchmaking" element={
                  <ProtectedRoute>
                    <Matchmaking />
                  </ProtectedRoute>
                } />
                
                {/* Default route */}
                <Route path="/" element={<Navigate to="/leaderboard" replace />} />
                <Route path="*" element={<Navigate to="/leaderboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </MatchmakingProvider>
  );
}

export default App;