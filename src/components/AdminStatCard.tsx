import React from 'react';

export const AdminStatCard = ({ label, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-zinc-100 text-zinc-500',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative group hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center transition-all`}>
          {icon}
        </div>
        <div className="text-zinc-100 group-hover:text-zinc-200 transition-all">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg>
        </div>
      </div>
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
      <p className="text-4xl font-bold mt-2 text-[#1A1D1F]">{value}</p>
    </div>
  );
};
