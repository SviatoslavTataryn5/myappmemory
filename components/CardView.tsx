import React from 'react';
import { PlayingCard } from '../types';

interface CardViewProps {
  card: PlayingCard;
  onClick?: () => void;
  selected?: boolean;
  hidden?: boolean;
  small?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({ card, onClick, selected, hidden, small }) => {
  if (hidden) {
    return (
      <div 
        className={`
          ${small ? 'w-10 h-14' : 'w-20 h-28 sm:w-24 sm:h-36'} 
          bg-brand-900 border-2 border-brand-600 rounded-lg flex items-center justify-center shadow-lg
          background-pattern
        `}
      >
        <div className="w-full h-full bg-gradient-to-br from-brand-800 to-brand-950 opacity-50 rounded"></div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        relative bg-white rounded-lg shadow-md select-none transition-transform duration-200
        ${small ? 'w-10 h-14 text-xs' : 'w-20 h-28 sm:w-24 sm:h-36 text-xl sm:text-2xl'}
        ${selected ? 'ring-4 ring-yellow-400 scale-105 z-10' : 'hover:scale-105'}
        ${onClick ? 'cursor-pointer' : ''}
        flex flex-col justify-between p-1 sm:p-2
      `}
    >
      <div className={`font-bold ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'} leading-none`}>
        {card.rank}
        <div className="text-[0.6em]">{card.suit}</div>
      </div>
      
      <div className={`absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'} opacity-20 pointer-events-none`}>
        {card.suit}
      </div>

      <div className={`font-bold ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'} leading-none self-end rotate-180`}>
        {card.rank}
        <div className="text-[0.6em]">{card.suit}</div>
      </div>
    </div>
  );
};
