import React from 'react';
import { GROUND_HEIGHT, GAME_WIDTH } from '../constants';

const Ground: React.FC = () => {
  return (
    <div
      className="absolute bottom-0 overflow-hidden"
      style={{
        width: `${GAME_WIDTH}px`,
        height: `${GROUND_HEIGHT}px`,
      }}
      aria-hidden="true"
    >
      <div 
        className="absolute bottom-0 w-full h-full bg-repeat-x opacity-30"
        style={{
          backgroundImage: 'linear-gradient(to right, #444 50%, #555 50%)',
          backgroundSize: '20px 100%',
        }}
      />
      <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-teal-500 to-transparent opacity-50" />
      <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent" />

    </div>
  );
};

export default Ground;
