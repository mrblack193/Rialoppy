import React from 'react';

interface ScoreProps {
  score: number;
}

const Score: React.FC<ScoreProps> = ({ score }) => {
  return (
    <div 
        className="absolute top-8 left-1/2 -translate-x-1/2 text-6xl font-bold text-white text-opacity-80 z-10" 
        style={{ textShadow: '0 0 10px rgba(0, 255, 255, 0.7), 2px 2px 4px rgba(0,0,0,0.5)' }}
        aria-live="polite"
    >
      {score}
    </div>
  );
};

export default Score;
