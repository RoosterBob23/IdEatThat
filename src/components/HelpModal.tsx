'use client';

import React from 'react';
import { X, HelpCircle } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white chaotic-border kitchen-shadow max-w-2xl w-full p-8 relative overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-kitchen-wood hover:text-kitchen-red transition-colors">
                    <X size={32} />
                </button>

                <h2 className="text-4xl font-bold text-kitchen-red mb-6 uppercase flex items-center gap-2">
                    <HelpCircle size={40} /> Kitchen Rules
                </h2>

                <div className="space-y-6 text-kitchen-wood font-medium">
                    <section>
                        <h3 className="text-xl font-bold uppercase underline">1. The Setup</h3>
                        <p>One player is the <strong>Critic</strong>. Everyone else is a hungry chef trying to please them.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold uppercase underline">2. Theme Phase</h3>
                        <p>The Critic can choose to play a <strong>Theme Card</strong> (e.g., "Asian", "Fried"). If they don't, there is no theme for the round.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold uppercase underline">3. Submission Phase</h3>
                        <p>Select <strong>Food Cards</strong> from your hand that best fit the theme. If you have no Food cards, you get a fresh hand!</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold uppercase underline">4. Sabotage Phase</h3>
                        <p>This is where it gets messy. You can play <strong>Sabotage Cards</strong> on other players' submissions to ruin their chances (e.g., "Too Salted", "Dropped on floor").</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold uppercase underline">5. Judging Phase</h3>
                        <p>The Critic reviews all submissions (names hidden!) and picks a winner. First to win <strong>5 rounds</strong> wins the game!</p>
                    </section>
                </div>

                <div className="mt-8 p-4 bg-kitchen-yellow/20 chaotic-border border-kitchen-yellow text-center font-bold italic">
                    "If you can't stand the heat, play a sabotage card!"
                </div>
            </div>
        </div>
    );
}
