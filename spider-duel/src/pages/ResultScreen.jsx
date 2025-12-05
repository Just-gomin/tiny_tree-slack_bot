import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultScreen.css';

import { useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';

const ResultScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useGame();
  
  const { result, score, time } = location.state || { result: 'win', score: 0, time: 0 };
  const isVictory = result === 'win';

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`result-screen ${isVictory ? 'victory' : 'defeat'}`}>
      <div className="result-header">
        <div className="spider-logo">{isVictory ? '🏆' : '🕸️'}</div>
        <h1 className="result-title">{isVictory ? 'VICTORY' : 'DEFEAT'}</h1>
      </div>

      <div className="result-card">
        <div className="result-stat">
          <span className="label">TIME</span>
          <span className="value">{formatTime(time)}</span>
        </div>
        <div className="result-stat">
          <span className="label">SCORE</span>
          <span className="value">{score}</span>
        </div>
        <div className="level-up">
          <span className="level-text">Current Level</span>
          <span className="level-value">Lv.{userProfile.level}</span>
          <div style={{fontSize: '0.9rem', color: '#718096', marginTop: '5px'}}>
            EXP: {userProfile.exp}
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-primary play-again-btn" onClick={() => navigate('/game')}>
          PLAY AGAIN
        </button>
        <button className="btn-secondary menu-btn" onClick={() => navigate('/')}>
          MAIN MENU
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;
