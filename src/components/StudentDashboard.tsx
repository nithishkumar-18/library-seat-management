import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  LogOut, 
  Zap, 
  Armchair, 
  Lock, 
  Send, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { SeatStatus, SeatType, CheckInStatus } from '../constants';
import { FLOOR_INFO } from '../constants';
import { SeatDot } from './SeatDot';
import { LegendItem } from './LegendItem';

export const StudentDashboard = ({ 
  user, 
  seats, 
  activeFloor, 
  setActiveFloor, 
  onLogout, 
  onSeatClick, 
  myBooking,
  querys,
  submitQuery,
  newQuery,
  setNewQuery,
  bookingDuration,
  setBookingDuration,
  selectedSeat,
  setSelectedSeat,
  onConfirmBooking,
  markQueriesAsViewed
}) => {
  const [activeTab, setActiveTab] = useState('booking');

  const unviewedRepliesCount = querys.filter((q) => q.studentId === user.id && q.status === 'RESOLVED' && !q.viewed).length;

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-learning-center-purple text-white flex items-center justify-center shadow-lg shadow-learning-center-purple/20">
            <Zap size={20} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-display font-black tracking-tighter uppercase text-[#0a0c14]">LEARNING CENTER</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-white p-1.5 pr-6 rounded-2xl border border-zinc-100 shadow-sm">
            <div className="flex gap-1">
              <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${user.gender === 'MALE' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                {user.gender === 'MALE' ? 'BOY' : 'GIRL'}
              </div>
              <div className="px-2 py-1 rounded-lg bg-learning-center-purple/10 text-[8px] font-black text-learning-center-purple uppercase tracking-widest">STUDENT</div>
            </div>
            <div className="text-right">
              <p className="text-xs font-black leading-none uppercase tracking-tight">{user.name}</p>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
        </div>
      </header>

      <div className="flex items-center justify-between">
        <div className="flex bg-zinc-100/50 p-2 rounded-[2.5rem] w-fit">
          <button 
            onClick={() => setActiveTab('booking')}
            className={`px-10 py-4 rounded-[2rem] text-sm font-bold transition-all ${activeTab === 'booking' ? 'bg-white text-learning-center-purple shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            SEAT BOOKING
          </button>
          <button 
            onClick={() => {
              setActiveTab('querys');
              markQueriesAsViewed();
            }}
            className={`px-10 py-4 rounded-[2rem] text-sm font-bold transition-all relative ${activeTab === 'querys' ? 'bg-white text-learning-center-purple shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
          >
            SUPPORT & QUERYS
            {unviewedRepliesCount > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                {unviewedRepliesCount}
              </span>
            )}
          </button>
          <button className="px-10 py-4 rounded-[2rem] text-sm font-bold text-zinc-400 cursor-not-allowed">RESOURCE RACK</button>
        </div>

        {activeTab === 'booking' && !myBooking && (
          <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-zinc-100 shadow-sm">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-4">DURATION</span>
            <select 
              value={bookingDuration} 
              onChange={(e) => setBookingDuration(Number(e.target.value))}
              className="bg-zinc-50 border-none text-sm font-bold text-learning-center-purple rounded-2xl px-4 py-2 outline-none cursor-pointer"
            >
              <option value={1}>1 Hour</option>
              <option value={2}>2 Hours</option>
              <option value={4}>4 Hours</option>
              <option value={8}>8 Hours</option>
            </select>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'booking' ? (
          <motion.div 
            key="booking-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            <div className="lg:col-span-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FLOOR_INFO.map(f => (
                  <button 
                    key={f.level} 
                    onClick={() => setActiveFloor(f.level)}
                    className={`learning-center-card p-8 text-left relative overflow-hidden ${activeFloor === f.level ? 'learning-center-card-active' : ''}`}
                  >
                    <p className="text-[10px] font-bold text-learning-center-purple uppercase tracking-widest mb-2">FLOOR {f.level}</p>
                    <h3 className="text-xl font-bold mb-1">{f.name}</h3>
                    <p className="text-xs text-zinc-500">{f.subtitle}</p>
                    {activeFloor === f.level && <motion.div layoutId="activeFloor" className="absolute bottom-0 left-0 w-full h-1 bg-learning-center-purple" />}
                  </button>
                ))}
              </div>

              {myBooking && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-learning-center-purple rounded-[2rem] p-8 text-white flex items-center justify-between shadow-2xl shadow-learning-center-purple/20">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/10 border border-white/10 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">SEAT</span>
                      <span className="text-3xl font-black">{myBooking.label}</span>
                    </div>
                    <div>
                      <h3 className="text-3xl font-display font-black tracking-tight">Access Ready</h3>
                      <p className="text-white/60 text-sm font-medium">Kiosk verification required at Floor 0{myBooking.floor}</p>
                    </div>
                  </div>
                  <button onClick={() => onSeatClick(myBooking.id)} className="bg-white text-[#0a0c14] px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-xl">DISMISS PASS</button>
                </motion.div>
              )}

              <div className="learning-center-card p-10 relative">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-4xl font-display font-bold tracking-tight flex items-center gap-4">
                      <div className="w-2 h-10 bg-learning-center-purple rounded-full" />
                      System Floor View
                    </h2>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2">
                      {FLOOR_INFO.find(f => f.level === activeFloor)?.subtitle}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 bg-zinc-50 p-3 px-6 rounded-full border border-zinc-100">
                    <LegendItem color="bg-zinc-200" label="OPEN" />
                    <LegendItem color="bg-learning-center-pink" label="F-RESERVED" />
                    <LegendItem color="bg-learning-center-blue" label="M-RESERVED" />
                    <LegendItem color="bg-zinc-300" label="ACTIVE" />
                    <div className="w-px h-4 bg-zinc-200 mx-2" />
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-learning-center-purple animate-pulse" />
                      <span className="text-[10px] font-bold text-learning-center-purple tracking-widest">LIVE</span>
                    </div>
                  </div>
                </div>

                <div className={`grid ${activeFloor === 3 ? 'grid-cols-5' : 'grid-cols-4'} gap-4`}>
                  {activeFloor === 3 ? (
                    seats.filter(s => s.floor === 3).map(s => (
                      <div key={s.id} className="flex flex-col items-center gap-2 p-4 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                        <div className="w-12 h-14 bg-zinc-50 rounded-lg border border-dashed border-zinc-200 flex items-center justify-center group-hover:border-blue-600/30 transition-all">
                          <Lock size={16} className="text-zinc-300 group-hover:text-blue-600/40" />
                        </div>
                        <SeatDot seat={s} onClick={() => onSeatClick(s.id)} />
                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">CABIN {s.label.replace('C', '')}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      {Array.from(new Set(seats.filter(s => s.floor === activeFloor).map(s => s.clusterId))).map(clusterId => {
                        const clusterSeats = seats.filter(s => s.floor === activeFloor && s.clusterId === clusterId);
                        const half = Math.ceil(clusterSeats.length / 2);
                        const leftSeats = clusterSeats.slice(0, half);
                        const rightSeats = clusterSeats.slice(half);
                        const isReservedMale = clusterSeats.every(s => s.status === SeatStatus.RESERVED_MALE);
                        const isReservedFemale = clusterSeats.every(s => s.status === SeatStatus.RESERVED_FEMALE);
                        
                        return (
                          <div key={clusterId} className={`flex flex-col items-center justify-center ${activeFloor === 2 ? 'gap-1 p-2' : 'gap-2 p-4'} bg-zinc-50/50 rounded-3xl border border-zinc-100 hover:bg-white hover:shadow-lg hover:border-blue-600/20 transition-all group ${isReservedMale ? 'border-blue-100' : isReservedFemale ? 'border-pink-100' : ''}`}>
                            <div className="flex gap-2 mb-1">
                              {leftSeats.map(s => (
                                <SeatDot 
                                  key={s.id} 
                                  seat={s} 
                                  onClick={() => onSeatClick(s.id)} 
                                  small={activeFloor === 2} 
                                  isSelected={selectedSeat?.id === s.id}
                                  onBook={() => {
                                    onConfirmBooking(s.id);
                                    setSelectedSeat(null);
                                  }}
                                />
                              ))}
                            </div>
                            <div className={`${activeFloor === 2 ? 'w-24 h-16' : 'w-32 h-20'} bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group-hover:border-blue-600/30 transition-all`}>
                              <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 to-white opacity-50" />
                              <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-100/50" />
                              <div className="relative z-10 flex flex-col items-center">
                                <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest mb-0.5 group-hover:text-blue-600/40 transition-all">TABLE</span>
                                <span className={`${activeFloor === 2 ? 'text-sm' : 'text-lg'} font-bold text-zinc-900`}>{clusterId}</span>
                                {isReservedMale && <span className="text-[6px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">BOYS</span>}
                                {isReservedFemale && <span className="text-[6px] font-bold text-pink-500 uppercase tracking-widest mt-0.5">GIRLS</span>}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-1">
                              {rightSeats.map(s => (
                                <SeatDot 
                                  key={s.id} 
                                  seat={s} 
                                  onClick={() => onSeatClick(s.id)} 
                                  small={activeFloor === 2} 
                                  isSelected={selectedSeat?.id === s.id}
                                  onBook={() => {
                                    onConfirmBooking(s.id);
                                    setSelectedSeat(null);
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              {myBooking ? (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="learning-center-card bg-white overflow-hidden flex flex-col border-none shadow-2xl relative min-h-[750px]">
                  <div className="bg-[#0a0c14] p-8 pb-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-learning-center-purple uppercase tracking-[0.2em]">DIGITAL ACCESS KEY</p>
                        <h3 className="text-4xl font-display font-black tracking-tighter mt-1 text-white uppercase">STATION {myBooking.label}</h3>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                        <Lock size={20} className="text-white/40" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">LEVEL 0{myBooking.floor}</span>
                      <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                        {myBooking.type === SeatType.CABIN ? 'QUIET' : 'COLLABORATIVE'}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-4 bg-white">
                    <div className="absolute inset-x-0 top-0 h-px border-t border-dashed border-gray-100" />
                    <div className="absolute -left-3 -top-2 w-6 h-6 rounded-full bg-[#f8fafc]" />
                    <div className="absolute -right-3 -top-2 w-6 h-6 rounded-full bg-[#f8fafc]" />
                  </div>
                  <div className="p-8 pt-6 space-y-10 flex-1 bg-white">
                    <div className="flex justify-center">
                      <div className="bg-white p-6 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-50">
                        <QRCodeCanvas 
                          value={`LEARNING-CENTER-PASS-${myBooking.id}-${myBooking.otp}`} 
                          size={180} 
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    </div>
                    <div className="bg-learning-center-purple rounded-[2.5rem] p-8 space-y-5 shadow-2xl shadow-learning-center-purple/30">
                      <p className="text-center text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">VERIFICATION HASH (OTP)</p>
                      <div className="flex justify-center gap-2">
                        {myBooking.otp?.split('').map((n, i) => (
                          <div key={i} className="w-10 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
                            <span className="relative z-10">{n}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-center text-[8px] font-bold text-white/40 uppercase tracking-widest">VALID AT ENTRANCE KIOSKS ONLY</p>
                    </div>
                    <div className="grid grid-cols-2 gap-y-10 gap-x-4">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">AUTHORIZED STUDENT</p>
                        <p className="text-base font-black mt-1 text-[#0a0c14] uppercase tracking-tight">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">SPACE SECTOR</p>
                        <p className="text-sm font-bold mt-1 text-[#0a0c14] truncate">{FLOOR_INFO.find(f => f.level === myBooking.floor)?.name || 'Library Hall'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ALLOCATED AT</p>
                        <p className={`text-sm font-bold mt-1 ${myBooking.checkInStatus === CheckInStatus.CHECKED_IN ? 'text-[#0a0c14]' : 'text-amber-500'}`}>
                          {myBooking.checkInStatus === CheckInStatus.CHECKED_IN 
                            ? new Date(myBooking.entryTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'WAITING...'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">VACATE BY</p>
                        <p className="text-sm font-bold mt-1 text-learning-center-pink">
                          {new Date(myBooking.vacateBy || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : selectedSeat ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="learning-center-card p-10 bg-white shadow-2xl border-none flex flex-col space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-learning-center-purple/10 text-learning-center-purple flex items-center justify-center">
                      <Armchair size={28} />
                    </div>
                    <button onClick={() => setSelectedSeat(null)} className="text-zinc-400 hover:text-zinc-600 transition-all">
                      <LogOut size={20} className="rotate-90" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-learning-center-purple uppercase tracking-[0.2em]">BOOKING OPTION</p>
                    <h3 className="text-3xl font-black text-[#0a0c14]">STATION {selectedSeat.label}</h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-zinc-100 text-[8px] font-black uppercase tracking-widest text-zinc-500">LEVEL 0{selectedSeat.floor}</span>
                      <span className="px-3 py-1 rounded-full bg-zinc-100 text-[8px] font-black uppercase tracking-widest text-zinc-500">{selectedSeat.type}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">DURATION</span>
                        <span className="text-sm font-bold text-zinc-900">{bookingDuration} HOURS</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="8" 
                        value={bookingDuration}
                        onChange={(e) => setBookingDuration(parseInt(e.target.value))}
                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-learning-center-purple"
                      />
                      <div className="flex justify-between text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                        <span>1 HR</span>
                        <span>8 HRS</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        onConfirmBooking(selectedSeat.id);
                        setSelectedSeat(null);
                      }}
                      className="w-full py-6 bg-learning-center-purple text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-learning-center-purple/30 hover:bg-learning-center-dark transition-all active:scale-95"
                    >
                      BOOK THIS SEAT
                    </button>
                    <p className="text-[9px] text-center text-zinc-400 font-bold uppercase tracking-widest">Click the button above to finalize your booking</p>
                  </div>
                </motion.div>
              ) : (
                <div className="learning-center-card p-10 bg-zinc-50/50 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                    <Armchair size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">No Active Booking</h3>
                    <p className="text-xs text-zinc-500 max-w-[200px] mx-auto mt-1">Select a seat from the floor map to start your session.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="querys-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            <div className="lg:col-span-4 space-y-6">
              <div className="learning-center-card p-10 bg-white shadow-sm">
                <h3 className="text-2xl font-bold mb-6">Submit a Query</h3>
                <form onSubmit={submitQuery} className="space-y-6">
                  <div className="relative">
                    <textarea 
                      value={newQuery}
                      onChange={(e) => setNewQuery(e.target.value)}
                      placeholder="How can we help you today?"
                      className="w-full p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-sm focus:ring-2 focus:ring-learning-center-purple/20 outline-none transition-all resize-none h-48"
                    />
                    <button type="submit" className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-learning-center-purple text-white flex items-center justify-center hover:bg-learning-center-dark transition-all shadow-lg">
                      <Send size={20} />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest text-center">Our team usually responds within 15 minutes.</p>
                </form>
              </div>

              <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Zap size={20} fill="currentColor" />
                  </div>
                  <h4 className="font-bold text-blue-900">Quick Support</h4>
                </div>
                <p className="text-sm text-blue-700 leading-relaxed">For immediate assistance regarding seat malfunctions or entry issues, please visit the main reception desk.</p>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="learning-center-card p-10 bg-white shadow-sm min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-bold">YOUR QUERY HISTORY</h3>
                  <div className="px-4 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold">
                    {querys.filter((q) => q.studentId === user.id).length} TOTAL
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                  {querys.filter((q) => q.studentId === user.id).map((q) => (
                    <div key={q.id} className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-zinc-900">{q.message}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{new Date(q.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest ${q.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {q.status}
                        </span>
                      </div>
                      {q.response && (
                        <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm">
                          <p className="text-[10px] font-black text-learning-center-purple uppercase tracking-widest mb-2">ADMIN RESPONSE</p>
                          <p className="text-sm text-zinc-600 italic leading-relaxed">"{q.response}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {querys.filter((q) => q.studentId === user.id).length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40 py-20">
                      <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center">
                        <MessageSquare size={40} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-bold">No Querys Yet</p>
                        <p className="text-sm max-w-[240px] mx-auto">Your support history will appear here once you submit a query.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Floating Action Button */}
      <div className="fixed bottom-10 right-10 z-50">
        <button className="w-16 h-16 rounded-full bg-learning-center-purple text-white flex items-center justify-center shadow-2xl shadow-learning-center-purple/40 hover:scale-110 transition-transform">
          <Zap size={28} fill="currentColor" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-learning-center-pink rounded-full border-2 border-white" />
        </button>
      </div>
    </div>
  );
};
