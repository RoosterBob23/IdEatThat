'use client';

import React from 'react';
import { Card as CardType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChefHat, Flame, Sparkles } from 'lucide-react';

interface CardProps {
    card: CardType;
    selected?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    revealed?: boolean;
}

export default function Card({ card, selected, onClick, disabled, className, revealed = true }: CardProps) {
    const isFood = card.type === 'Food';
    const isSabotage = card.type === 'Sabotage';
    const isTheme = card.type === 'Theme';

    if (!revealed) {
        return (
            <div
                className={cn(
                    "w-32 h-44 bg-kitchen-wood chaotic-border flex items-center justify-center text-white p-4 text-center",
                    className
                )}
            >
                <div className="border-2 border-white/20 p-2 rounded-full">
                    <ChefHat className="w-12 h-12" />
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "w-32 h-44 bg-white chaotic-border kitchen-shadow p-3 flex flex-col items-center justify-between transition-all card-vibe relative",
                selected && "border-kitchen-red ring-4 ring-kitchen-red/20 -translate-y-4",
                disabled && "opacity-50 grayscale cursor-not-allowed",
                isFood && "bg-white",
                isSabotage && "bg-kitchen-red/10 border-kitchen-red",
                isTheme && "bg-kitchen-yellow/10 border-kitchen-yellow",
                className
            )}
        >
            <div className="w-full flex justify-between items-start opacity-30">
                {isFood && <Sparkles size={12} />}
                {isSabotage && <Flame size={12} />}
                {isTheme && < ChefHat size={12} />}
            </div>

            <span className={cn(
                "text-center font-bold text-sm leading-tight uppercase",
                isSabotage && "text-kitchen-red",
                isTheme && "text-kitchen-yellow"
            )}>
                {card.name}
            </span>

            <div className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                isFood && "bg-kitchen-green/20 text-kitchen-green",
                isSabotage && "bg-kitchen-red text-white",
                isTheme && "bg-kitchen-yellow text-kitchen-wood"
            )}>
                {card.type}
            </div>
        </button>
    );
}
