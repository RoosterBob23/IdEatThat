import { loadDeck } from './src/lib/cardDeck';

const deck = loadDeck();
console.log(`Loaded ${deck.length} cards.`);
const types = deck.reduce((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + 1;
    return acc;
}, {} as Record<string, number>);
console.log('Card types:', types);
