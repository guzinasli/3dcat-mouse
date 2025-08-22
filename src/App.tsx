import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Game3D } from './game/Game3D';
import { GameUI } from './components/GameUI';
import { GameState } from './types/game';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game3D | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isGameOver: false,
    score: 0,
    lives: 3,
    level: 1,
    mice: []
  });
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      gameRef.current = new Game3D(canvasRef.current);
      
      // Start render loop for initial scene
      const renderLoop = () => {
        if (gameRef.current) {
          gameRef.current.render();
          setGameState(gameRef.current.getGameState());
        }
        requestAnimationFrame(renderLoop);
      };
      renderLoop();
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.dispose();
      }
    };
  }, []);

  const handleStart = useCallback(() => {
    if (gameRef.current) {
      setGameStarted(true);
      gameRef.current.startGame();
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.restartGame();
    }
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: gameStarted && !gameState.isGameOver ? 'none' : 'default' }}
      />
      
      <GameUI
        score={gameState.score}
        lives={gameState.lives}
        level={gameState.level}
        isGameOver={gameState.isGameOver}
        onRestart={handleRestart}
        onStart={handleStart}
        gameStarted={gameStarted}
      />
    </div>
  );
}

export default App;