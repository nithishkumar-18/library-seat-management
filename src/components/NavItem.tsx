import React from 'react';

export const NavItem = ({ icon, label, active = false, onClick, badgeCount = 0 }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all relative ${active ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20' : 'text-zinc-500 hover:bg-zinc-50'}`}
    >
      {icon} 
      <span className="flex-1 text-left">{label}</span>
      {badgeCount > 0 && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
          {badgeCount}
        </span>
      )}
    </button>
  );
};
