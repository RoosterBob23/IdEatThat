'use client';

import React from 'react';
import { X, HelpCircle } from 'lucide-react';
import RulesContent from './RulesContent';

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

                <RulesContent />

                <div className="mt-8 p-4 bg-kitchen-yellow/20 chaotic-border border-kitchen-yellow text-center font-bold italic">
                    "If you can't stand the heat, play a sabotage card!"
                </div>
            </div>
        </div>
    );
}
