import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import * as GameRegistry from './src/lib/gameRegistry';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        handle(req, res, parsedUrl);
    });

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New connection:', socket.id);

        socket.on('createGame', ({ name }) => {
            console.log(`[USER ACTIVITY] User ${name} created new game`);
            const game = GameRegistry.createGame(socket.id, name);
            socket.join(game.id);
            socket.emit('gameUpdate', game);
        });

        socket.on('joinRoom', ({ gameId }) => {
            const game = GameRegistry.getGame(gameId);
            if (game) {
                socket.join(gameId);
                socket.emit('gameUpdate', game);
            }
        });

        socket.on('joinGame', ({ gameId, name }) => {
            console.log(`[USER ACTIVITY] User ${name} joining game ${gameId}`);
            const game = GameRegistry.joinGame(gameId, socket.id, name);
            if (game) {
                socket.join(gameId);
                io.to(gameId).emit('gameUpdate', game);
            } else {
                socket.emit('error', 'Game not found or already started');
            }
        });

        socket.on('startGame', ({ gameId }) => {
            const game = GameRegistry.startGame(gameId, socket.id);
            if (game) {
                const playerName = game.players.find(p => p.id === socket.id)?.name || socket.id;
                console.log(`[USER ACTIVITY] User ${playerName} started game ${gameId}`);
                io.to(gameId).emit('gameUpdate', game);
            }
        });

        socket.on('playTheme', ({ gameId, cardId }) => {
            const game = GameRegistry.playThemeCard(gameId, socket.id, cardId);
            if (game) {
                const playerName = game.players.find(p => p.id === socket.id)?.name || socket.id;
                console.log(`[USER ACTIVITY] User ${playerName} ${cardId ? 'played a theme card' : 'skipped theme'} in game ${gameId}`);
                io.to(gameId).emit('gameUpdate', game);
            }
        });

        socket.on('submitFood', ({ gameId, cardIds, mealDescription }) => {
            const game = GameRegistry.submitFoodCards(gameId, socket.id, cardIds, mealDescription);
            if (game) {
                const playerName = game.players.find(p => p.id === socket.id)?.name || socket.id;
                console.log(`[USER ACTIVITY] User ${playerName} submitted food cards in game ${gameId}`);
                io.to(gameId).emit('gameUpdate', game);
            }
        });

        socket.on('playSabotage', ({ gameId, cardId, targetPlayerId }) => {
            const game = GameRegistry.playSabotageCard(gameId, socket.id, cardId, targetPlayerId);
            if (game) {
                const playerName = game.players.find(p => p.id === socket.id)?.name || socket.id;
                console.log(`[USER ACTIVITY] User ${playerName} played a sabotage card in game ${gameId}`);
                io.to(gameId).emit('gameUpdate', game);
            }
        });

        socket.on('playerDoneSabotage', ({ gameId }) => {
            const game = GameRegistry.playerDoneSabotage(gameId, socket.id);
            if (game) {
                const playerName = game.players.find(p => p.id === socket.id)?.name || socket.id;
                console.log(`[USER ACTIVITY] User ${playerName} clicked 'Done Sabotaging' in game ${gameId}`);
                io.to(gameId).emit('gameUpdate', game);
            }
        });

        socket.on('endSabotage', ({ gameId }) => {
            const game = GameRegistry.endSabotage(gameId);
            if (game) {
                io.to(gameId).emit('gameUpdate', game);
            }
        });

        socket.on('pickWinner', ({ gameId, winnerPlayerId }) => {
            const game = GameRegistry.pickRoundWinner(gameId, socket.id, winnerPlayerId);
            if (game) {
                io.to(gameId).emit('gameUpdate', game);
            }
        });

        socket.on('nextRound', ({ gameId }) => {
            const game = GameRegistry.nextRound(gameId);
            if (game) {
                const playerName = game.players.find(p => p.id === socket.id)?.name || socket.id;
                console.log(`[USER ACTIVITY] User ${playerName} initiated next round for game ${gameId}`);
                io.to(gameId).emit('gameUpdate', game);
            }
        });

        socket.on('resetGame', ({ gameId }) => {
            const game = GameRegistry.resetGame(gameId);
            if (game) {
                const playerName = game.players.find(p => p.id === socket.id)?.name || socket.id;
                console.log(`[USER ACTIVITY] User ${playerName} reset game ${gameId}`);
                io.to(gameId).emit('gameUpdate', game);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
