import React from 'react';
import { PIPE_WIDTH, PIPE_GAP, GAME_HEIGHT, GROUND_HEIGHT } from '../constants';
import type { Pipe as PipeType } from '../types';

interface PipeProps {
  pipe: PipeType;
}

const Pipe: React.FC<PipeProps> = ({ pipe }) => {
  const { x, topHeight } = pipe;
  const bottomPipeY = topHeight + PIPE_GAP;
  const bottomHeight = GAME_HEIGHT - bottomPipeY - GROUND_HEIGHT;

  return (
    <div className="absolute top-0" style={{ left: `${x}px` }}>
      {/* Top Pipe */}
      <div
        className="absolute top-0 bg-gradient-to-b from-slate-500 to-slate-700 border-x-4 border-b-4 border-slate-800 rounded-b-md"
        style={{
          width: `${PIPE_WIDTH}px`,
          height: `${topHeight}px`,
        }}
        aria-hidden="true"
      />
      {/* Bottom Pipe */}
      <div
        className="absolute bg-gradient-to-t from-slate-500 to-slate-700 border-x-4 border-t-4 border-slate-800 rounded-t-md"
        style={{
          top: `${bottomPipeY}px`,
          width: `${PIPE_WIDTH}px`,
          height: `${bottomHeight}px`,
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default Pipe;
