import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Armchair, Zap } from 'lucide-react';
import { SeatStatus } from '../constants';

interface SeatDotProps {
  key?: any;
  seat: any;
  onClick: () => void;
  small?: boolean;
  isSelected?: boolean;
  onBook?: () => void;
}

export const SeatDot: React.FC<SeatDotProps> = ({ seat, onClick, small, isSelected, onBook }) => {
  let color = 'bg-zinc-100 text-zinc-400';
  let iconColor = 'text-zinc-300';

  if (isSelected) {
    color = 'bg-learning-center-purple text-white shadow-lg shadow-learning-center-purple/30 ring-4 ring-learning-center-purple/20';
    iconColor = 'text-white/60';
  } else if (seat.status === SeatStatus.OCCUPIED) {
    color = 'bg-zinc-200 text-zinc-600';
    iconColor = 'text-zinc-400';
  } else if (seat.status === SeatStatus.RESERVED_FEMALE) {
    color = 'bg-pink-50 text-pink-600 border border-pink-100';
    iconColor = 'text-pink-300';
  } else if (seat.status === SeatStatus.RESERVED_MALE) {
    color = 'bg-blue-50 text-blue-600 border border-blue-100';
    iconColor = 'text-blue-300';
  }

  return (
    <div className="flex flex-col items-center gap-1 relative">
      <button 
        onClick={onClick} 
        className={`${small ? 'w-6 h-6' : 'w-8 h-8'} rounded-lg ${color} hover:scale-110 active:scale-95 shadow-sm transition-all flex flex-col items-center justify-center group relative`}
      >
        <Armchair size={small ? 8 : 10} className={`${iconColor} group-hover:text-current transition-colors mb-0.5`} />
        <span className={`font-bold ${small ? 'text-[6px]' : 'text-[8px]'}`}>{seat.label.replace('S', '').replace('C', '')}</span>
      </button>
      
      <AnimatePresence>
        {isSelected && onBook && (
          <motion.button 
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 bg-emerald-500 text-white text-[8px] px-3 py-1.5 rounded-full font-black shadow-xl hover:bg-emerald-600 transition-all whitespace-nowrap flex items-center gap-1 border-2 border-white"
          >
            <Zap size={8} fill="currentColor" />
            BOOK NOW
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
