import { GameState, Player, Card, GamePhase } from './types';
import { loadDeck, shuffleDeck, dealCards } from './cardDeck';

const games = new Map<string, GameState>();
const EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour
const STARTED_EXPIRATION_TIME = 4 * 60 * 60 * 1000; // 4 hours

export function createGame(gmId: string, gmName: string): GameState {
    const gameId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const deck = shuffleDeck(loadDeck());

    const gm: Player = {
        id: gmId,
        name: gmName,
        avatar: '/avatars/avatar_chef_angry_1773065971117.png', // Default for GM
        hand: [],
        isGM: true,
        isCritic: true, // First GM is the first critic
        wins: 0,
        gamesWon: 0,
        submittedCards: [],
        sabotageCards: [],
        isDoneSabotage: false
    };

    const newState: GameState = {
        id: gameId,
        gmId,
        phase: 'LOBBY',
        players: [gm],
        deck,
        discardPile: [],
        activeTheme: null,
        roundWinner: null,
        gameWinner: null,
        lastActivity: Date.now()
    };

    games.set(gameId, newState);
    return newState;
}

export function getGameByPlayerId(playerId: string): GameState | undefined {
    return Array.from(games.values()).find(g => g.players.some(p => p.id === playerId));
}

export function getGame(id: string): GameState | undefined {
    const game = games.get(id);
    if (game) {
        game.lastActivity = Date.now();
    }
    return game;
}

export function joinGame(gameId: string, playerId: string, playerName: string): GameState | null {
    const game = games.get(gameId);
    if (!game || game.phase !== 'LOBBY') return null;

    // Check if player already exists by ID
    const playerWithMatchingId = game.players.find(p => p.id === playerId);
    if (playerWithMatchingId) return game;

    // Check if player already exists by Name (Reconnection/Redirect)
    const existingPlayerByName = game.players.find(p => p.name === playerName);
    if (existingPlayerByName) {
        existingPlayerByName.id = playerId;
        if (existingPlayerByName.isGM) {
            game.gmId = playerId;
        }
        return game;
    }

    const avatars = [
        '/avatars/avatar_waiter_clumsy_1773065990683.png',
        '/avatars/avatar_burnt_toast_1773066003076.png',
        '/avatars/avatar_mustard_mad_1773066116691.png',
        '/avatars/avatar_onion_crying_1773066143429.png'
    ];

    const playerAvatar = avatars[game.players.length % avatars.length];

    const newPlayer: Player = {
        id: playerId,
        name: playerName,
        avatar: playerAvatar,
        hand: [],
        isGM: false,
        isCritic: false,
        wins: 0,
        gamesWon: 0,
        submittedCards: [],
        sabotageCards: [],
        isDoneSabotage: false
    };

    game.players.push(newPlayer);
    game.lastActivity = Date.now();
    return game;
}

export function startGame(gameId: string, gmId: string): GameState | null {
    const game = games.get(gameId);
    if (!game || game.gmId !== gmId || game.phase !== 'LOBBY') return null;

    // Deal initial hands
    game.players.forEach(player => {
        const { hand, remainingDeck } = dealCards(game.deck, 5);
        console.log(`[USER ACTIVITY] Dealt cards to ${player.name}: ${hand.map(c => c.name).join(', ')}`);
        player.hand = hand;
        game.deck = remainingDeck;
    });

    game.phase = 'THEME';
    autoSkipThemeIfNoCard(game);
    game.lastActivity = Date.now();
    return game;
}

function autoSkipThemeIfNoCard(game: GameState) {
    if (game.phase === 'THEME') {
        const critic = game.players.find(p => p.isCritic);
        if (critic && !critic.hand.some(c => c.type === 'Theme')) {
            console.log(`[USER ACTIVITY] Critic ${critic.name} has no Theme cards. Auto-skipping THEME phase.`);
            game.phase = 'SUBMISSION';
            game.players.forEach(p => checkAndRefreshHand(game, p));
        }
    }
}

export function playThemeCard(gameId: string, playerId: string, cardId: string | null): GameState | null {
    const game = games.get(gameId);
    if (!game || game.phase !== 'THEME') return null;

    const player = game.players.find(p => p.id === playerId);
    if (!player || !player.isCritic) return null;

    if (cardId) {
        const cardIndex = player.hand.findIndex(c => c.id === cardId);
        if (cardIndex !== -1 && player.hand[cardIndex].type === 'Theme') {
            game.activeTheme = player.hand[cardIndex];
            player.hand.splice(cardIndex, 1);
        }
    }

    game.phase = 'SUBMISSION';
    game.lastActivity = Date.now();

    // Rule: If a player only has sabotage/theme cards, they discard and draw a new hand
    game.players.forEach(p => checkAndRefreshHand(game, p));

    return game;
}

function checkAndRefreshHand(game: GameState, player: Player) {
    const hasFood = player.hand.some(c => c.type === 'Food');
    if (!hasFood && player.hand.length > 0) {
        game.discardPile.push(...player.hand);
        const { hand, remainingDeck } = dealCards(game.deck, 5);
        console.log(`[USER ACTIVITY] Replacing hand for ${player.name} (no food cards). Dealt: ${hand.map(c => c.name).join(', ')}`);
        player.hand = hand;
        game.deck = remainingDeck;
    }
}

export function submitFoodCards(gameId: string, playerId: string, cardIds: string[], mealDescription?: string): GameState | null {
    const game = games.get(gameId);
    if (!game || game.phase !== 'SUBMISSION') return null;

    const player = game.players.find(p => p.id === playerId);
    if (!player || player.isCritic) return null;

    const cards = player.hand.filter(c => cardIds.includes(c.id) && c.type === 'Food');
    if (cards.length === 0) return null;

    player.submittedCards = cards;
    if (mealDescription) {
        player.mealDescription = mealDescription;
    }
    player.hand = player.hand.filter(c => !cardIds.includes(c.id));

    // If all non-critic players submitted, move to sabotage
    const nonCritics = game.players.filter(p => !p.isCritic);
    if (nonCritics.every(p => p.submittedCards.length > 0)) {
        game.phase = 'SABOTAGE';
    }

    game.lastActivity = Date.now();
    return game;
}

export function playSabotageCard(gameId: string, playerId: string, cardId: string, targetPlayerId: string): GameState | null {
    const game = games.get(gameId);
    if (!game || game.phase !== 'SABOTAGE') return null;

    const player = game.players.find(p => p.id === playerId);
    const targetPlayer = game.players.find(p => p.id === targetPlayerId);
    if (!player || !targetPlayer || targetPlayer.isCritic) return null;

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1 || player.hand[cardIndex].type !== 'Sabotage') return null;

    const sabotageCard = player.hand[cardIndex];
    targetPlayer.sabotageCards.push(sabotageCard);
    player.hand.splice(cardIndex, 1);

    game.lastActivity = Date.now();
    return game;
}

export function playerDoneSabotage(gameId: string, playerId: string): GameState | null {
    const game = games.get(gameId);
    if (!game || game.phase !== 'SABOTAGE') return null;

    const player = game.players.find(p => p.id === playerId);
    if (!player || player.isCritic) return null;

    player.isDoneSabotage = true;
    game.lastActivity = Date.now();
    return game;
}

export function endSabotage(gameId: string): GameState | null {
    const game = games.get(gameId);
    if (!game || game.phase !== 'SABOTAGE') return null;

    game.phase = 'JUDGING';
    game.lastActivity = Date.now();
    return game;
}

export function pickRoundWinner(gameId: string, playerId: string, winnerPlayerId: string): GameState | null {
    const game = games.get(gameId);
    if (!game || game.phase !== 'JUDGING') return null;

    const critic = game.players.find(p => p.id === playerId);
    if (!critic || !critic.isCritic) return null;

    const winner = game.players.find(p => p.id === winnerPlayerId);
    if (!winner) return null;

    winner.wins += 1;
    game.roundWinner = winner.name;
    game.phase = 'WINNER';

    if (winner.wins >= 5) {
        game.gameWinner = winner.name;
        winner.gamesWon += 1;
        game.phase = 'ENDED';
    }

    game.lastActivity = Date.now();
    return game;
}

export function nextRound(gameId: string): GameState | null {
    const game = games.get(gameId);
    if (!game) return null;

    console.log(`[DEBUG] nextRound: Starting round cleanup for game ${gameId}`);
    // Move cards to discard pile and clear temporary fields
    game.players.forEach(p => {
        console.log(`[DEBUG] nextRound: Clearing cards for player ${p.name}. Had ${p.submittedCards.length} submitted cards.`);
        game.discardPile.push(...p.submittedCards);
        game.discardPile.push(...p.sabotageCards);
        p.submittedCards = [];
        p.sabotageCards = [];
        p.isDoneSabotage = false;
        p.mealDescription = undefined;

        // Replenish hand to 5
        const needed = 5 - p.hand.length;
        if (needed > 0) {
            const { hand, remainingDeck } = dealCards(game.deck, needed);
            console.log(`[USER ACTIVITY] Replenished ${needed} cards for ${p.name}: ${hand.map(c => c.name).join(', ')}`);
            p.hand.push(...hand);
            game.deck = remainingDeck;
        }
    });

    if (game.activeTheme) {
        game.discardPile.push(game.activeTheme);
        game.activeTheme = null;
    }

    // Rotate Critic
    const currentCriticIndex = game.players.findIndex(p => p.isCritic);
    game.players[currentCriticIndex].isCritic = false;
    const nextCriticIndex = (currentCriticIndex + 1) % game.players.length;
    game.players[nextCriticIndex].isCritic = true;
    console.log(`[DEBUG] nextRound: New critic is ${game.players[nextCriticIndex].name}`);

    game.phase = 'THEME';
    autoSkipThemeIfNoCard(game);
    game.roundWinner = null;
    game.lastActivity = Date.now();
    return game;
}

export function resetGame(gameId: string): GameState | null {
    const game = games.get(gameId);
    if (!game) return null;

    console.log(`[DEBUG] resetGame: Full reset for game ${gameId}`);
    
    // Clear all player round stats and cards
    game.players.forEach(p => {
        p.wins = 0;
        p.submittedCards = [];
        p.sabotageCards = [];
        p.isDoneSabotage = false;
        p.mealDescription = undefined;
        
        // Initial hand size
        const { hand, remainingDeck } = dealCards(shuffleDeck(loadDeck()), 5); // Start fresh deck
        console.log(`[USER ACTIVITY] Dealt cards to ${p.name} on reset: ${hand.map(c => c.name).join(', ')}`);
        p.hand = hand;
        game.deck = remainingDeck;
    });

    game.discardPile = [];
    game.activeTheme = null;
    game.roundWinner = null;
    game.gameWinner = null;
    game.phase = 'THEME';
    autoSkipThemeIfNoCard(game);
    game.lastActivity = Date.now();

    return game;
}

// Cleanup expired games
setInterval(() => {
    const now = Date.now();
    for (const [id, game] of games.entries()) {
        const expirationTime = game.phase === 'LOBBY' ? EXPIRATION_TIME : STARTED_EXPIRATION_TIME;
        if (now - game.lastActivity > expirationTime) {
            console.log(`[DEBUG] Game ${id} expired. Phase: ${game.phase}`);
            games.delete(id);
        }
    }
}, 5 * 60 * 1000); // Check every 5 minutes
