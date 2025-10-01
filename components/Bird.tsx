import React from 'react';
import { BIRD_LEFT_POSITION, getBirdSize, getGlowColor } from '../constants';

interface BirdProps {
  y: number;
  score: number;
}

// To change the bird image, simply replace the URL in the line below.
const BIRD_IMAGE_URL = 'https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/53c17af8-bd3b-4b68-31d2-9745cd8b9700/rectcontain3';

const Bird: React.FC<BirdProps> = ({ y, score }) => {
  const { width, height } = getBirdSize(score);
  const glowColor = getGlowColor(score);
  
  return (
    <div
      aria-label="Ethereal entity"
      role="img"
      className="absolute"
      style={{
        top: `${y}px`,
        left: `${BIRD_LEFT_POSITION}px`,
        width: `${width}px`,
        height: `${height}px`,
        // The glow effect now changes color based on the score
        filter: `drop-shadow(0 0 10px ${glowColor})`,
      }}
    >
      <img
        src={BIRD_IMAGE_URL}
        alt="" // The accessible name is provided by the container div's aria-label
        className="w-full h-full"
        style={{
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default Bird;
