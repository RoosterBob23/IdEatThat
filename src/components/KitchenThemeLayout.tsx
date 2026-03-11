'use client';

import React from 'react';
import { Utensils } from 'lucide-react';

export default function KitchenThemeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-kitchen-paper paper-texture p-4 md:p-8 flex flex-col items-center">
            <header className="mb-8 flex flex-col items-center">
                <div className="relative">
                    <Utensils className="w-16 h-16 text-kitchen-red transform -rotate-12 absolute -left-12 -top-4 opacity-20" />
                    <h1 className="text-6xl font-bold text-wood text-center tracking-tighter transform -rotate-2">
                        I'd <span className="text-kitchen-red underline decoration-wavy decoration-3">Eat</span> That!
                    </h1>
                    <Utensils className="w-16 h-16 text-kitchen-yellow transform rotate-12 absolute -right-12 -bottom-4 opacity-20" />
                </div>
                <p className="mt-4 text-kitchen-wood font-bold italic">A chaotic kitchen card game</p>
            </header>

            <main className="w-full max-w-6xl flex-1 flex flex-col items-center">
                {children}
            </main>

            <footer className="mt-12 text-kitchen-wood/50 text-sm italic">
                Exit through the pantry.
            </footer>
        </div>
    );
}
