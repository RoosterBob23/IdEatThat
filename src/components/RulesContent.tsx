import React from 'react';

export default function RulesContent() {
    return (
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
    );
}
