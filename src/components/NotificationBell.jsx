import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, getUnreadCount, markAllRead } from '../utils/storage';

const TYPE_ICONS = {
  resolved: '✅',
  escalation: '🚨',
  comment: '💬',
  assigned: '👤',
  status_change: '🔄',
};

const TYPE_COLORS = {
  resolved: 'var(--secondary)',
  escalation: 'var(--danger)',
  comment: 'var(--primary)',
  assigned: 'var(--warning)',
  status_change: 'var(--primary)',
};

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    setNotifications(await getNotifications(userId));
    setUnread(await getUnreadCount(userId));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen(o => !o);
    if (!open && unread > 0) {
      await markAllRead(userId);
      setUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        style={{
          background: open ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? 'rgba(59,130,246,0.4)' : 'var(--surface-border)'}`,
          borderRadius: '10px', width: '38px', height: '38px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
          fontSize: '1rem',
        }}
        title="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: 'var(--danger)', color: 'white',
            borderRadius: '50%', width: '18px', height: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.65rem', fontWeight: '800', fontFamily: 'var(--font-label)',
            animation: 'pulse 1.5s ease infinite',
            border: '2px solid var(--bg-base)',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: '340px', background: 'rgba(11,19,43,0.97)',
          border: '1px solid var(--surface-border)', borderRadius: '14px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)',
          zIndex: 500, overflow: 'hidden',
        }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>Notifications</p>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{notifications.length} total</span>
          </div>

          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔔</div>
                <p>No notifications yet</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} style={{
                padding: '0.875rem 1.25rem',
                background: n.read ? 'transparent' : 'rgba(59,130,246,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                transition: 'background 0.2s',
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${TYPE_COLORS[n.type]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', flexShrink: 0 }}>
                  {TYPE_ICONS[n.type] || '📋'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8rem', lineHeight: 1.4, color: n.read ? 'var(--text-muted)' : 'var(--text-main)', marginBottom: '0.2rem' }}>{n.message}</p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>
                    {new Date(n.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '4px' }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
