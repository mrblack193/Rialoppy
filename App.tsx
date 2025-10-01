


import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';

// --- Constants ---
const GAME_WIDTH = 500;
const GAME_HEIGHT = 800;
const BIRD_LEFT_POSITION = 100;
const GROUND_HEIGHT = 100;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -9;
const PIPE_WIDTH = 130; // Match visual width of the logo
const PIPE_SPEED = 3;
const LOGO_URL = 'https://res.cloudinary.com/dpmrtdiuh/image/upload/v1759285435/Generated_Image_September_28_2025_-_12_36PM_gv5bql.png';
const LOGO_VISUAL_HEIGHT = 130;

// --- Difficulty Scaling Constants ---
const INITIAL_BIRD_WIDTH = 35;
const INITIAL_BIRD_HEIGHT = 35;
const BIRD_SIZE_INCREMENT = 3; // How much the bird grows every 5 points

const INITIAL_PIPE_GAP = 240;
const PIPE_GAP_DECREMENT = 8; // How much the gap shrinks every 5 points
const MIN_PIPE_GAP = 160; // The smallest the gap can be

const INITIAL_PIPE_INTERVAL = 1500; // ms
const PIPE_INTERVAL_DECREMENT = 50; // ms, how much faster pipes spawn every 5 points
const MIN_PIPE_INTERVAL = 1000; // ms, the fastest pipes can spawn

// --- Types ---
type GameState = 'enterName' | 'ready' | 'playing' | 'gameOver';
interface Bird {
  y: number;
  velocity: number;
}
interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}
interface ScoreEntry {
    name: string;
    score: number;
}

// --- Dynamic Gameplay Functions ---
const getBirdSize = (score: number) => {
  const increments = Math.floor(score / 5);
  const width = INITIAL_BIRD_WIDTH + increments * BIRD_SIZE_INCREMENT;
  const height = INITIAL_BIRD_HEIGHT + increments * BIRD_SIZE_INCREMENT;
  return { width, height };
};

const getPipeGap = (score: number) => {
  const decrements = Math.floor(score / 5);
  const newGap = INITIAL_PIPE_GAP - decrements * PIPE_GAP_DECREMENT;
  return Math.max(newGap, MIN_PIPE_GAP);
};

const getPipeInterval = (score: number) => {
    const decrements = Math.floor(score / 5);
    const newInterval = INITIAL_PIPE_INTERVAL - decrements * PIPE_INTERVAL_DECREMENT;
    return Math.max(newInterval, MIN_PIPE_INTERVAL);
};

const getGlowColor = (score: number): string => {
  if (score >= 25) return 'rgba(148, 0, 211, 0.7)'; // Tím Đậm (Dark Violet)
  if (score >= 20) return 'rgba(255, 69, 0, 0.7)'; // Đỏ Cam (Orange Red)
  if (score >= 15) return 'rgba(255, 0, 255, 0.7)'; // Hồng Sẫm (Fuchsia)
  if (score >= 10) return 'rgba(255, 165, 0, 0.7)'; // Cam (Orange)
  if (score >= 5) return 'rgba(173, 255, 47, 0.7)'; // Vàng Chanh (Green-Yellow)
  return 'rgba(0, 255, 255, 0.7)'; // Xanh Cyan (Cyan) (Mặc định)
};

const getColorizeFilter = (score: number): string => {
  let hueRotate = 0;
  // The base hue for a sepia filter is approx 40deg. We rotate from there to reach the target color's hue.
  if (score >= 25) hueRotate = 230; // 270(violet) - 40
  else if (score >= 20) hueRotate = -24; // 16(orangered) - 40
  else if (score >= 15) hueRotate = 260; // 300(fuchsia) - 40
  else if (score >= 10) hueRotate = -10; // 30(orange) - 40
  else if (score >= 5) hueRotate = 40; // 80(greenyellow) - 40
  else hueRotate = 140; // 180(cyan) - 40

  return `invert(1) sepia(1) hue-rotate(${hueRotate}deg) saturate(800%) brightness(1.1)`;
};

// --- Components ---

const Leaderboard: React.FC<{ score: number; highScores: ScoreEntry[]; glowColor: string }> = ({ score, highScores, glowColor }) => {
  return (
    <div className="leaderboard">
      <h2 style={{ color: glowColor, textShadow: `0 0 10px ${glowColor}` }}>Leaderboard</h2>
      <ol>
        {highScores.map((entry, index) => (
          <li key={index}>
            <span>{index + 1}. {entry.name}</span>
            <span>{entry.score}</span>
          </li>
        ))}
      </ol>
      <div className="leaderboard-current-score">
        <h3>Your Score</h3>
        <p>{score}</p>
      </div>
    </div>
  );
};

const EnterNameScreen: React.FC<{ onNameSubmit: (name: string) => void }> = ({ onNameSubmit }) => {
    const [name, setName] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onNameSubmit(name.trim());
        }
    };

    const glowColor = getGlowColor(0); // Static color for this screen
    const colorizeFilter = getColorizeFilter(0);
    const glowFilter = `drop-shadow(0 0 12px ${glowColor})`;

    const logoImageStyle: React.CSSProperties = {
        filter: `${colorizeFilter} ${glowFilter}`,
        mixBlendMode: 'screen',
        isolation: 'isolate',
    };
    
    const logoTextStyle = {
        '--glow-color': glowColor,
    } as React.CSSProperties;

    const dynamicStyle = { '--glow-color': glowColor } as React.CSSProperties;

    return (
        <div className="name-input-screen" style={dynamicStyle}>
            <div className="footer-logo-container name-screen-logo">
              <img src={LOGO_URL} alt="Rialoppy Logo" className="footer-logo-image" style={logoImageStyle} />
              <h1 className="ground-logo-text" style={logoTextStyle}>IALOPPY</h1>
            </div>
            <h2>Enter Your Name</h2>
            <form onSubmit={handleSubmit} className="name-input-form">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="name-input-field"
                    placeholder="NAME"
                    maxLength={12}
                    autoFocus
                />
                <button type="submit" className="name-input-button">
                    ENTER
                </button>
            </form>
        </div>
    );
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [highScores, setHighScores] = useState<ScoreEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const [birdState, setBirdState] = useState<Bird>({
    y: GAME_HEIGHT / 2 - INITIAL_BIRD_HEIGHT / 2,
    velocity: 0,
  });
  const [pipesState, setPipesState] = useState<Pipe[]>([]);
  const [scoreState, setScoreState] = useState(0);

  const birdRef = useRef(birdState);
  const pipesRef = useRef(pipesState);
  const scoreRef = useRef(scoreState);
  const gameStateRef = useRef(gameState);
  const noteIndexRef = useRef(0);
  const isMutedRef = useRef(isMuted);
  const pipeTimeoutIdRef = useRef<number | null>(null);
  
  // --- Audio Refactoring ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const despacitoNotesRef = useRef<HTMLAudioElement[]>([]);
  const scoreSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);
  const startSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on component mount for robust playback
  useEffect(() => {
    const notes = [
      // Arpeggiated Bm-G-D-A chord progression
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085465/329949__mellau__piano-b3_fbb1gp.wav'), // Bm: B3
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085465/329961__mellau__piano-d4_nhc91z.wav'), // Bm: D4
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085466/329966__mellau__piano-f-4_s8dhc7.wav'), // Bm: F#4
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085465/329956__mellau__piano-g3_n6n7a4.wav'), // G: G3
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085465/329949__mellau__piano-b3_fbb1gp.wav'), // G: B3
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085465/329961__mellau__piano-d4_nhc91z.wav'), // G: D4
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085465/329961__mellau__piano-d4_nhc91z.wav'), // D: D4
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085466/329966__mellau__piano-f-4_s8dhc7.wav'), // D: F#4
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085465/329951__mellau__piano-a3_d6grcp.wav'), // D: A3
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085465/329951__mellau__piano-a3_d6grcp.wav'), // A: A3
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085466/329959__mellau__piano-c-4_y7otcr.wav'), // A: C#4
      new Audio('https://res.cloudinary.com/dpmrtdiuh/video/upload/v1760085465/329961__mellau__piano-d4_nhc91z.wav'), // A: D4 (Resolves nicely)
    ];
    notes.forEach(note => {
        note.volume = 0.5;
        note.load();
    });
    despacitoNotesRef.current = notes;

    scoreSoundRef.current = new Audio('https://cdn.pixabay.com/audio/2022/11/22/audio_2c8a3294b2.mp3');
    scoreSoundRef.current.volume = 0.3;
    scoreSoundRef.current.load();

    gameOverSoundRef.current = new Audio('https://cdn.pixabay.com/audio/2022/02/07/audio_80921a9e70.mp3');
    gameOverSoundRef.current.volume = 0.5;
    gameOverSoundRef.current.load();

    startSoundRef.current = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_5511883341.mp3');
    startSoundRef.current.volume = 0.4;
    startSoundRef.current.load();
  }, []);

  const initAudio = useCallback(() => {
    if (audioContextRef.current) {
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return;
    }
    try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;
        console.log("Audio Context Initialized.");
    } catch (e) {
        console.error("Web Audio API is not supported.", e);
    }
  }, []);

  const playSound = useCallback((sound: HTMLAudioElement | null) => {
    if (isMutedRef.current || !sound) return;
    sound.currentTime = 0;
    sound.play().catch(error => console.error(`Audio play failed: ${error.message}`));
  }, []);
  // --- End Audio Refactoring ---

  useEffect(() => { birdRef.current = birdState; }, [birdState]);
  useEffect(() => { pipesRef.current = pipesState; }, [pipesState]);
  useEffect(() => { scoreRef.current = scoreState; }, [scoreState]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  useEffect(() => {
    const storedName = localStorage.getItem('rialoppyPlayerName');
    const storedScores = localStorage.getItem('rialoppyHighScores');

    if (storedName) {
        setPlayerName(storedName);
        setGameState('ready');
    } else {
        setGameState('enterName');
    }

    if (storedScores) {
        try {
            setHighScores(JSON.parse(storedScores));
        } catch (e) {
            console.error("Failed to parse high scores from localStorage", e);
            setHighScores([]);
        }
    }
  }, []);

  useEffect(() => {
      if (gameState === 'gameOver' && playerName) {
          const newScoreEntry = { name: playerName, score: scoreState };
          const updatedScores = [...highScores, newScoreEntry];
          updatedScores.sort((a, b) => b.score - a.score);
          const top10 = updatedScores.slice(0, 10);
          setHighScores(top10);
          localStorage.setItem('rialoppyHighScores', JSON.stringify(top10));
      }
  }, [gameState, scoreState, playerName, highScores]);

  const stopGame = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    playSound(gameOverSoundRef.current);
    setGameState('gameOver');
  }, [playSound]);

  const resetGame = useCallback(() => {
      playSound(startSoundRef.current);
      noteIndexRef.current = 0;
      setBirdState({ y: GAME_HEIGHT / 2 - INITIAL_BIRD_HEIGHT / 2, velocity: 0 });
      setPipesState([]);
      setScoreState(0);
      setGameState('ready');
  }, [playSound]);

  const startGame = useCallback(() => {
      noteIndexRef.current = 0;
      setGameState('playing');
  }, []);


  const handleInput = useCallback(() => {
    initAudio();
    const notes = despacitoNotesRef.current;
    if (gameState === 'ready') {
        startGame();
        if (notes.length > 0) {
            playSound(notes[noteIndexRef.current]);
            noteIndexRef.current = (noteIndexRef.current + 1) % notes.length;
        }
        setBirdState(prev => ({ ...prev, velocity: JUMP_STRENGTH }));
    } else if (gameState === 'playing') {
        if (notes.length > 0) {
            playSound(notes[noteIndexRef.current]);
            noteIndexRef.current = (noteIndexRef.current + 1) % notes.length;
        }
        setBirdState(prev => ({ ...prev, velocity: JUMP_STRENGTH }));
    } else if (gameState === 'gameOver') {
        resetGame();
    }
  }, [gameState, startGame, resetGame, playSound, initAudio]);

  const handleNameSubmit = (name: string) => {
      initAudio();
      playSound(startSoundRef.current);
      localStorage.setItem('rialoppyPlayerName', name);
      setPlayerName(name);
      setGameState('ready');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    // --- Pipe Generation using recursive setTimeout for reliability ---
    const scheduleNextPipe = () => {
      const currentPipeInterval = getPipeInterval(scoreRef.current);
      pipeTimeoutIdRef.current = window.setTimeout(() => {
        if (gameStateRef.current !== 'playing') return;

        const currentScore = scoreRef.current;
        const currentPipeGap = getPipeGap(currentScore);
        const verticalPadding = 50;
        const minTopHeight = verticalPadding + LOGO_VISUAL_HEIGHT;
        const maxTopHeight = GAME_HEIGHT - GROUND_HEIGHT - verticalPadding - LOGO_VISUAL_HEIGHT - currentPipeGap;
        const topHeight = Math.random() * (maxTopHeight - minTopHeight) + minTopHeight;
        
        setPipesState(prevPipes => [
          ...prevPipes,
          { x: GAME_WIDTH, topHeight, passed: false },
        ]);

        scheduleNextPipe(); // Schedule the next one
      }, currentPipeInterval);
    };

    // Start the pipe generation loop
    scheduleNextPipe();

    // --- Game Animation Loop (for physics, movement, and rendering) ---
    const gameLoop = () => {
      if (gameStateRef.current !== 'playing') return;
      
      const currentBird = birdRef.current;
      const currentScore = scoreRef.current;
      const currentBirdSize = getBirdSize(currentScore);
      const currentPipeGap = getPipeGap(currentScore);
      
      // --- Bird Physics ---
      const newVelocity = currentBird.velocity + GRAVITY;
      const newY = currentBird.y + newVelocity;

      if (newY + currentBirdSize.height > GAME_HEIGHT - GROUND_HEIGHT || newY < 0) {
        stopGame();
        return;
      }
      
      // --- Pipe Movement & Scoring ---
      let newScore = currentScore;
      const newPipes = pipesRef.current.map(pipe => {
          let hasPassed = pipe.passed;
          if (!pipe.passed && (pipe.x + PIPE_WIDTH < BIRD_LEFT_POSITION)) {
            hasPassed = true;
            newScore++;
            playSound(scoreSoundRef.current);
          }
          return { ...pipe, x: pipe.x - PIPE_SPEED, passed: hasPassed };
        })
        .filter(pipe => pipe.x > -PIPE_WIDTH);
      
      // --- Collision Detection ---
      const birdRect = { x: BIRD_LEFT_POSITION, y: newY, width: currentBirdSize.width, height: currentBirdSize.height };
      for (const pipe of newPipes) {
        const isXOverlap = birdRect.x < pipe.x + PIPE_WIDTH && birdRect.x + birdRect.width > pipe.x;

        if (isXOverlap) {
            const topPipeHitbox = { top: pipe.topHeight - LOGO_VISUAL_HEIGHT, bottom: pipe.topHeight };
            const bottomPipeHitbox = { top: pipe.topHeight + currentPipeGap, bottom: pipe.topHeight + currentPipeGap + LOGO_VISUAL_HEIGHT };
            const birdHitbox = { top: birdRect.y, bottom: birdRect.y + birdRect.height }
            
            const collidesWithTop = birdHitbox.bottom > topPipeHitbox.top && birdHitbox.top < topPipeHitbox.bottom;
            const collidesWithBottom = birdHitbox.bottom > bottomPipeHitbox.top && birdHitbox.top < bottomPipeHitbox.bottom;
            
            if (collidesWithTop || collidesWithBottom) {
              stopGame();
              return;
            }
        }
      }

      // --- State Updates ---
      setBirdState({ y: newY, velocity: newVelocity });
      setPipesState(newPipes);
      if (newScore !== currentScore) {
          setScoreState(newScore);
      }
     
      requestAnimationFrame(gameLoop);
    };
    const gameLoopId = requestAnimationFrame(gameLoop);

    return () => {
        cancelAnimationFrame(gameLoopId);
        if (pipeTimeoutIdRef.current) {
            clearTimeout(pipeTimeoutIdRef.current);
        }
    };
  }, [gameState, stopGame, playSound]);

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.key === ' ') {
            e.preventDefault();
            handleInput();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('click', handleInput);
      document.addEventListener('touchstart', handleInput);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('click', handleInput);
        document.removeEventListener('touchstart', handleInput);
      };
  }, [handleInput]);
  
  // --- Layout Scaling ---
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameWorldRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const gameContainer = gameContainerRef.current;
    const gameWorld = gameWorldRef.current;

    if (!gameContainer || !gameWorld) return;

    const resizeObserver = new ResizeObserver(() => {
        const { width, height } = gameContainer.getBoundingClientRect();
        const scale = Math.min(width / GAME_WIDTH, height / GAME_HEIGHT);
        gameWorld.style.transform = `scale(${scale})`;
    });

    resizeObserver.observe(gameContainer);

    return () => resizeObserver.disconnect();
  }, []);


  const currentBirdSize = getBirdSize(scoreState);
  const currentPipeGap = getPipeGap(scoreState);
  const glowColor = getGlowColor(scoreState);
  const colorizeFilter = getColorizeFilter(scoreState);
  const glowFilter = `drop-shadow(0 0 12px ${glowColor})`;

  const sharedLogoStyle: React.CSSProperties = {
    backgroundImage: `url(${LOGO_URL})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    filter: `${colorizeFilter} ${glowFilter}`,
    mixBlendMode: 'screen',
  };

  const groundLogoImageStyle: React.CSSProperties = {
    filter: `${colorizeFilter} ${glowFilter}`,
    mixBlendMode: 'screen',
    isolation: 'isolate',
  };

  const groundLedTextStyle = {
    '--glow-color': glowColor,
  } as React.CSSProperties;

  const isGameActive = gameState === 'playing' || gameState === 'ready';

  return (
    <div className="app-wrapper">
      <div ref={gameContainerRef} className="game-container">
        <div ref={gameWorldRef} className="game-world">
          <div className="top-right-controls">
            <button className="control-button cart-button" aria-label="Open shop">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7 18h10v-2H7v2zM1 3v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.24 17 6.5 17h12v-2H6.5c-.27 0-.52-.17-.6-.42L6.1 14h9.17l3.58-6.49A.996.996 0 0 0 18.5 6H5.21l-.94-2H1z"></path>
                </svg>
            </button>
            <button 
              className="control-button settings-button" 
              onClick={() => setIsMuted(prev => !prev)} 
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
              )}
            </button>
          </div>

          {gameState === 'enterName' && <EnterNameScreen onNameSubmit={handleNameSubmit} />}
          
          {isGameActive && (
            <>
              <div 
                className="bird" 
                style={{
                    ...sharedLogoStyle,
                    transform: `translateY(${birdState.y}px)`,
                    left: BIRD_LEFT_POSITION, 
                    width: currentBirdSize.width, 
                    height: currentBirdSize.height,
                    isolation: 'isolate',
                }}
                role="img"
                aria-label="Player character"
              />
              {pipesState.map((pipe, index) => {
                  const bottomPipeY = pipe.topHeight + currentPipeGap;
                  const obstacleStyle: React.CSSProperties = {
                    ...sharedLogoStyle,
                    height: `${LOGO_VISUAL_HEIGHT}px`,
                    width: `${LOGO_VISUAL_HEIGHT}px`,
                  };
                  return (
                    <div key={index} aria-hidden="true" style={{ position: 'absolute', top: 0, transform: `translateX(${pipe.x}px)`, width: PIPE_WIDTH, height: GAME_HEIGHT }}>
                      <div style={{ position: 'absolute', bottom: `${GAME_HEIGHT - pipe.topHeight}px`, left: '50%', transform: 'translateX(-50%)', width: `${PIPE_WIDTH}px`, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ ...obstacleStyle, transform: 'rotate(90deg) scaleY(-1)', }} />
                      </div>
                      <div style={{ position: 'absolute', top: `${bottomPipeY}px`, left: '50%', transform: 'translateX(-50%)', width: `${PIPE_WIDTH}px`, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ ...obstacleStyle, transform: 'rotate(90deg)', }} />
                      </div>
                    </div>
                  )
              })}
            </>
          )}
          
          <div className="ground" style={{ height: GROUND_HEIGHT }} aria-hidden="true">
              <div className="footer-logo-container">
                <img src={LOGO_URL} alt="Rialoppy Logo" className="footer-logo-image" style={groundLogoImageStyle} />
                <h1 className="ground-logo-text" style={groundLedTextStyle}>IALOPPY</h1>
              </div>
              <div className="score" aria-live="polite">{scoreState}</div>
          </div>

          {gameState === 'ready' && (
              <div className="ready-screen">
                  <h2>Click or Press Space to Start</h2>
              </div>
          )}

          {gameState === 'gameOver' && (
              <Leaderboard score={scoreState} highScores={highScores} glowColor={glowColor} />
          )}
        </div>
      </div>
      <div className="separator-panel" aria-hidden="true">
        {gameState === 'gameOver' && (
            <div className="game-over-panel-content" role="alert">
                <h2>Game Over</h2>
                <p>Score: {scoreState}</p>
                <p>Click or Press Space to Restart</p>
            </div>
        )}
         {gameState === 'ready' && playerName && (
             <div className="welcome-message">
                <p>Welcome, {playerName}</p>
                <p>High Score: {highScores[0]?.score || 0}</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default App;