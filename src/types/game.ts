export interface GameState {
  isPlaying: boolean;
  isGameOver: boolean;
  score: number;
  lives: number;
  level: number;
  mice: Mouse[];
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Mouse {
  id: string;
  position: Position;
  velocity: Position;
  timeToLive: number;
  caught: boolean;
}

export interface GameConfig {
  maxLives: number;
  mouseSpawnRate: number;
  mouseSpeed: number;
  mouseLifespan: number;
  levelUpScore: number;
  maxMiceOnScreen: number;
}