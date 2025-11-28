export enum CropType {
  MAIZE = 'Maize',
  TOMATO = 'Tomato',
  RAPE = 'Rape (Covo)',
  SPINACH = 'Spinach',
  ONION = 'Onion',
  EMPTY = 'Empty'
}

export enum GrowthStage {
  SEED = 0,
  SPROUT = 1,
  GROWING = 2,
  MATURE = 3,
  WITHERED = 4
}

export interface Crop {
  type: CropType;
  name: string;
  daysToMature: number;
  waterNeeds: number; // 1-10 scale
  description: string;
  xpReward: number;
  icon: string;
}

export interface Plot {
  id: number;
  crop: CropType;
  growthStage: GrowthStage;
  daysPlanted: number;
  waterLevel: number; // 0-100
  health: number; // 0-100
}

export interface GameState {
  xp: number;
  level: number;
  day: number;
  money: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}