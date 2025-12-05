import React from 'react';
import Navbar from '../components/Navbar';
import './ProfileScreen.css';

import { useGame } from '../context/GameContext';

const ProfileScreen = () => {
  const { userProfile, gameHistory } = useGame();
  
  const winRate = userProfile.stats.total > 0 
    ? Math.round((userProfile.stats.wins / userProfile.stats.total) * 100) 
    : 0;

  return (
    <div className="profile-screen">
      <div className="profile-header">
        <div className="profile-avatar">{userProfile.avatar === 'default' ? '🕷️' : userProfile.avatar}</div>
        <h2 className="nickname">{userProfile.nickname}</h2>
        <div className="level-badge">Lv.{userProfile.level}</div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{userProfile.stats.total}</div>
          <div className="stat-label">Games</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{winRate}%</div>
          <div className="stat-label">Win Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{userProfile.exp}</div>
          <div className="stat-label">EXP</div>
        </div>
      </div>

      <div className="history-section">
        <h3>Recent Matches</h3>
        <div className="history-list">
          {gameHistory.length > 0 ? (
            gameHistory.map((game) => (
              <div key={game.id} className={`history-item ${game.result}`}>
                <span className="match-info">vs {game.opponent}</span>
                <span className="match-result">{game.result.toUpperCase()}</span>
              </div>
            ))
          ) : (
            <div className="no-history">No matches yet. Go play!</div>
          )}
        </div>
      </div>

      <Navbar />
    </div>
  );
};

export default ProfileScreen;
