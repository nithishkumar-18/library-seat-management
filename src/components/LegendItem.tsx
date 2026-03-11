import React from 'react';

export const LegendItem = ({ color, label }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-[10px] font-bold text-zinc-500 tracking-widest">{label}</span>
    </div>
  );
};
