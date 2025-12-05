import React from 'react';
import Navbar from '../components/Navbar';
import './MainScreen.css'; // Reuse main screen styles for simplicity

const FriendBattleScreen = () => {
  return (
    <div className="main-screen">
      <div className="logo-area" style={{marginTop: '50px'}}>
        <h1>Friend Battle</h1>
        <p>Enter Room Code</p>
      </div>
      
      <div style={{padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px'}}>
        <input 
          type="text" 
          placeholder="Enter 6-digit code" 
          style={{
            padding: '15px', 
            borderRadius: '10px', 
            border: 'none', 
            textAlign: 'center',
            fontSize: '1.2rem',
            letterSpacing: '5px'
          }}
        />
        <button className="btn-accent" style={{width: '100%'}}>JOIN ROOM</button>
        <button className="btn-secondary" style={{width: '100%', marginTop: '10px'}}>CREATE ROOM</button>
      </div>

      <Navbar />
    </div>
  );
};
export default FriendBattleScreen;
