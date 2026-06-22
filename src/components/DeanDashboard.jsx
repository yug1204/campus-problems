import React, { useState, useEffect } from 'react';
import { getTickets, runEscalationCheck, getStats } from '../utils/storage';
import TicketCard from './TicketCard';
import TicketModal from './TicketModal';
import { Avatar, EmptyState, StatBadge, Toast } from './UI';

export default function DeanDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = async () => {
      const updated = await runEscalationCheck();
      setTickets(updated);
      setStats(await getStats());
    };
    load();
  }, []);

  const escalated = tickets.filter(t => t.status === 'Escalated');
  const highPriOpen = tickets.filter(t => t.priority === 'High' && !['Resolved', 'Closed'].includes(t.status));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedTicket && (
        <TicketModal ticket={selectedTicket} user={user} isAdmin={false} isDean={true}
          onClose={() => setSelectedTicket(null)}
          onTicketsUpdated={async (all) => { setTickets(all); setStats(await getStats()); setSelectedTicket(null); }} />
      )}

      {/* Dean Header */}
      <div className="glass" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Avatar initials={user.avatar} size={50} color="#8b5cf6" />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.15rem' }}>Dean Oversight Panel 🏛️</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-label)' }}>{user.name} · {user.title}</p>
        </div>
      </div>

      {/* Escalation Alert */}
      {escalated.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderLeft: '4px solid var(--danger)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
          <p style={{ fontWeight: '700', color: 'var(--danger)', fontSize: '1rem' }}>⚠️ {escalated.length} Escalated Ticket{escalated.length > 1 ? 's' : ''} Require Your Attention</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.3rem' }}>These issues exceeded their SLA deadlines. The responsible departments need to be held accountable. You can add remarks to any ticket below.</p>
        </div>
      )}

      {/* Campus-wide Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
        <StatBadge label="Total Open" value={(stats.pending || 0) + (stats.inProgress || 0)} color="var(--primary)" />
        <StatBadge label="Escalated" value={stats.escalated || 0} color="var(--danger)" sub="SLA breached" />
        <StatBadge label="High Priority" value={stats.highPriority || 0} color="var(--warning)" />
        <StatBadge label="Resolution Rate" value={`${stats.resolutionRate || 0}%`} color="var(--secondary)" />
        <StatBadge label="Avg Rating" value={stats.avgRating || '—'} color="var(--warning)" sub="student feedback" />
        <StatBadge label="This Week" value={stats.thisWeek || 0} color="var(--text-muted)" />
      </div>

      {/* Escalated tickets */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--danger)' }}>
          🚨 Escalated Issues ({escalated.length})
        </h3>
        {escalated.length === 0
          ? <EmptyState message="No escalated issues — all SLAs are being met! ✅" icon="✅" />
          : <div className="grid-cards">{escalated.map(t => <TicketCard key={t.id} ticket={t} isAdmin={false} isDean={true} onClick={setSelectedTicket} />)}</div>
        }
      </div>

      {/* High priority open */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
          ⚑ High Priority — Open ({highPriOpen.filter(t => t.status !== 'Escalated').length})
        </h3>
        {highPriOpen.filter(t => t.status !== 'Escalated').length === 0
          ? <EmptyState message="No high-priority open tickets." icon="✅" />
          : <div className="grid-cards">
              {highPriOpen.filter(t => t.status !== 'Escalated').map(t => <TicketCard key={t.id} ticket={t} isAdmin={false} isDean={true} onClick={setSelectedTicket} />)}
            </div>
        }
      </div>
    </div>
  );
}
