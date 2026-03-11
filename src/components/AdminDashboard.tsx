import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  Zap, 
  Map as MapIcon, 
  LayoutDashboard, 
  Users, 
  History, 
  MessageSquare, 
  Bell, 
  KeyRound, 
  Activity, 
  AlertCircle,
  LayoutGrid,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { UserRole, CheckInStatus } from '../constants';
import { FLOOR_INFO } from '../constants';
import { SeatDot } from './SeatDot';
import { LegendItem } from './LegendItem';
import { NavItem } from './NavItem';
import { AdminStatCard } from './AdminStatCard';

export const AdminDashboard = ({ 
  user, 
  stats, 
  seats, 
  onLogout,
  querys,
  respondToQuery,
  adminResponse,
  setAdminResponse,
  handleAdminVerify,
  adminOtpInput,
  setAdminOtpInput,
  adminSearch,
  setAdminSearch,
  terminalFeedback,
  selectedStudentId,
  setSelectedStudentId,
  activeFloor,
  setActiveFloor,
  bookingLogs,
  onSeatClick
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studentInfo, setStudentInfo] = useState(null);
  const activeBookings = seats.filter((s) => s.bookedBy);

  React.useEffect(() => {
    if (selectedStudentId) {
      fetch(`/api/users/${selectedStudentId}`)
        .then(res => res.json())
        .then(data => setStudentInfo(data))
        .catch(err => console.error("Failed to fetch student info", err));
    } else {
      setStudentInfo(null);
    }
  }, [selectedStudentId]);

  const filteredBookings = activeBookings.filter((s) => 
    s.bookedBy?.toLowerCase().includes(adminSearch.toLowerCase()) || 
    s.label.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const selectedStudentBooking = seats.find((s) => s.bookedBy === selectedStudentId);

  const pendingQuerysCount = querys.filter((q) => q.status === 'PENDING').length;

  return (
    <div className="flex min-h-screen bg-[#F8F9FD]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-zinc-100 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1A1D1F] leading-tight">Learning Center Admin</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SYSTEM CONTROL</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <NavItem icon={<MapIcon size={20} />} label="Floor Layout" active={activeTab === 'floor'} onClick={() => setActiveTab('floor')} />
            <NavItem icon={<Users size={20} />} label="Student Status" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
            <NavItem icon={<History size={20} />} label="Booking Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
            <NavItem icon={<MessageSquare size={20} />} label="Querys" active={activeTab === 'querys'} onClick={() => setActiveTab('querys')} badgeCount={pendingQuerysCount} />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-6">
          <div className="bg-[#F4F7FE] p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-zinc-400 font-bold border border-zinc-100">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1D1F]">{user.name}</p>
              <p className="text-[10px] text-zinc-400 font-medium">Administrator</p>
            </div>
          </div>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-3 text-red-500 font-bold text-sm px-4 py-2 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} className="rotate-180" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-12">
          <div className="flex items-center gap-4 bg-[#F4F7FE] px-6 py-2 rounded-2xl w-96">
            <Users size={18} className="text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search student or seat..." 
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium w-full"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#F4F7FE] flex items-center justify-center text-zinc-500">
                <Bell size={20} />
              </div>
              {pendingQuerysCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
                  {pendingQuerysCount}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-12 space-y-10">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-12 gap-8">
              {/* Entry Terminal */}
              <div className="col-span-4 bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                <AnimatePresence>
                  {terminalFeedback && (
                    <motion.div 
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -50, opacity: 0 }}
                      className={`absolute top-0 left-0 right-0 p-4 text-white font-bold text-xs ${terminalFeedback.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
                    >
                      {terminalFeedback.message}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <KeyRound size={40} />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1D1F] mb-2">Entry Terminal</h3>
                <p className="text-zinc-500 text-sm mb-8">Enter student OTP for library entry or exit verification.</p>
                
                <div className="w-full space-y-4">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="ENTER 6-DIGIT OTP"
                    value={adminOtpInput}
                    onChange={(e) => setAdminOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-6 bg-zinc-50 border border-zinc-100 rounded-2xl text-center text-3xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-blue-600/20 outline-none"
                  />
                  <button 
                    onClick={() => handleAdminVerify(adminOtpInput)}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    VERIFY ACCESS
                  </button>
                </div>
              </div>

              {/* Live Status Table */}
              <div className="col-span-8 bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-bold text-[#1A1D1F] flex items-center gap-3">
                    <Activity size={24} className="text-blue-600" /> Active Student Status
                  </h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {activeBookings.length} ACTIVE SESSIONS
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-zinc-100">
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Student</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Seat</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Status</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Booked At</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Vacate By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {filteredBookings.map((s) => {
                        const student = null; // MOCK_USERS usage removed
                        return (
                          <tr 
                            key={s.id} 
                            onClick={() => setSelectedStudentId(s.bookedBy || null)}
                            className="group hover:bg-zinc-50/50 transition-all cursor-pointer"
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${student?.gender === 'FEMALE' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>
                                  {student?.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#1A1D1F]">{student?.name}</p>
                                  <p className="text-[10px] text-zinc-400 font-medium">{student?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <span className="text-sm font-bold text-blue-600">F0{s.floor} - {s.label}</span>
                            </td>
                            <td className="py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                s.checkInStatus === CheckInStatus.CHECKED_IN ? 'bg-emerald-100 text-emerald-600' : 
                                s.checkInStatus === CheckInStatus.PENDING ? 'bg-amber-100 text-amber-600' : 
                                'bg-zinc-100 text-zinc-400'
                              }`}>
                                {s.checkInStatus}
                              </span>
                            </td>
                            <td className="py-4 text-center text-sm text-zinc-500 font-medium">
                              {s.bookedAt ? new Date(s.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </td>
                            <td className="py-4 text-right text-sm font-bold text-red-500">
                              {new Date(s.vacateBy || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-zinc-400 text-sm italic">No active bookings found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'floor' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex bg-zinc-100/50 p-2 rounded-[2.5rem] w-fit">
                  {FLOOR_INFO.map(f => (
                    <button 
                      key={f.level}
                      onClick={() => setActiveFloor(f.level)}
                      className={`px-10 py-4 rounded-[2rem] text-sm font-bold transition-all ${activeFloor === f.level ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                      FLOOR 0{f.level}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-6 bg-white p-3 px-6 rounded-full border border-zinc-100">
                  <LegendItem color="bg-zinc-200" label="OPEN" />
                  <LegendItem color="bg-learning-center-pink" label="F-RESERVED" />
                  <LegendItem color="bg-learning-center-blue" label="M-RESERVED" />
                  <LegendItem color="bg-zinc-300" label="ACTIVE" />
                </div>
              </div>

              <div className="bg-white rounded-[3rem] p-12 border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-4xl font-display font-bold tracking-tight flex items-center gap-4">
                      <div className="w-2 h-10 bg-blue-600 rounded-full" />
                      Live Floor Map
                    </h2>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mt-2">
                      {FLOOR_INFO.find(f => f.level === activeFloor)?.name} • {FLOOR_INFO.find(f => f.level === activeFloor)?.subtitle}
                    </p>
                  </div>
                </div>

                <div className={`grid ${activeFloor === 3 ? 'grid-cols-5' : 'grid-cols-4'} gap-6`}>
                  {activeFloor === 3 ? (
                    seats.filter(s => s.floor === 3).map(s => (
                      <div key={s.id} className="flex flex-col items-center gap-3 p-6 bg-zinc-50/50 rounded-3xl border border-zinc-100 hover:bg-white hover:shadow-lg transition-all group">
                        <div className="w-16 h-20 bg-white rounded-xl border border-dashed border-zinc-200 flex items-center justify-center group-hover:border-blue-600/30 transition-all">
                          <Lock size={20} className="text-zinc-300 group-hover:text-blue-600/40" />
                        </div>
                        <SeatDot seat={s} onClick={() => onSeatClick(s.id)} />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">CABIN {s.label.replace('C', '')}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      {Array.from(new Set(seats.filter(s => s.floor === activeFloor).map(s => s.clusterId))).map(clusterId => {
                        const clusterSeats = seats.filter(s => s.floor === activeFloor && s.clusterId === clusterId);
                        const half = Math.ceil(clusterSeats.length / 2);
                        const leftSeats = clusterSeats.slice(0, half);
                        const rightSeats = clusterSeats.slice(half);
                        
                        return (
                          <div key={clusterId} className="flex flex-col items-center justify-center gap-3 p-6 bg-zinc-50/50 rounded-[2.5rem] border border-zinc-100 hover:bg-white hover:shadow-lg transition-all group">
                            <div className="flex gap-3">
                              {leftSeats.map(s => <SeatDot key={s.id} seat={s} onClick={() => onSeatClick(s.id)} />)}
                            </div>
                            <div className="w-32 h-20 bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group-hover:border-blue-600/30 transition-all">
                              <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest mb-0.5">TABLE</span>
                              <span className="text-xl font-bold text-zinc-900">{clusterId}</span>
                            </div>
                            <div className="flex gap-3">
                              {rightSeats.map(s => <SeatDot key={s.id} seat={s} onClick={() => onSeatClick(s.id)} />)}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-bold text-[#1A1D1F] flex items-center gap-3">
                  <History size={24} className="text-blue-600" /> System Booking Logs
                </h3>
                <button className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all">
                  EXPORT CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-zinc-100">
                      <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Event ID</th>
                      <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Student</th>
                      <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Action</th>
                      <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Location</th>
                      <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {bookingLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-50/50 transition-all">
                        <td className="py-4 text-xs font-mono text-zinc-400">#{log.id}</td>
                        <td className="py-4">
                          <p className="text-sm font-bold text-[#1A1D1F]">{log.studentName}</p>
                          <p className="text-[10px] text-zinc-400 font-medium">ID: {log.studentId}</p>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            log.type === 'ENTRY' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="text-sm font-bold text-zinc-600">F0{log.floor} - {log.seatLabel}</span>
                        </td>
                        <td className="py-4 text-right text-sm text-zinc-500 font-medium">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {bookingLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-zinc-400 text-sm italic">No logs recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'querys' && (
            <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-[#1A1D1F] flex items-center gap-3">
                    <MessageSquare size={24} className="text-blue-600" /> Student Support Querys
                  </h3>
                  {pendingQuerysCount > 0 && (
                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                      {pendingQuerysCount} PENDING
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                {querys.map((q) => (
                  <div key={q.id} className="p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-400">
                          {q.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1A1D1F]">{q.studentName} <span className="text-zinc-400 font-normal ml-1">({q.studentId})</span></p>
                          <p className="text-[10px] text-zinc-400 font-medium">{new Date(q.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        q.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {q.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600 bg-white p-6 rounded-2xl border border-zinc-100">{q.message}</p>
                    
                    {q.status === 'PENDING' ? (
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          placeholder="Type your response..."
                          value={adminResponse[q.id] || ''}
                          onChange={(e) => setAdminResponse({ ...adminResponse, [q.id]: e.target.value })}
                          className="flex-1 p-4 bg-white border border-zinc-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                        />
                        <button 
                          onClick={() => respondToQuery(q.id)}
                          className="px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                        >
                          RESPOND
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">ADMIN RESPONSE</p>
                        <p className="text-sm text-emerald-700 italic">"{q.response}"</p>
                      </div>
                    )}
                  </div>
                ))}
                {querys.length === 0 && (
                  <div className="py-20 text-center text-zinc-400 text-sm italic">No support querys found.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-10">
              <div className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-bold text-[#1A1D1F] flex items-center gap-3">
                    <Users size={24} className="text-blue-600" /> Student Session Management
                  </h3>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {activeBookings.length} ACTIVE SESSIONS
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-zinc-100">
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Student</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Seat</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Status</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Booked At</th>
                        <th className="pb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Vacate By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {filteredBookings.map((s) => {
                        const student = null; // MOCK_USERS usage removed
                        return (
                          <tr 
                            key={s.id} 
                            onClick={() => setSelectedStudentId(s.bookedBy || null)}
                            className={`group hover:bg-zinc-50/50 transition-all cursor-pointer ${selectedStudentId === s.bookedBy ? 'bg-blue-50/50' : ''}`}
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${student?.gender === 'FEMALE' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>
                                  {student?.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#1A1D1F]">{student?.name}</p>
                                  <p className="text-[10px] text-zinc-400 font-medium">{student?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center">
                              <span className="text-sm font-bold text-blue-600">F0{s.floor} - {s.label}</span>
                            </td>
                            <td className="py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                s.checkInStatus === CheckInStatus.CHECKED_IN ? 'bg-emerald-100 text-emerald-600' : 
                                s.checkInStatus === CheckInStatus.PENDING ? 'bg-amber-100 text-amber-600' : 
                                'bg-zinc-100 text-zinc-400'
                              }`}>
                                {s.checkInStatus}
                              </span>
                            </td>
                            <td className="py-4 text-center text-sm text-zinc-500 font-medium">
                              {s.bookedAt ? new Date(s.bookedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </td>
                            <td className="py-4 text-right text-sm font-bold text-red-500">
                              {new Date(s.vacateBy || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-zinc-400 text-sm italic">No active bookings found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <AnimatePresence>
                {selectedStudentId && studentInfo && selectedStudentBooking && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-xl relative"
                  >
                    <button 
                      onClick={() => setSelectedStudentId(null)}
                      className="absolute top-8 right-8 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <AlertCircle size={24} className="rotate-45" />
                    </button>
                    
                    <div className="flex items-start gap-10">
                      <div className={`w-32 h-32 rounded-[2.5rem] flex items-center justify-center text-4xl font-bold ${studentInfo.gender === 'FEMALE' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>
                        {studentInfo.name.charAt(0)}
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-10">
                        <div className="col-span-2">
                          <h3 className="text-3xl font-bold text-[#1A1D1F] mb-2">{studentInfo.name}</h3>
                          <p className="text-zinc-500 font-medium mb-6">{studentInfo.email} • {studentInfo.gender}</p>
                          
                          <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="bg-zinc-50 p-6 rounded-3xl">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">STUDENT ID</p>
                              <p className="text-lg font-bold text-[#1A1D1F]">{studentInfo.studentId || 'N/A'}</p>
                            </div>
                            <div className="bg-zinc-50 p-6 rounded-3xl">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">DEPARTMENT</p>
                              <p className="text-lg font-bold text-[#1A1D1F]">{studentInfo.department || 'N/A'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="bg-zinc-50 p-6 rounded-3xl">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">CURRENT LOCATION</p>
                              <p className="text-lg font-bold text-blue-600">Floor 0{selectedStudentBooking.floor} - {selectedStudentBooking.label}</p>
                            </div>
                            <div className="bg-zinc-50 p-6 rounded-3xl">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">SESSION STATUS</p>
                              <p className="text-lg font-bold text-emerald-600">{selectedStudentBooking.checkInStatus}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-zinc-50 p-8 rounded-[2rem] space-y-6">
                          <h4 className="text-sm font-bold text-[#1A1D1F] border-b border-zinc-200 pb-4">Session Timeline</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Booked</span>
                              <span className="text-sm font-bold">{new Date(selectedStudentBooking.bookedAt || '').toLocaleTimeString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Entry</span>
                              <span className="text-sm font-bold">{selectedStudentBooking.entryTime ? new Date(selectedStudentBooking.entryTime).toLocaleTimeString() : '--:--'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Duration</span>
                              <span className="text-sm font-bold">{selectedStudentBooking.duration} Hours</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Deadline</span>
                              <span className="text-sm font-bold text-red-500">{new Date(selectedStudentBooking.vacateBy || '').toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-6 gap-6">
            <AdminStatCard label="TOTAL SEATS" value={stats.total} icon={<LayoutGrid size={20} />} color="blue" />
            <AdminStatCard label="AVAILABLE" value={stats.available} icon={<CheckCircle2 size={20} />} color="green" />
            <AdminStatCard label="BOOKED" value={stats.booked} icon={<ShieldCheck size={20} />} color="red" />
            <AdminStatCard label="ACTIVE NOW" value={activeBookings.filter((s) => s.checkInStatus === CheckInStatus.CHECKED_IN).length} icon={<Activity size={20} />} color="purple" />
            <AdminStatCard label="MAINTENANCE" value={stats.maintenance} icon={<AlertCircle size={20} />} color="gray" />
            <AdminStatCard label="TOTAL STUDENTS" value={0} icon={<Users size={20} />} color="orange" />
          </div>
        </div>
      </main>

      {/* Floating Notification Bubble for Admin */}
      {pendingQuerysCount > 0 && (
        <div className="fixed bottom-10 right-10 z-50">
          <button 
            onClick={() => setActiveTab('querys')}
            className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-2xl shadow-red-500/40 hover:scale-110 transition-transform relative group"
          >
            <MessageSquare size={28} fill="currentColor" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-red-600 rounded-full border-4 border-red-500 flex items-center justify-center text-xs font-black shadow-lg">
              {pendingQuerysCount}
            </div>
            
            {/* Tooltip */}
            <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-[#1A1D1F] text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
              {pendingQuerysCount} Pending Querys
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
