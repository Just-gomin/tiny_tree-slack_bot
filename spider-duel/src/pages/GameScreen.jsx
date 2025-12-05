import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GameScreen.css';

import { initializeGame, canMoveCard, isStackMovable } from '../utils/gameLogic';
import { useGame } from '../context/GameContext';

const GameScreen = () => {
  const navigate = useNavigate();
  const { updateStats } = useGame();
  
  // Game State
  const [gameState, setGameState] = useState('matching'); // matching, playing, finished
  const [timer, setTimer] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [columns, setColumns] = useState([]);
  const [stock, setStock] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null); // { colIndex, cardIndex }
  const [score, setScore] = useState(0);
  const [gameResult, setGameResult] = useState(null); // 'win', 'loss'

  // Matching Phase
  useEffect(() => {
    if (gameState === 'matching') {
      const timeout = setTimeout(() => {
        const { columns: initialColumns, stock: initialStock } = initializeGame();
        setColumns(initialColumns);
        setStock(initialStock);
        setGameState('playing');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [gameState]);

  // Timer & Opponent Mock
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
      
      // Mock Opponent Progress (Randomly increases)
      if (Math.random() > 0.8) {
        setOpponentProgress((prev) => {
          if (prev >= 10) {
            handleGameOver('loss');
            return 10;
          }
          return prev + 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const handleGameOver = (result) => {
    setGameState('finished');
    setGameResult(result);
    updateStats(result);
    // Navigate to result after short delay
    setTimeout(() => {
      navigate('/result', { state: { result, score, time: timer } });
    }, 1500);
  };

  const handleCardClick = (colIndex, cardIndex) => {
    if (gameState !== 'playing') return;

    const column = columns[colIndex];
    const card = column[cardIndex];

    // If clicking empty column (target)
    if (!card) {
      if (selectedCard) {
        moveCard(selectedCard, colIndex);
      }
      return;
    }

    // If card is hidden, can't select
    if (card.hidden) return;

    // If already selected, deselect
    if (selectedCard && selectedCard.colIndex === colIndex && selectedCard.cardIndex === cardIndex) {
      setSelectedCard(null);
      return;
    }

    // If another card selected, try to move
    if (selectedCard) {
      moveCard(selectedCard, colIndex);
    } else {
      // Select logic: check if it's a valid stack top
      // For MVP simplicity: only allow selecting the top-most movable stack
      // Actually, user can select a card in the middle of a stack if the stack below it is valid.
      // Let's simplify: User clicks the deepest card they want to move.
      // We check if the stack from that card to the top is movable.
      const stack = column.slice(cardIndex);
      if (isStackMovable(stack)) {
        setSelectedCard({ colIndex, cardIndex });
      }
    }
  };

  const moveCard = (source, targetColIndex) => {
    const sourceCol = columns[source.colIndex];
    const targetCol = columns[targetColIndex];
    
    const stackToMove = sourceCol.slice(source.cardIndex);
    const sourceCard = stackToMove[0];
    const targetCard = targetCol.length > 0 ? targetCol[targetCol.length - 1] : null;

    if (canMoveCard(sourceCard, targetCard)) {
      // Execute Move
      const newColumns = [...columns];
      
      // Remove from source
      newColumns[source.colIndex] = sourceCol.slice(0, source.cardIndex);
      // Reveal new top card of source if hidden
      if (newColumns[source.colIndex].length > 0) {
        const newTop = newColumns[source.colIndex][newColumns[source.colIndex].length - 1];
        if (newTop.hidden) newTop.hidden = false;
      }

      // Add to target
      newColumns[targetColIndex] = [...targetCol, ...stackToMove];
      
      setColumns(newColumns);
      setSelectedCard(null);
      setScore(s => s + 10); // Simple scoring

      // Check for completed sets (K to A same suit)
      // TODO: Implement set clearing logic
    } else {
      // Invalid move, just change selection or deselect
      // If clicking on a valid card in target column, maybe switch selection?
      // For now, just deselect
      setSelectedCard(null);
    }
  };

  const handleStockClick = () => {
    if (stock.length === 0) return;
    
    // Deal 1 card to each column
    // Rule: Can't deal if any column is empty (Standard Spider). 
    // MVP: Allow it or show warning. Let's allow it for simplicity.
    
    const newStock = [...stock];
    const newColumns = [...columns];
    
    // Take 10 cards (or less if stock < 10)
    for (let i = 0; i < 10 && newStock.length > 0; i++) {
      const card = newStock.pop();
      card.hidden = false;
      newColumns[i].push(card);
    }
    
    setStock(newStock);
    setColumns(newColumns);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'matching') {
    return (
      <div className="game-screen matching">
        <div className="spinner">🕷️</div>
        <h2>Finding Opponent...</h2>
        <p>Searching for a worthy rival</p>
        <button className="cancel-btn" onClick={() => navigate('/')}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="game-screen">
      {/* Opponent Progress Bar */}
      <div className="opponent-bar-container">
        <div className="opponent-info">Opponent</div>
        <div className="progress-track">
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className={`progress-segment ${i < opponentProgress ? 'filled' : ''}`}
            />
          ))}
        </div>
      </div>

      {/* Game Header */}
      <header className="game-header">
        <button className="exit-btn" onClick={() => {
          if (window.confirm('Give up? You will lose points.')) {
            handleGameOver('loss');
          }
        }}>✕</button>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">SCORE</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">TIME</span>
            <span className="stat-value">{formatTime(timer)}</span>
          </div>
        </div>
        <div className="deck-count">
          <span className="card-icon">🎴</span> {stock.length}
        </div>
      </header>

      {/* Game Board */}
      <div className="game-board">
        {columns.map((col, colIndex) => (
          <div 
            key={colIndex} 
            className="card-column"
            onClick={() => handleCardClick(colIndex, col.length)} // Click empty column
          >
            {col.map((card, cardIndex) => (
              <div 
                key={card.id} 
                className={`card ${card.hidden ? 'hidden' : ''} ${selectedCard?.colIndex === colIndex && selectedCard?.cardIndex === cardIndex ? 'selected' : ''}`}
                style={{ top: `${cardIndex * 25}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(colIndex, cardIndex);
                }}
              >
                {!card.hidden && (
                  <div className={`card-content ${['♥', '♦'].includes(card.suit) ? 'red' : 'black'}`}>
                    {card.rank}{card.suit}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="game-controls">
        <div className="deck-pile" onClick={handleStockClick}>
          {stock.length > 0 ? (
            <>
              <div className="card hidden deck-card"></div>
              <div className="card hidden deck-card" style={{ transform: 'translate(2px, -2px)' }}></div>
              <div className="card hidden deck-card" style={{ transform: 'translate(4px, -4px)' }}></div>
            </>
          ) : (
             <div className="empty-slot">❌</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
