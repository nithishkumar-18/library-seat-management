/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, SeatStatus } from './constants';
import { INITIAL_SEATS } from './constants';
import { LoginView } from './components/LoginView';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [seats, setSeats] = useState(INITIAL_SEATS);
  const [querys, setQuerys] = useState([]);
  const [activeFloor, setActiveFloor] = useState(1);
  const [newQuery, setNewQuery] = useState('');
  const [adminResponse, setAdminResponse] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingDuration, setBookingDuration] = useState(2); // Default 2 hours
  const [adminOtpInput, setAdminOtpInput] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [terminalFeedback, setTerminalFeedback] = useState(null);
  const [bookingLogs, setBookingLogs] = useState([]);

  const fetchSeats = async () => {
    try {
      const res = await fetch('/api/seats');
      const data = await res.json();
      setSeats(data);
    } catch (err) {
      console.error("Failed to fetch seats", err);
    }
  };

  const fetchQueries = async () => {
    try {
      const res = await fetch('/api/queries');
      const data = await res.json();
      setQuerys(data);
    } catch (err) {
      console.error("Failed to fetch queries", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setBookingLogs(data);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  useEffect(() => {
    fetchSeats();
    fetchQueries();
    fetchLogs();
    
    const savedUser = localStorage.getItem('lib_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchSeats();
      fetchQueries();
      fetchLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (id, password, role) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password, role })
      });
      
      if (res.ok) {
        const foundUser = await res.json();
        setUser(foundUser);
        localStorage.setItem('lib_user', JSON.stringify(foundUser));
        return true;
      } else {
        const data = await res.json();
        alert(data.error || "Login failed");
        return false;
      }
    } catch (err) {
      console.error("Login error", err);
      alert("An error occurred during login");
      return false;
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lib_user');
  };

  const toggleSeatStatus = async (seatId) => {
    if (!user) return;
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    if (user.role === UserRole.ADMIN) {
      // Admin maintenance toggle - can be implemented if needed
    } else {
      if (seat.status === SeatStatus.AVAILABLE || seat.status === SeatStatus.RESERVED_FEMALE || seat.status === SeatStatus.RESERVED_MALE) {
        const existing = seats.find(s => s.bookedBy === user.id);
        if (existing) {
          alert("You already have an active booking.");
          return;
        }
        
        // Gender enforcement
        if (seat.status === SeatStatus.RESERVED_FEMALE && user.gender !== 'FEMALE') {
          alert("This table is reserved for girls only.");
          return;
        }
        if (seat.status === SeatStatus.RESERVED_MALE && user.gender !== 'MALE') {
          alert("This table is reserved for boys only.");
          return;
        }

        try {
          const res = await fetch('/api/seats/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seatId, userId: user.id, duration: bookingDuration })
          });
          if (res.ok) {
            fetchSeats();
          } else {
            const data = await res.json();
            alert(data.error || "Booking failed");
          }
        } catch (err) {
          console.error("Booking failed", err);
        }
      } else if (seat.status === SeatStatus.OCCUPIED && seat.bookedBy === user.id) {
        try {
          const res = await fetch('/api/seats/vacate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seatId, userId: user.id })
          });
          if (res.ok) {
            fetchSeats();
          }
        } catch (err) {
          console.error("Vacate failed", err);
        }
      }
    }
  };

  const handleAdminVerify = async (otp) => {
    const cleanOtp = otp.trim();
    try {
      const res = await fetch('/api/seats/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: cleanOtp })
      });
      const data = await res.json();
      if (res.ok) {
        setTerminalFeedback({ type: 'success', message: data.message });
        fetchSeats();
        fetchLogs();
      } else {
        setTerminalFeedback({ type: 'error', message: data.error || 'Invalid OTP' });
      }
    } catch (err) {
      setTerminalFeedback({ type: 'error', message: 'Verification failed' });
    }
    setAdminOtpInput('');
    setTimeout(() => setTerminalFeedback(null), 3000);
  };

  const submitQuery = async (e) => {
    e.preventDefault();
    if (!user || !newQuery.trim()) return;
    
    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: user.id, 
          studentName: user.name, 
          message: newQuery 
        })
      });
      if (res.ok) {
        setNewQuery('');
        fetchQueries();
      }
    } catch (err) {
      console.error("Query submission failed", err);
    }
  };

  const respondToQuery = async (queryId) => {
    const responseText = adminResponse[queryId];
    if (!responseText?.trim()) return;

    try {
      const res = await fetch('/api/queries/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId, response: responseText })
      });
      if (res.ok) {
        setAdminResponse(prev => {
          const next = { ...prev };
          delete next[queryId];
          return next;
        });
        fetchQueries();
      }
    } catch (err) {
      console.error("Response failed", err);
    }
  };

  const markQueriesAsViewed = async () => {
    if (!user || user.role !== UserRole.STUDENT) return;
    try {
      await fetch('/api/queries/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id })
      });
      fetchQueries();
    } catch (err) {
      console.error("Failed to mark queries as viewed", err);
    }
  };

  const handleSeatClick = (seatId) => {
    if (!user) return;
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    if (user.role === UserRole.ADMIN) {
      toggleSeatStatus(seatId);
    } else {
      if (seat.status === SeatStatus.OCCUPIED && seat.bookedBy === user.id) {
        toggleSeatStatus(seatId);
        return;
      }
      
      if (seat.status === SeatStatus.AVAILABLE || 
          (seat.status === SeatStatus.RESERVED_FEMALE && user.gender === 'FEMALE') ||
          (seat.status === SeatStatus.RESERVED_MALE && user.gender === 'MALE')) {
        setSelectedSeat(seat);
      } else {
        if (seat.status === SeatStatus.RESERVED_FEMALE && user.gender !== 'FEMALE') {
          alert("This table is reserved for girls only.");
        } else if (seat.status === SeatStatus.RESERVED_MALE && user.gender !== 'MALE') {
          alert("This table is reserved for boys only.");
        }
      }
    }
  };

  const myBooking = useMemo(() => seats.find(s => s.bookedBy === user?.id), [seats, user]);
  const stats = useMemo(() => ({
    total: seats.length,
    available: seats.filter(s => s.status === SeatStatus.AVAILABLE).length,
    booked: seats.filter(s => s.status === SeatStatus.OCCUPIED).length,
    maintenance: seats.filter(s => s.status === SeatStatus.MAINTENANCE).length,
  }), [seats]);

  if (!user) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-learning-center-bg font-sans text-learning-center-dark">
      {user.role === UserRole.ADMIN ? (
        <AdminDashboard 
          user={user} 
          stats={stats} 
          seats={seats} 
          onLogout={handleLogout}
          querys={querys}
          respondToQuery={respondToQuery}
          adminResponse={adminResponse}
          setAdminResponse={setAdminResponse}
          handleAdminVerify={handleAdminVerify}
          adminOtpInput={adminOtpInput}
          setAdminOtpInput={setAdminOtpInput}
          adminSearch={adminSearch}
          setAdminSearch={setAdminSearch}
          terminalFeedback={terminalFeedback}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          activeFloor={activeFloor}
          setActiveFloor={setActiveFloor}
          bookingLogs={bookingLogs}
          onSeatClick={handleSeatClick}
        />
      ) : (
        <StudentDashboard 
          user={user} 
          seats={seats} 
          activeFloor={activeFloor} 
          setActiveFloor={setActiveFloor} 
          onLogout={handleLogout} 
          onSeatClick={handleSeatClick}
          myBooking={myBooking}
          querys={querys}
          submitQuery={submitQuery}
          newQuery={newQuery}
          setNewQuery={setNewQuery}
          bookingDuration={bookingDuration}
          setBookingDuration={setBookingDuration}
          selectedSeat={selectedSeat}
          setSelectedSeat={setSelectedSeat}
          onConfirmBooking={toggleSeatStatus}
          markQueriesAsViewed={markQueriesAsViewed}
        />
      )}
    </div>
  );
}
