import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Bird as BirdType, Pipe as PipeType } from '../types';
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  INITIAL_BIRD_HEIGHT,
  BIRD_LEFT_POSITION,
  GROUND_HEIGHT,
  GRAVITY,
  JUMP_STRENGTH,
  PIPE_WIDTH,
  PIPE_GAP,
  PIPE_SPEED,
  PIPE_INTERVAL,
  getBirdSize,
} from '../constants';
import Bird from './Bird';
import Pipe from './Pipe';
import Ground from './Ground';
import Score from './Score';

// Preload audio files for sound effects
const flapSound = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_17315a6b09.mp3');
const scoreSound = new Audio('https://cdn.pixabay.com/audio/2022/11/22/audio_2c8a3294b2.mp3');
const gameOverSound = new Audio('https://cdn.pixabay.com/audio/2022/02/07/audio_80921a9e70.mp3');

// Set volumes for a better audio experience
flapSound.volume = 0.5;
scoreSound.volume = 0.4;
gameOverSound.volume = 0.6;

const playSound = (sound: HTMLAudioElement) => {
  // Reset playback to the beginning to allow for rapid re-triggering (e.g., quick flaps)
  sound.currentTime = 0;
  // play() returns a promise which can be rejected if autoplay is blocked.
  sound.play().catch(error => console.error(`Audio play failed: ${error.message}`));
};

interface GameProps {
  onGameOver: (score: number) => void;
}

const Game: React.FC<GameProps> = ({ onGameOver }) => {
  // We use state to trigger re-renders, while refs hold the mutable game state
  const [birdState, setBirdState] = useState<BirdType>({
    y: GAME_HEIGHT / 2 - INITIAL_BIRD_HEIGHT / 2,
    velocity: 0,
  });
  const [pipesState, setPipesState] = useState<PipeType[]>([]);
  const [scoreState, setScoreState] = useState(0);

  // Refs for game logic to avoid re-creating functions on each render
  const bird = useRef(birdState);
  const pipes = useRef(pipesState);
  const score = useRef(scoreState);
  const gameLoopId = useRef<number | null>(null);
  const pipeTimerId = useRef<number | null>(null);
  const isGameOver = useRef(false);

  // Sync refs with state
  useEffect(() => { bird.current = birdState; }, [birdState]);
  useEffect(() => { pipes.current = pipesState; }, [pipesState]);
  useEffect(() => { score.current = scoreState; }, [scoreState]);

  const stopGame = useCallback(() => {
    if (isGameOver.current) return;
    playSound(gameOverSound);
    isGameOver.current = true;
    if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
    if (pipeTimerId.current) clearInterval(pipeTimerId.current);
    onGameOver(score.current);
  }, [onGameOver]);

  const handleFlap = useCallback(() => {
    if (isGameOver.current) return;
    playSound(flapSound);
    setBirdState(prev => ({ ...prev, velocity: JUMP_STRENGTH }));
  }, []);

  const gameLoop = useCallback(() => {
    const { height: currentBirdHeight, width: currentBirdWidth } = getBirdSize(score.current);
    
    // Bird physics
    const currentBird = bird.current;
    const newVelocity = currentBird.velocity + GRAVITY;
    const newY = currentBird.y + newVelocity;

    if (newY + currentBirdHeight > GAME_HEIGHT - GROUND_HEIGHT || newY < 0) {
      stopGame();
      return;
    }
    setBirdState({ y: newY, velocity: newVelocity });

    // Pipe logic
    let scoreNeedsUpdate = false;
    const newPipes = pipes.current
      .map((pipe) => {
        const newX = pipe.x - PIPE_SPEED;
        if (!pipe.passed && newX + PIPE_WIDTH < BIRD_LEFT_POSITION) {
          pipe.passed = true;
          score.current += 1;
          playSound(scoreSound);
          scoreNeedsUpdate = true;
        }
        return { ...pipe, x: newX };
      })
      .filter((pipe) => pipe.x > -PIPE_WIDTH);

    setPipesState(newPipes);
    if(scoreNeedsUpdate) {
        setScoreState(score.current);
    }

    // Collision detection
    const birdRect = { x: BIRD_LEFT_POSITION, y: newY, width: currentBirdWidth, height: currentBirdHeight };
    for (const pipe of newPipes) {
      const isXOverlap = birdRect.x < pipe.x + PIPE_WIDTH && birdRect.x + birdRect.width > pipe.x;
      const isYOverlap = birdRect.y < pipe.topHeight || birdRect.y + birdRect.height > pipe.topHeight + PIPE_GAP;

      if (isXOverlap && isYOverlap) {
        stopGame();
        return;
      }
    }

    gameLoopId.current = requestAnimationFrame(gameLoop);
  }, [stopGame]);

  useEffect(() => {
    // Start game
    gameLoopId.current = requestAnimationFrame(gameLoop);

    pipeTimerId.current = window.setInterval(() => {
      if (isGameOver.current) return;
      const topHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - GROUND_HEIGHT - 100) + 50;
      setPipesState(prevPipes => [
        ...prevPipes,
        { x: GAME_WIDTH, topHeight, passed: false },
      ]);
    }, PIPE_INTERVAL);
    
    // Add event listeners for flapping
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleFlap();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleFlap);
    document.addEventListener('touchstart', handleFlap);

    return () => { // Cleanup
      if (gameLoopId.current) cancelAnimationFrame(gameLoopId.current);
      if (pipeTimerId.current) clearInterval(pipeTimerId.current);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleFlap);
      document.removeEventListener('touchstart', handleFlap);
    };
  }, [gameLoop, handleFlap]);

  return (
    <>
      <Score score={scoreState} />
      <Bird y={birdState.y} score={scoreState} />
      {pipesState.map((pipe, index) => (
        <Pipe key={index} pipe={pipe} />
      ))}
      <Ground />
    </>
  );
};

export default Game;