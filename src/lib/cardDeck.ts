import fs from 'fs';
import path from 'path';
import { Card, CardType } from './types';

export function loadDeck(): Card[] {
    const csvPath = path.join(process.cwd(), 'Card List - Sheet1.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n');

    const deck: Card[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV split (handling quoted commas might be needed if cards have them, 
        // but looking at the preview they don't seem to have complex quoting)
        const [name, type] = line.split(',');
        if (name && type) {
            deck.push({
                id: `card-${i}`,
                name: name.trim(),
                type: type.trim() as CardType
            });
        }
    }

    return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function dealCards(deck: Card[], count: number): { hand: Card[], remainingDeck: Card[] } {
    const hand = deck.slice(0, count);
    const remainingDeck = deck.slice(count);
    return { hand, remainingDeck };
}
