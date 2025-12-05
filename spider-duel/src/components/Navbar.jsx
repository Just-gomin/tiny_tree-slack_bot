import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar">
      <div 
        className={`nav-item ${isActive('/') ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Home</span>
      </div>
      <div 
        className={`nav-item ${isActive('/friend-battle') ? 'active' : ''}`}
        onClick={() => navigate('/friend-battle')}
      >
        <span className="nav-icon">⚔️</span>
        <span className="nav-label">Friend</span>
      </div>
      <div 
        className={`nav-item ${isActive('/ranking') ? 'active' : ''}`}
        onClick={() => navigate('/ranking')}
      >
        <span className="nav-icon">🏆</span>
        <span className="nav-label">Ranking</span>
      </div>
      <div 
        className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <span className="nav-icon">👤</span>
        <span className="nav-label">Profile</span>
      </div>
    </div>
  );
};

export default Navbar;
