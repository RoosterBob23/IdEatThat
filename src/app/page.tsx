'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/components/SocketProvider';
import { GameState } from '@/lib/types';
import { PlusCircle, LogIn, Utensils } from 'lucide-react';

export default function Home() {
  const socket = useSocket();
  const router = useRouter();
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('gameUpdate', (game: GameState) => {
      router.push(`/game/${game.id}`);
    });

    socket.on('error', (msg: string) => {
      setError(msg);
    });

    return () => {
      socket.off('gameUpdate');
      socket.off('error');
    };
  }, [socket, router]);

  const handleCreate = () => {
    if (!name) return setError('Please enter your name');
    socket?.emit('createGame', { name });
  };

  const handleJoin = () => {
    if (!name || !gameId) return setError('Please enter name and game ID');
    socket?.emit('joinGame', { gameId: gameId.toUpperCase(), name });
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-md bg-white p-8 chaotic-border kitchen-shadow">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-kitchen-wood flex items-center gap-2">
          <Utensils className="text-kitchen-red" /> Step into the Kitchen
        </h2>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-kitchen-wood/70 uppercase">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chef Boyardee"
            className="p-3 border-4 border-kitchen-wood/20 rounded-lg focus:border-kitchen-red outline-none transition-colors italic"
          />
        </div>

        {error && <p className="text-kitchen-red font-bold text-sm animate-bounce">⚠️ {error}</p>}
      </div>

      <div className="flex flex-col gap-6">
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 bg-kitchen-yellow p-4 rounded-xl chaotic-border font-bold text-xl hover:bg-yellow-400 transition-transform hover:scale-105"
        >
          <PlusCircle /> Create New Game
        </button>

        <div className="flex items-center gap-4">
          <div className="h-[2px] flex-1 bg-kitchen-wood/10" />
          <span className="text-kitchen-wood/40 font-bold uppercase italic text-xs">OR JOIN ONE</span>
          <div className="h-[2px] flex-1 bg-kitchen-wood/10" />
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="JOIN CODE (e.g. AB12)"
            className="p-3 border-4 border-kitchen-wood/20 rounded-lg focus:border-kitchen-yellow outline-none transition-colors font-mono text-center text-xl uppercase"
          />
          <button
            onClick={handleJoin}
            className="flex items-center justify-center gap-2 bg-kitchen-green p-4 rounded-xl chaotic-border font-bold text-xl hover:bg-green-500 text-white transition-transform hover:scale-105"
          >
            <LogIn /> Join Game
          </button>
        </div>
      </div>
    </div>
  );
}
