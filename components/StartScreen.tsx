import React from 'react';
import { getGlowColor } from '../constants';

interface StartScreenProps {
  onStart: () => void;
  highScore: number;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, highScore }) => {
  const glowColor = getGlowColor(highScore);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-black bg-opacity-30 backdrop-blur-sm">
      <img
        src="https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/53c17af8-bd3b-4b68-31d2-9745cd8b9700/rectcontain3"
        alt="RIALO Logo"
        className="h-32 w-32 mb-4"
        style={{
          // Thêm một lớp drop-shadow thứ hai, rộng hơn để có hiệu ứng phát sáng nổi bật hơn
          // Màu sắc bây giờ thay đổi dựa trên điểm số cao nhất
          filter: `drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 25px ${glowColor})`,
        }}
      />
      <h1
        className="text-8xl font-bold text-white"
        style={{
          textShadow:
            '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #0ff, 0 0 30px #0ff, 0 0 40px #0ff, 0 0 55px #0ff, 0 0 75px #0ff',
        }}
      >
        RIALO
      </h1>
      <p className="mt-4 text-stone-300 italic">A strange, ethereal whisper seems to brush against your consciousness...</p>
      <button
        onClick={onStart}
        className="mt-12 px-8 py-4 bg-cyan-500 text-stone-900 font-bold rounded-lg text-2xl shadow-lg shadow-cyan-500/50 hover:bg-cyan-400 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300"
        aria-label="Start Game"
      >
        Begin
      </button>
      <p className="mt-8 text-stone-400 text-lg">Click or Press Space to Flap</p>
    </div>
  );
};

export default StartScreen;
