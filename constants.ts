export const GAME_WIDTH = 500;
export const GAME_HEIGHT = 800;

export const INITIAL_BIRD_WIDTH = 35;
export const INITIAL_BIRD_HEIGHT = 35;
export const BIRD_SIZE_INCREMENT = 5; // Bird grows more frequently, so smaller increments
export const BIRD_LEFT_POSITION = 100;

export const GROUND_HEIGHT = 100;
export const GRAVITY = 0.5;
export const JUMP_STRENGTH = -9;

export const PIPE_WIDTH = 80;
export const PIPE_GAP = 200;
export const PIPE_SPEED = 3;
export const PIPE_INTERVAL = 1500; // ms

/**
 * Calculates the bird's size based on the score.
 * The bird grows continuously every 5 points.
 * @param score The current game score.
 * @returns An object with the new width and height.
 */
export const getBirdSize = (score: number) => {
  const increments = Math.floor(score / 5);
  const width = INITIAL_BIRD_WIDTH + increments * BIRD_SIZE_INCREMENT;
  const height = INITIAL_BIRD_HEIGHT + increments * BIRD_SIZE_INCREMENT;
  return { width, height };
};

/**
 * Determines the glow color based on the score.
 * @param score The current or high score.
 * @returns A string representing the RGBA color for the glow effect.
 */
export const getGlowColor = (score: number): string => {
  if (score >= 25) return 'rgba(148, 0, 211, 0.7)'; // Tím Đậm (Dark Violet)
  if (score >= 20) return 'rgba(255, 69, 0, 0.7)'; // Đỏ Cam (Orange Red)
  if (score >= 15) return 'rgba(255, 0, 255, 0.7)'; // Hồng Sẫm (Fuchsia)
  if (score >= 10) return 'rgba(255, 165, 0, 0.7)'; // Cam (Orange)
  if (score >= 5) return 'rgba(173, 255, 47, 0.7)'; // Vàng Chanh (Green-Yellow)
  return 'rgba(0, 255, 255, 0.7)'; // Xanh Cyan (Cyan) (Mặc định)
};
