import React, { useState } from 'react';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import DeanDashboard from './components/DeanDashboard';
import Login from './components/Login';
import NotificationBell from './components/NotificationBell';
import { Avatar } from './components/UI';

const ROLE_COLORS = { student: 'var(--primary)', admin: 'var(--warning)', staff: '#f97316', dean: '#8b5cf6' };
const ROLE_LABELS = { student: 'Student Portal', admin: 'Admin Portal', staff: 'Staff Portal', dean: 'Dean Portal' };

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (user) => {
    // clear localStorage to get fresh demo data on first load
    if (!localStorage.getItem('campus_tickets')) {
      localStorage.removeItem('campus_tickets');
      localStorage.removeItem('campus_users');
      localStorage.removeItem('campus_announcements');
    }
    setUser(user);
  };

  const handleLogout = () => setUser(null);

  const renderDashboard = () => {
    if (!user) return null;
    switch (user.role) {
      case 'student': return <StudentDashboard user={user} />;
      case 'admin':   return <AdminDashboard user={user} />;
      case 'staff':   return <StaffDashboard user={user} />;
      case 'dean':    return <DeanDashboard user={user} />;
      default: return <StudentDashboard user={user} />;
    }
  };

  return (
    <div>
      <nav className="glass navbar">
        {/* Logo + subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.3rem', color: 'white', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>C</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1 }}>Campus Solver</h1>
            {user && (
              <p style={{ margin: 0, fontSize: '0.68rem', color: ROLE_COLORS[user.role], fontFamily: 'var(--font-label)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {ROLE_LABELS[user.role]}
              </p>
            )}
          </div>
        </div>

        {/* Right side user info */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {['student', 'staff'].includes(user.role) && <NotificationBell userId={user.id} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Avatar initials={user.avatar} size={34} color={ROLE_COLORS[user.role]} />
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', lineHeight: 1.2 }}>{user.name}</p>
                <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{user.id}</p>
              </div>
            </div>
            <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}>
              Sign Out
            </button>
          </div>

        )}
      </nav>

      <main className="container animate-fade-in">
        {!user ? <Login onLogin={handleLogin} /> : renderDashboard()}
      </main>
    </div>
  );
}

export default App;
