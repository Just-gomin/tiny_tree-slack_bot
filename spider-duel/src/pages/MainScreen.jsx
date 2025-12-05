import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useGame } from '../context/GameContext';
import './MainScreen.css';

const MainScreen = () => {
  const navigate = useNavigate();
  const { userProfile } = useGame();

  return (
    <div className="main-screen">
      <header className="main-header">
        <div className="profile-icon" onClick={() => navigate('/profile')}>
          <div className="avatar-circle">{userProfile.avatar === 'default' ? '🕷️' : userProfile.avatar}</div>
          <div className="profile-summary">
            <span className="nickname">{userProfile.nickname}</span>
            <span className="level-badge">Lv.{userProfile.level}</span>
          </div>
        </div>
        <div className="settings-icon">⚙️</div>
      </header>

      <main className="main-content">
        <div className="logo-area">
          <h1>SpiderDuel</h1>
          <p>Real-time Card Battle</p>
        </div>

        <button className="btn-accent start-btn" onClick={() => navigate('/game')}>
          START BATTLE
        </button>
      </main>

      <Navbar />
    </div>
  );
};

export default MainScreen;
