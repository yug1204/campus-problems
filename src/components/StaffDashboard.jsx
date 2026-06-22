import React, { useState, useEffect } from 'react';
import { getTicketsByStaff, updateTicketStatus, addComment, runEscalationCheck, getAnnouncements } from '../utils/storage';
import TicketCard from './TicketCard';
import TicketModal from './TicketModal';
import { Avatar, EmptyState, FilterPills, Toast } from './UI';

export default function StaffDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      const updated = await runEscalationCheck();
      setTickets(updated.filter(t => t.assignedTo === user.id));
      setAnnouncements(await getAnnouncements());
    };
    load();
  }, []);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleStatus = async (id, newStatus) => {
    const all = await updateTicketStatus(id, newStatus, user.name);
    setTickets(all.filter(t => t.assignedTo === user.id));
    showToast(`Ticket marked as ${newStatus}`);
  };

  const filtered = tickets.filter(t => filter === 'All' || t.status === filter);
  const pending = tickets.filter(t => t.status === 'Pending').length;
  const inProgress = tickets.filter(t => ['In Progress', 'Escalated'].includes(t.status)).length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedTicket && (
        <TicketModal ticket={selectedTicket} user={user} isAdmin={false} isStaff={true}
          onClose={() => setSelectedTicket(null)}
          onTicketsUpdated={(all) => { setTickets(all.filter(t => t.assignedTo === user.id)); setSelectedTicket(null); }} />
      )}

      {/* Announcements */}
      {announcements.slice(0, 1).map(ann => (
        <div key={ann.id} style={{ background: ann.type === 'warning' ? 'rgba(245,158,11,0.07)' : 'rgba(59,130,246,0.07)', border: `1px solid ${ann.type === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`, borderLeft: `4px solid ${ann.type === 'warning' ? 'var(--warning)' : 'var(--primary)'}`, borderRadius: '10px', padding: '0.875rem 1.25rem', display: 'flex', gap: '0.75rem' }}>
          <span>{ann.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
          <div>
            <p style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.15rem' }}>{ann.title}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{ann.message}</p>
          </div>
        </div>
      ))}

      {/* Profile header */}
      <div className="glass" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Avatar initials={user.avatar} size={50} color="var(--warning)" />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.15rem' }}>My Work Queue 🔧</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-label)' }}>{user.name} · {user.department} · {user.specialization}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'To Do', value: pending, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Active', value: inProgress, color: 'var(--primary)', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Done', value: resolved, color: 'var(--secondary)', bg: 'rgba(16,185,129,0.1)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem 0.875rem', background: s.bg, borderRadius: '10px', border: `1px solid ${s.color}25` }}>
              <p style={{ fontSize: '1.3rem', fontWeight: '700', color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Assigned Tickets <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({filtered.length})</span></h3>
        <FilterPills options={['All', 'In Progress', 'Escalated', 'Pending', 'Resolved']} value={filter} onChange={setFilter} />
      </div>

      {/* Tickets */}
      {tickets.length === 0
        ? <EmptyState message="No tickets assigned to you yet. Check back later." icon="📥" />
        : filtered.length === 0
          ? <EmptyState message={`No "${filter}" tickets assigned to you.`} />
          : <div className="grid-cards">
              {filtered.map(t => (
                <TicketCard key={t.id} ticket={t} isAdmin={false} isStaff={true}
                  onStatusChange={handleStatus} onClick={setSelectedTicket} />
              ))}
            </div>
      }
    </div>
  );
}
