'use client';

import React from 'react';
import { ChartBar, X } from 'lucide-react';
import { Player } from '@/lib/types';

interface StatsProps {
    isOpen: boolean;
    onClose: () => void;
    players: Player[];
}

export default function StatsOverlay({ isOpen, onClose, players }: StatsProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white chaotic-border kitchen-shadow max-w-md w-full p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-kitchen-wood hover:text-kitchen-red transition-colors">
                    <X size={32} />
                </button>

                <h2 className="text-3xl font-bold text-kitchen-wood mb-6 uppercase flex items-center gap-2">
                    <ChartBar size={32} /> Kitchen Stats
                </h2>

                <div className="space-y-4">
                    {players.sort((a, b) => b.wins - a.wins).map((player, idx) => (
                        <div key={player.id} className="flex items-center gap-4 p-3 bg-kitchen-paper chaotic-border border-transparent hover:border-kitchen-wood/20 transition-all">
                            <span className="text-2xl font-bold text-kitchen-red w-8">{idx + 1}.</span>
                            <img src={player.avatar} alt={player.name} className="w-12 h-12 rounded-full chaotic-border border-2 bg-white" />
                            <div className="flex-1">
                                <p className="font-bold text-lg">{player.name}</p>
                                <p className="text-sm font-bold text-kitchen-wood/50 uppercase">{player.wins} rounds won</p>
                            </div>
                            <div className="w-12 h-12 flex items-center justify-center bg-kitchen-yellow rounded-full chaotic-border font-bold text-xl">
                                {player.wins}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t-2 border-dashed border-kitchen-wood/20 flex justify-between text-xs font-bold uppercase text-kitchen-wood/40 italic">
                    <span>Game Active</span>
                    <span>Rounds: {players.reduce((acc, p) => acc + p.wins, 0)}</span>
                </div>
            </div>
        </div>
    );
}
