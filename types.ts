export enum GameType {
  NUMBERS = 'NUMBERS',
  BINARIES = 'BINARIES',
  CARDS = 'CARDS',
  WORDS = 'WORDS',
  NAMES_FACES = 'NAMES_FACES',
  IMAGES = 'IMAGES',
  COLORS = 'COLORS',
}

export enum GameState {
  MENU = 'MENU',
  SETUP = 'SETUP',
  MEMORIZE = 'MEMORIZE',
  RECALL = 'RECALL',
  RESULTS = 'RESULTS',
  HISTORY = 'HISTORY',
  GUIDE = 'GUIDE',
}

export enum CardSuit {
  SPADES = '♠',
  HEARTS = '♥',
  DIAMONDS = '♦',
  CLUBS = '♣',
}

export interface PlayingCard {
  id: string;
  suit: CardSuit;
  rank: string; // A, 2-10, J, Q, K
  value: number; // 1-13 for sorting
  color: 'red' | 'black';
}

export interface NameFace {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface GameSettings {
  timeLimit: number; // in seconds
  quantity: number; // number of items
  grouping?: number; // for numbers/binaries
}

export interface AnalysisResult {
  score: number;
  total: number;
  accuracy: number;
  mistakes: number;
  timeUsed: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  gameType: GameType;
  score: number;
  total: number;
  accuracy: number;
  timeUsed: number;
}
