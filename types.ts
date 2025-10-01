export type GameStatus = "start" | "playing" | "gameOver";

export interface Bird {
  y: number;
  velocity: number;
}

export interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}
