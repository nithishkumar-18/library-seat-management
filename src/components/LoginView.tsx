import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Library, User as UserIcon, Lock, AlertCircle, ShieldCheck, Zap } from 'lucide-react';
import { UserRole } from '../constants';

export const LoginView = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState(UserRole.STUDENT);
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!userId || !password) {
      setError(`Please enter both ${role === UserRole.STUDENT ? 'Student ID' : 'Admin ID'} and password`);
      return;
    }

    if (isRegistering) {
      if (!name) {
        setError('Please enter your full name');
        return;
      }
      if (role === UserRole.STUDENT && !gender) {
        setError('Please select your gender');
        return;
      }

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: userId, 
            name, 
            password, 
            role, 
            gender: role === UserRole.STUDENT ? gender : null,
            studentId: role === UserRole.STUDENT ? userId : null,
            adminId: role === UserRole.ADMIN ? userId : null
          })
        });
        
        if (res.ok) {
          setSuccessMsg('Registration successful! You can now login.');
          setIsRegistering(false);
          setPassword('');
        } else {
          const data = await res.json();
          setError(data.error || 'Registration failed');
        }
      } catch (err) {
        setError('An error occurred during registration');
      }
    } else {
      const success = await onLogin(userId, password, role);
      if (!success) {
        // Error is handled in onLogin/App.tsx alert, but we can set local error too
        setError('Invalid credentials');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F9FD]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-learning-center-purple/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-white shadow-2xl shadow-learning-center-purple/10 mb-6 border border-zinc-100">
            <Library size={40} className="text-learning-center-purple" />
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter text-[#1A1D1F] uppercase">Learning Center Portal</h1>
          <p className="text-zinc-500 mt-2 font-medium">Intelligent Library Management System</p>
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-zinc-200/50 border border-zinc-100">
          {/* Role Switcher */}
          <div className="flex bg-zinc-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => { setRole(UserRole.STUDENT); setGender(''); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === UserRole.STUDENT ? 'bg-white text-learning-center-purple shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Student
            </button>
            <button 
              onClick={() => { setRole(UserRole.ADMIN); setGender(''); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${role === UserRole.ADMIN ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Administrator
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-learning-center-purple/20 transition-all font-medium"
                  />
                  <UserIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                {role === UserRole.STUDENT ? 'Student ID' : 'Admin ID'}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={role === UserRole.STUDENT ? "e.g. 23CS101" : "e.g. ADMIN001"}
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-learning-center-purple/20 transition-all font-medium"
                />
                <UserIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-learning-center-purple/20 transition-all font-medium"
                />
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300" />
              </div>
            </div>

            {role === UserRole.STUDENT && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Gender</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setGender('MALE')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${gender === 'MALE' ? 'bg-learning-center-purple/10 border-learning-center-purple text-learning-center-purple' : 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}
                  >
                    Male
                  </button>
                  <button 
                    type="button"
                    onClick={() => setGender('FEMALE')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${gender === 'FEMALE' ? 'bg-learning-center-purple/10 border-learning-center-purple text-learning-center-purple' : 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}
                  >
                    Female
                  </button>
                </div>
              </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-600 text-xs font-bold"
              >
                <ShieldCheck size={16} />
                {successMsg}
              </motion.div>
            )}

            <button 
              type="submit" 
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all shadow-xl ${role === UserRole.STUDENT ? 'bg-learning-center-purple hover:bg-learning-center-dark shadow-learning-center-purple/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
            >
              {isRegistering ? 'Create Account' : 'Enter Portal'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-50 text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              {isRegistering ? 'Already have an account?' : 'New to the portal?'} 
              <span 
                onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccessMsg(''); }}
                className="text-learning-center-purple cursor-pointer hover:underline ml-1"
              >
                {isRegistering ? 'Login Now' : 'Register Here'}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8">
          <div className="flex items-center gap-2 text-zinc-400">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Secure Access</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Zap size={14} />
            <span className="text-[9px] font-bold uppercase tracking-widest">v2.4.0 Stable</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
