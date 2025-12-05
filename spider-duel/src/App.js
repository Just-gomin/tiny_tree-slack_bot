import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainScreen from './pages/MainScreen';
import GameScreen from './pages/GameScreen';
import ProfileScreen from './pages/ProfileScreen';
import ResultScreen from './pages/ResultScreen';
import RankingScreen from './pages/RankingScreen';
import FriendBattleScreen from './pages/FriendBattleScreen';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/result" element={<ResultScreen />} />
          <Route path="/ranking" element={<RankingScreen />} />
          <Route path="/friend-battle" element={<FriendBattleScreen />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
