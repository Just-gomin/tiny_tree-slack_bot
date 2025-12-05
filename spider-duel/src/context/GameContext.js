import React, { createContext, useState, useContext, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  // User Profile State
  const [userProfile, setUserProfile] = useState({
    nickname: 'Player1',
    level: 1,
    exp: 0,
    stats: {
      total: 0,
      wins: 0,
      losses: 0,
    },
    avatar: 'default',
  });

  // Game History State
  const [gameHistory, setGameHistory] = useState([]);

  // Leaderboard State (Mock Data)
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, nickname: 'SpiderKing', score: 5000, level: 50 },
    { rank: 2, nickname: 'CardMaster', score: 4800, level: 48 },
    { rank: 3, nickname: 'SolitairePro', score: 4500, level: 45 },
    { rank: 4, nickname: 'Duelist99', score: 4200, level: 42 },
    { rank: 5, nickname: 'WebSlinger', score: 4000, level: 40 },
  ]);

  // Active Game State
  const [activeGame, setActiveGame] = useState(null);

  // Helper to update stats after game
  const updateStats = (result) => {
    setUserProfile((prev) => {
      const newStats = { ...prev.stats };
      newStats.total += 1;
      if (result === 'win') {
        newStats.wins += 1;
        // Simple level up logic: 100 exp per level, win = 50 exp
        const newExp = prev.exp + 50;
        const newLevel = Math.floor(newExp / 100) + 1;
        return { ...prev, stats: newStats, exp: newExp, level: newLevel };
      } else {
        newStats.losses += 1;
        // Loss = 10 exp
        const newExp = prev.exp + 10;
        const newLevel = Math.floor(newExp / 100) + 1;
        return { ...prev, stats: newStats, exp: newExp, level: newLevel };
      }
    });

    // Add to history
    const newHistoryItem = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      result: result, // 'win' or 'loss'
      opponent: 'Random Opponent', // Mock opponent
      duration: '3:00', // Mock duration
    };
    setGameHistory((prev) => [newHistoryItem, ...prev]);
  };

  const value = {
    userProfile,
    setUserProfile,
    gameHistory,
    leaderboard,
    activeGame,
    setActiveGame,
    updateStats,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
