import React from 'react';
import Navbar from '../components/Navbar';
import { useGame } from '../context/GameContext';
import './RankingScreen.css';

const RankingScreen = () => {
  const { leaderboard } = useGame();

  return (
    <div className="ranking-screen">
      <div className="ranking-header">
        <h1>Leaderboard</h1>
        <p>Weekly Top Players</p>
      </div>

      <div className="ranking-list">
        {leaderboard.map((user) => (
          <div key={user.rank} className={`ranking-item rank-${user.rank}`}>
            <div className="rank-number">{user.rank}</div>
            <div className="rank-info">
              <span className="rank-nickname">{user.nickname}</span>
              <span className="rank-level">Lv.{user.level}</span>
            </div>
            <div className="rank-score">{user.score.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <Navbar />
    </div>
  );
};
export default RankingScreen;
