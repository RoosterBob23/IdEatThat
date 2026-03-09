1. Technical Preferences
Tech Stack: Do you have a preferred technology stack? I recommend Next.js with Tailwind CSS for the frontend, and potentially Socket.io for real-time game state synchronization.
Answer: Yes, I would like to use Next.js with Tailwind CSS for the frontend, and potentially Socket.io for real-time game state synchronization.

Database: Do we need a persistent database for the leaderboard, or is an in-memory solution (or a simple file-based one like SQLite) sufficient for now?
Answer: I would like to use an in-memory solution for now.

Hosting/Environment: Is this intended for local play or a public server?
Answer: I would like to use a public server.

2. Game Mechanics Clarifications
The Deck: Are all types of cards (Food, Sabotage, Theme) mixed into one single deck that players draw from, or are there separate piles for themes and player cards?
Answer: I would like to use a mixed deck.

Theme Phase: The overview says players have an "opportunity to play Theme cards, starting with the Critic." Does this mean if the Critic doesn't have/want to play a Theme card, the next person can? 
Answer: Yes, if the Critic doesn't have/want to play a Theme card, the next person can.

What happens if nobody plays a Theme card?
Answer: Then there is no theme for that round

Sabotage Phase: Can any player sabotage any other player? 
Answer: Yes

Is there a limit to how many sabotage cards can be played per round?
Answer: No

Hand Balance: Since players draw up to 5 cards, what happens if a player has a hand full of Sabotage cards during the submission phase? Do they have to submit a Food card?
Answer: If a player only has sabotage cards or theme cards, then they discard their hand and draw a new one.


3. Design/Aesthetics

Does "IdEatThat" have a specific visual vibe you're going for? (e.g., retro diner, modern minimalist, chaotic kitchen?)
Answer: Chaotic kitchen

Additional Notes:
- create an avitar for each player based on the Design/Aesthetics section
