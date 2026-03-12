export type CardType = 'Food' | 'Sabotage' | 'Theme';

export interface Card {
  id: string;
  name: string;
  type: CardType;
}

export type GamePhase = 'LOBBY' | 'THEME' | 'SUBMISSION' | 'SABOTAGE' | 'JUDGING' | 'WINNER' | 'ENDED';

export interface Player {
  id: string; // socket id
  name: string;
  avatar: string;
  hand: Card[];
  isGM: boolean;
  isCritic: boolean;
  wins: number;
  submittedCards: Card[];
  sabotageCards: Card[];
  isDoneSabotage: boolean;
}

export interface GameState {
  id: string;
  gmId: string;
  phase: GamePhase;
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  activeTheme: Card | null;
  roundWinner: string | null; // player name
  gameWinner: string | null; // player name
  lastActivity: number;
}
