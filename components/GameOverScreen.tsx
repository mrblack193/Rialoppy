import React from 'react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black bg-opacity-70 backdrop-blur-sm">
      <h2 className="text-6xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
        Faded Away
      </h2>
      <div className="mt-8 text-2xl bg-stone-900 bg-opacity-50 p-6 rounded-lg border border-stone-700">
        <p className="text-stone-300">Score: <span className="font-bold text-white">{score}</span></p>
        <p className="mt-2 text-stone-300">High Score: <span className="font-bold text-white">{highScore}</span></p>
      </div>
      <button
        onClick={onRestart}
        className="mt-12 px-8 py-4 bg-cyan-500 text-stone-900 font-bold rounded-lg text-2xl shadow-lg shadow-cyan-500/50 hover:bg-cyan-400 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300"
        aria-label="Restart Game"
      >
        Try Again
      </button>
    </div>
  );
};

export default GameOverScreen;
