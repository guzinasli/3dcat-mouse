import React from 'react';
import { Heart, Trophy, RotateCcw } from 'lucide-react';

interface GameUIProps {
  score: number;
  lives: number;
  level: number;
  isGameOver: boolean;
  onRestart: () => void;
  onStart: () => void;
  gameStarted: boolean;
}

export const GameUI: React.FC<GameUIProps> = ({
  score,
  lives,
  level,
  isGameOver,
  onRestart,
  onStart,
  gameStarted,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* HUD */}
      {gameStarted && !isGameOver && (
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg text-gray-800">{score}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">Level {level}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-center gap-1">
              {Array.from({ length: lives }).map((_, i) => (
                <Heart key={i} className="w-5 h-5 text-red-500 fill-current" />
              ))}
              {Array.from({ length: Math.max(0, 3 - lives) }).map((_, i) => (
                <Heart key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Start Screen */}
      {!gameStarted && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 flex items-center justify-center pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl max-w-md mx-4">
            <div className="mb-6">
              <div className="text-6xl mb-2">🐱</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
                Cat & Mouse
              </h1>
              <p className="text-gray-600">Catch the mice before they escape!</p>
            </div>
            
            <div className="space-y-4 text-left mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">🖱️</span>
                </div>
                <span className="text-gray-700">Use WASD or Arrow keys to move</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">🐭</span>
                </div>
                <span className="text-gray-700">Catch mice to earn points</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </div>
                <span className="text-gray-700">Don't let mice escape!</span>
              </div>
            </div>

            <button
              onClick={onStart}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Game
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-md mx-4">
            <div className="mb-6">
              <div className="text-6xl mb-2">😿</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Game Over!</h2>
              <p className="text-gray-600">The mice got away...</p>
            </div>
            
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-800">{score}</span>
              </div>
              <p className="text-gray-600">Final Score</p>
              <p className="text-sm text-gray-500 mt-1">Level {level} reached</p>
            </div>

            <button
              onClick={onRestart}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {gameStarted && !isGameOver && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
            Use WASD or Arrow keys to move
          </div>
        </div>
      )}
    </div>
  );
};