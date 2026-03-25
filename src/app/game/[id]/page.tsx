'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/components/SocketProvider';
import { GameState, Player, Card as CardType } from '@/lib/types';
import Card from '@/components/Card';
import HelpModal from '@/components/HelpModal';
import StatsOverlay from '@/components/StatsOverlay';
import { cn } from '@/lib/utils';
import { Copy, Play, Send, CheckCircle, Info, BarChart3, ChevronRight, Sparkles, ChefHat } from 'lucide-react';

export default function GameRoom() {
    const { id } = useParams();
    const socket = useSocket();
    const router = useRouter();

    const [gameState, setGameState] = useState<GameState | null>(null);
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [targetPlayerId, setTargetPlayerId] = useState<string | null>(null);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [mealDescription, setMealDescription] = useState<string>('');

    useEffect(() => {
        if (!socket) return;

        const name = localStorage.getItem('chefName');
        if (name) {
            socket.emit('joinGame', { gameId: id, name });
        } else {
            socket.emit('joinRoom', { gameId: id });
        }

        socket.on('gameUpdate', (game: GameState) => {
            setGameState(game);
        });

        socket.on('connect', () => {
            const currentName = localStorage.getItem('chefName');
            if (currentName) {
                socket.emit('joinGame', { gameId: id, name: currentName });
            } else {
                socket.emit('joinRoom', { gameId: id });
            }
        });

        return () => {
            socket.off('gameUpdate');
        };
    }, [socket, id]);

    const prevPhaseRef = useRef<string | null>(null);

    useEffect(() => {
        if (gameState?.phase === 'THEME' || gameState?.phase === 'LOBBY' || gameState?.phase === 'WINNER') {
            setSelectedCards([]);
            setTargetPlayerId(null);
            setMealDescription('');
        }
    }, [gameState?.phase]);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    if (!gameState) return <div className="text-4xl font-bold animate-pulse text-kitchen-wood">Entering the Kitchen...</div>;

    const me = gameState.players.find(p => p.id === socket?.id);
    const isGM = me?.isGM;
    const isCritic = me?.isCritic;

    useEffect(() => {
        if (!gameState) return;
        if (prevPhaseRef.current !== 'JUDGING' && gameState.phase === 'JUDGING' && isCritic) {
            setTimeout(() => {
                window.alert("JUDGMENT TIME! Please review the dishes and pick a winner.");
            }, 100);
        }
        prevPhaseRef.current = gameState.phase;
    }, [gameState?.phase, isCritic]);

    const copyCode = async () => {
        const text = gameState?.id || '';
        try {
            // Priority 1: Modern API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                return;
            }
            throw new Error('Clipboard API unavailable');
        } catch (err) {
            // Priority 2: Fallback text area
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;
                // Ensure it's not visible but part of DOM
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    setCopied(true);
                }
            } catch (fallbackErr) {
                console.error('Copy failed completely', fallbackErr);
            }
        }
    };


    const startNextRound = () => {
        console.log('[DEBUG] GM clicking Next Round');
        socket?.emit('nextRound', { gameId: gameState?.id });
    };

    // Phase Renderers
    const renderLobby = () => (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="bg-white chaotic-border kitchen-shadow p-6 text-center">
                <p className="text-sm font-bold uppercase text-kitchen-wood/50 mb-2">Invite your fellow chefs</p>
                <div className="flex items-center gap-4 bg-kitchen-paper p-4 rounded-lg border-2 border-dashed border-kitchen-wood/30">
                    <span className="text-4xl font-mono font-bold tracking-widest">{gameState.id}</span>
                    <button onClick={copyCode} className="p-2 hover:bg-white rounded transition-colors">
                        {copied ? <CheckCircle className="text-green-500" /> : <Copy />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl">
                {gameState.players.map(p => (
                    <div key={p.id} className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                        <img src={p.avatar} alt={p.name} className="w-24 h-24 rounded-full chaotic-border border-4 bg-white" />
                        <span className="font-bold text-lg flex items-center gap-1">
                            {p.name} {p.isGM && <span className="text-xs bg-kitchen-red text-white px-1 rounded">GM</span>}
                            {p.id === socket?.id && <span className="text-xs bg-kitchen-green text-white px-1 rounded">YOU</span>}
                        </span>
                    </div>
                ))}
            </div>

            {isGM && gameState.players.length >= 3 ? (
                <button
                    onClick={() => socket?.emit('startGame', { gameId: gameState.id })}
                    className="bg-kitchen-red text-white px-8 py-4 rounded-2xl chaotic-border text-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <Play fill="currentColor" /> Start Game
                </button>
            ) : isGM && (
                <p className="text-kitchen-red font-bold italic">Waiting for at least 3 players...</p>
            )}
        </div>
    );

    const renderTheme = () => (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <h2 className="text-3xl font-bold uppercase text-kitchen-wood">
                    {isCritic ? "Set the Theme, Chef!" : `${gameState.players.find(p => p.isCritic)?.name} is setting the theme...`}
                </h2>
                <p className="italic text-kitchen-wood/60">Critic decides the vibe for this round.</p>
            </div>

            {isCritic && (
                <div className="flex flex-wrap justify-center gap-4">
                    {me?.hand.map(card => (
                        <Card
                            key={card.id}
                            card={card}
                            selected={selectedCards.includes(card.id)}
                            disabled={card.type !== 'Theme'}
                            onClick={() => {
                                if (card.type === 'Theme') {
                                    socket?.emit('playTheme', { gameId: gameState.id, cardId: card.id });
                                }
                            }}
                        />
                    ))}
                    <button
                        onClick={() => socket?.emit('playTheme', { gameId: gameState.id, cardId: null })}
                        className="w-32 h-44 chaotic-border border-dashed border-4 flex items-center justify-center p-4 text-center font-bold text-sm text-kitchen-wood/40 hover:text-kitchen-red hover:border-kitchen-red transition-all"
                    >
                        Skip Theme
                    </button>
                </div>
            )}
        </div>
    );

    const renderSubmission = () => (
        <div className="flex flex-col items-center gap-8 w-full">
            {gameState.activeTheme && (
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs font-bold uppercase text-kitchen-yellow">ROUND THEME</span>
                    <div className="bg-kitchen-yellow p-4 chaotic-border font-bold text-2xl rotate-2">
                        {gameState.activeTheme.name}
                    </div>
                </div>
            )}

            <div className="text-center">
                <h2 className="text-3xl font-bold text-kitchen-wood uppercase">
                    {isCritic ? "Waiting for players to cook..." : me?.submittedCards.length ? "Dish submitted!" : "What are you serving?"}
                </h2>
                {!isCritic && !me?.submittedCards.length && (
                    <p className="text-sm italic font-bold">Pick your best food items!</p>
                )}
            </div>

            {!isCritic && !me?.submittedCards.length && (
                <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
                    <div className="w-full">
                        <h3 className="text-xl font-bold text-kitchen-wood/60 mb-4 uppercase flex items-center gap-2">
                            <ChefHat size={20} /> Your Hand
                        </h3>
                        <div className="flex flex-wrap justify-center gap-4 p-4 bg-kitchen-paper/30 rounded-xl border-2 border-dashed border-kitchen-wood/10 min-h-[220px]">
                            {me?.hand.filter(c => !selectedCards.includes(c.id)).map(card => (
                                <Card
                                    key={card.id}
                                    card={card}
                                    disabled={card.type !== 'Food'}
                                    onClick={() => {
                                        if (card.type === 'Food') {
                                            setSelectedCards([...selectedCards, card.id]);
                                        }
                                    }}
                                />
                            ))}
                            {me?.hand.length === 0 && (
                                <p className="text-kitchen-wood/30 italic flex items-center justify-center">No cards in hand</p>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        <h3 className="text-xl font-bold text-kitchen-red mb-4 uppercase flex items-center gap-2">
                            <Sparkles size={20} /> Planning Area
                        </h3>
                        <div className="flex flex-wrap justify-center gap-4 p-4 bg-white/50 chaotic-border min-h-[220px] relative">
                            {selectedCards.map(cardId => {
                                const card = me?.hand.find(c => c.id === cardId);
                                if (!card) return null;
                                return (
                                    <Card
                                        key={card.id}
                                        card={card}
                                        selected={true}
                                        onClick={() => setSelectedCards(selectedCards.filter(id => id !== card.id))}
                                    />
                                );
                            })}
                            {selectedCards.length === 0 && (
                                <p className="text-kitchen-wood/30 italic flex items-center justify-center">Click cards from your hand to plan your dish</p>
                            )}
                        </div>
                    </div>

                    {selectedCards.length > 0 && (
                        <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-lg">
                            <textarea
                                value={mealDescription}
                                onChange={(e) => setMealDescription(e.target.value)}
                                placeholder="Describe your masterpiece..."
                                className="w-full p-3 chaotic-border rounded-xl resize-none text-kitchen-wood placeholder-kitchen-wood/40 border-2 border-dashed border-kitchen-wood/30 focus:outline-none focus:border-kitchen-red"
                                rows={3}
                                maxLength={200}
                            />
                            <button
                                onClick={() => {
                                    socket?.emit('submitFood', { gameId: gameState.id, cardIds: selectedCards, mealDescription });
                                    setSelectedCards([]);
                                    setMealDescription('');
                                }}
                                className="bg-kitchen-green text-white px-8 py-3 rounded-xl chaotic-border font-bold text-xl flex items-center gap-2 hover:scale-105 transition-transform"
                            >
                                <Send size={20} /> Submit Cards
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-4">
                {gameState.players.filter(p => !p.isCritic).map(p => (
                    <div key={p.id} className={cn("px-4 py-2 chaotic-border text-sm font-bold", p.submittedCards.length > 0 ? "bg-kitchen-green text-white" : "bg-white text-kitchen-wood/30")}>
                        {p.name} {p.submittedCards.length > 0 ? "✅" : "🍳"}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSabotage = () => (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-kitchen-red uppercase italic">SA-BO-TAGE!</h2>
                <p className="font-bold underlineDecoration-wavy">Play cards to ruin your rivals' hard work.</p>
            </div>

            <div className="flex flex-col items-center gap-12 w-full">
                <div className="flex flex-col items-center gap-4">
                    {!selectedCards.length && <p className="text-kitchen-red font-bold animate-pulse text-sm">Step 1: Select a Sabotage Card from your hand</p>}
                    {selectedCards.length > 0 && !targetPlayerId && <p className="text-kitchen-green font-bold animate-pulse text-sm">Step 2: Pick a rival to sabotage!</p>}

                    <div className="flex flex-wrap justify-center gap-8">
                        {gameState.players.filter(p => !p.isCritic && p.id !== socket?.id).map(p => (
                            <div
                                key={p.id}
                                className={cn(
                                    "flex flex-col items-center p-4 transition-all rounded-xl",
                                    targetPlayerId === p.id ? "bg-kitchen-red/10 animate-pulse scale-110 shadow-lg" : "",
                                    (!selectedCards.length && p.id !== socket?.id) || (selectedCards.length > 0 && p.id === socket?.id) ? "opacity-40 grayscale" : ""
                                )}
                            >
                                <button
                                    onClick={() => !isCritic && p.id !== socket?.id && setTargetPlayerId(p.id)}
                                    disabled={isCritic || p.id === socket?.id || !selectedCards.length}
                                    className={cn(
                                        "group relative transition-transform",
                                        selectedCards.length && p.id !== socket?.id ? "hover:scale-110 cursor-pointer" : "cursor-not-allowed"
                                    )}
                                >
                                    <img src={p.avatar} alt={p.name} className={cn(
                                        "w-20 h-20 rounded-full chaotic-border bg-white",
                                        targetPlayerId === p.id ? "border-kitchen-red border-4" : ""
                                    )} />
                                    {isCritic && <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white font-bold italic text-xs">HIDDEN</div>}
                                </button>
                                <span className="mt-2 font-bold text-sm uppercase">{p.id === socket?.id ? "YOU" : isCritic ? "???" : p.name}</span>
                                <div className="mt-1">
                                    {p.isDoneSabotage ? (
                                        <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">READY</span>
                                    ) : (
                                        <span className="text-[10px] bg-kitchen-wood/20 text-kitchen-wood/50 px-2 py-0.5 rounded-full font-bold">WAITING</span>
                                    )}
                                </div>
                                <div className="mt-2 flex gap-1 h-6">
                                    {p.sabotageCards.map((s, idx) => (
                                        <div key={idx} className="w-6 h-6 bg-kitchen-red rounded-full flex items-center justify-center text-[10px] text-white">🔥</div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {!isCritic && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex flex-wrap justify-center gap-4">
                            {me?.hand.map(card => (
                                <Card
                                    key={card.id}
                                    card={card}
                                    selected={selectedCards.includes(card.id)}
                                    disabled={card.type !== 'Sabotage'}
                                    onClick={() => {
                                        if (card.type === 'Sabotage') {
                                            if (selectedCards.includes(card.id)) {
                                                setSelectedCards([]);
                                            } else {
                                                setSelectedCards([card.id]);
                                            }
                                        }
                                    }}
                                />
                            ))}
                        </div>
                        {selectedCards.length > 0 && targetPlayerId && (
                            <button
                                onClick={() => {
                                    socket?.emit('playSabotage', { gameId: gameState.id, cardId: selectedCards[0], targetPlayerId });
                                    setSelectedCards([]);
                                    setTargetPlayerId(null);
                                }}
                                className="bg-kitchen-red text-white px-8 py-3 rounded-xl chaotic-border font-bold text-xl hover:scale-105 transition-transform"
                            >
                                🔥 Ruin {gameState.players.find(p => p.id === targetPlayerId)?.name}&apos;s Dish
                            </button>
                        )}
                        {!me?.isDoneSabotage && (
                            <button
                                onClick={() => socket?.emit('playerDoneSabotage', { gameId: gameState.id })}
                                className="mt-4 bg-kitchen-green text-white px-8 py-3 rounded-xl chaotic-border font-bold text-xl hover:scale-105 transition-transform"
                            >
                                👍 I&apos;m Done Sabotaging
                            </button>
                        )}
                    </div>
                )}

                {isCritic && (
                    <button
                        onClick={() => socket?.emit('endSabotage', { gameId: gameState.id })}
                        disabled={!gameState.players.filter(p => !p.isCritic).every(p => p.isDoneSabotage)}
                        className={cn(
                            "bg-kitchen-wood text-white px-8 py-3 rounded-xl chaotic-border font-bold text-xl transition-all",
                            !gameState.players.filter(p => !p.isCritic).every(p => p.isDoneSabotage) ? "opacity-30 cursor-not-allowed grayscale" : "hover:bg-black"
                        )}
                    >
                        {!gameState.players.filter(p => !p.isCritic).every(p => p.isDoneSabotage) 
                            ? "Waiting for Chefs..." 
                            : "Enough! Bring the food!"}
                    </button>
                )}
            </div>
        </div>
    );

    const renderJudging = () => (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <h2 className="text-4xl font-bold uppercase text-kitchen-wood">Judgment Time</h2>
                {isCritic ? (
                    <p className="text-kitchen-red font-bold animate-pulse">Pick your favorite collection of dishes!</p>
                ) : (
                    <p className="italic font-medium">The Critic is tasting the chaos...</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
                {gameState.players.filter(p => !p.isCritic).map((p, pIdx) => (
                    <div
                        key={p.id}
                        className={cn(
                            "flex flex-col gap-4 p-6 chaotic-border bg-white kitchen-shadow transition-all relative",
                            isCritic && "hover:bg-kitchen-yellow/5 cursor-pointer",
                            targetPlayerId === p.id && "ring-8 ring-kitchen-yellow border-kitchen-yellow scale-105 z-10"
                        )}
                        onClick={() => isCritic && setTargetPlayerId(p.id)}
                    >
                        <div className="absolute -top-4 -left-4 w-10 h-10 bg-kitchen-wood text-white rounded-full flex items-center justify-center font-bold text-xl chaotic-border">
                            {pIdx + 1}
                        </div>

                        <div className="flex flex-col gap-4">
                            <span className="text-xs font-bold uppercase text-kitchen-wood/30 tracking-tighter self-center italic">Chef Anonymous Dish</span>
                            {p.mealDescription && (
                                <span className="text-sm font-medium text-kitchen-wood italic text-center px-4">"{p.mealDescription}"</span>
                            )}
                            <div className="flex flex-wrap justify-center gap-2">
                                {p.submittedCards.map(c => <Card key={c.id} card={c} className="scale-75 -m-4" />)}
                            </div>
                        </div>

                        {p.sabotageCards.length > 0 && (
                            <div className="mt-4 pt-4 border-t-2 border-dashed border-kitchen-red/20">
                                <span className="text-xs font-bold text-kitchen-red uppercase">SABOTAGED WITH:</span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {p.sabotageCards.map(c => (
                                        <div key={c.id} className="bg-kitchen-red text-white text-[10px] px-2 py-1 rounded chaotic-border font-bold rotate-1">
                                            {c.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isCritic && targetPlayerId && (
                <button
                    onClick={() => {
                        socket?.emit('pickWinner', { gameId: gameState.id, winnerPlayerId: targetPlayerId });
                        setTargetPlayerId(null);
                    }}
                    className="bg-kitchen-green text-white px-12 py-4 rounded-2xl chaotic-border text-2xl font-bold hover:scale-110 transition-transform"
                >
                    🏆 Pick This Chef!
                </button>
            )}
        </div>
    );

    const renderWinner = () => (
        <div className="flex flex-col items-center gap-8 w-full animate-in zoom-in duration-500">
            <div className="text-center relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-4 opacity-50">
                    <Sparkles className="text-kitchen-yellow w-12 h-12 animate-bounce" />
                    <Sparkles className="text-kitchen-red w-12 h-12 animate-bounce delay-100" />
                </div>
                <h2 className="text-5xl font-bold text-kitchen-wood uppercase">Winner Winner!</h2>
                <p className="text-2xl font-bold text-kitchen-red italic underline decoration-wavy decoration-4">Chicken Dinner!</p>
            </div>

            <div className="flex flex-col items-center gap-4 bg-white p-12 chaotic-border kitchen-shadow">
                <img src={gameState.players.find(p => p.name === gameState.roundWinner)?.avatar} className="w-48 h-48 rounded-full chaotic-border border-8 border-kitchen-yellow bg-kitchen-paper" />
                <p className="text-3xl font-bold uppercase">{gameState.roundWinner} WINS!</p>
                <p className="font-bold text-kitchen-wood/50">Total round victories: {gameState.players.find(p => p.name === gameState.roundWinner)?.wins}</p>
            </div>

            {isGM && (
                <button
                    onClick={startNextRound}
                    className="mt-8 bg-kitchen-wood text-white px-12 py-4 rounded-xl chaotic-border text-2xl font-bold flex items-center gap-4 hover:bg-black transition-all"
                >
                    Next Round <ChevronRight size={32} />
                </button>
            )}
        </div>
    );

    const renderEnded = () => (
        <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in duration-500">
            <div className="text-center relative">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-4 opacity-70">
                    <Sparkles className="text-kitchen-yellow w-10 h-10 animate-bounce" />
                    <Sparkles className="text-kitchen-red w-10 h-10 animate-bounce delay-100" />
                    <Sparkles className="text-kitchen-green w-10 h-10 animate-bounce delay-200" />
                </div>
                <h2 className="text-5xl font-bold text-kitchen-wood uppercase tracking-tighter">Grand Champion!</h2>
                <p className="text-xl font-bold text-kitchen-red italic underline decoration-wavy decoration-2">The kitchen has spoken!</p>
            </div>

            <div className="flex flex-col items-center gap-4 bg-white p-8 chaotic-border kitchen-shadow">
                <img src={gameState.players.find(p => p.name === gameState.gameWinner)?.avatar} className="w-40 h-40 rounded-full chaotic-border border-8 border-kitchen-yellow bg-kitchen-paper" />
                <div className="text-center">
                    <p className="text-4xl font-bold uppercase text-kitchen-wood">{gameState.gameWinner}</p>
                    <p className="text-lg font-bold text-kitchen-yellow uppercase">Ultimate Kitchen Legend</p>
                </div>
                <div className="flex gap-4 mt-2">
                    <div className="bg-kitchen-wood text-white px-4 py-2 rounded-lg chaotic-border text-center">
                        <p className="text-xs uppercase opacity-70">Total Games Won</p>
                        <p className="text-2xl font-bold">{gameState.players.find(p => p.name === gameState.gameWinner)?.gamesWon}</p>
                    </div>
                </div>
            </div>

            {isGM && (
                <button
                    onClick={() => socket?.emit('resetGame', { gameId: gameState.id })}
                    className="mt-4 bg-kitchen-green text-white px-10 py-3 rounded-xl chaotic-border text-xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-lg"
                >
                    <Play fill="currentColor" size={24} /> Start New Game
                </button>
            )}
            
            <p className="text-kitchen-wood/40 text-sm font-bold italic mt-4">All players have been notified of your triumph!</p>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col gap-2 relative">
            {/* HUD */}
            <div className="flex justify-between items-center w-full mb-4">
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        className="p-2 bg-white chaotic-border kitchen-shadow hover:text-kitchen-red transition-all flex items-center gap-2 font-bold px-4"
                    >
                        <Info size={20} /> <span className="hidden md:inline">HOW TO PLAY</span>
                    </button>
                    <button
                        onClick={() => setIsStatsOpen(true)}
                        className="p-2 bg-white chaotic-border kitchen-shadow hover:text-kitchen-yellow transition-all flex items-center gap-2 font-bold px-4"
                    >
                        <BarChart3 size={20} /> <span className="hidden md:inline">STATS</span>
                    </button>
                </div>

                <div className="hidden md:flex gap-2">
                    <div className="bg-kitchen-red text-white px-4 py-1 rounded-full font-bold text-xs uppercase shadow-sm rotate-2">PHASE: {gameState.phase}</div>
                    <div className="bg-kitchen-wood text-white px-4 py-1 rounded-full font-bold text-xs uppercase shadow-sm -rotate-1">ROUND: {gameState.players.reduce((acc, p) => acc + p.wins, 0) + 1}</div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                {gameState.phase === 'LOBBY' && renderLobby()}
                {gameState.phase === 'THEME' && renderTheme()}
                {gameState.phase === 'SUBMISSION' && renderSubmission()}
                {gameState.phase === 'SABOTAGE' && renderSabotage()}
                {gameState.phase === 'JUDGING' && renderJudging()}
                {gameState.phase === 'WINNER' && renderWinner()}
                {gameState.phase === 'ENDED' && renderEnded()}
            </div>

            {/* MODALS */}
            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
            <StatsOverlay isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} players={gameState.players} />
        </div>
    );
}
