import React from 'react';
import { Avatar, SlaChip } from './UI';

const priorityColors = { Low: 'var(--primary)', Medium: 'var(--warning)', High: 'var(--danger)', Critical: '#ff2d6e' };
const statusClasses = { 'Pending': 'badge-pending', 'In Progress': 'badge-in-progress', 'Resolved': 'badge-resolved', 'Escalated': 'badge-escalated' };
const priorityIcons = { Low: '▽', Medium: '△', High: '▲', Critical: '⚠' };

export default function TicketCard({ ticket, onStatusChange, onDelete, isAdmin, onClick }) {
  const isEscalated = ticket.status === 'Escalated';

  return (
    <div
      className="glass animate-fade-in"
      onClick={() => onClick && onClick(ticket)}
      style={{
        padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem',
        height: '100%', cursor: 'pointer',
        borderLeft: isEscalated ? '3px solid var(--danger)' : undefined,
        background: isEscalated ? 'rgba(239,68,68,0.04)' : undefined,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            {isEscalated && <span style={{ fontSize: '0.7rem', background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700', fontFamily: 'var(--font-label)' }}>🚨 ESCALATED</span>}
            <SlaChip ticket={ticket} />
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ticket.title}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-label)', marginTop: '0.2rem' }}>
            <span style={{ color: 'var(--primary)' }}>{ticket.id}</span> · {new Date(ticket.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <span className={`badge ${statusClasses[ticket.status] || 'badge-pending'}`} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          {ticket.status}
        </span>
      </div>

      {/* Description */}
      {ticket.description && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {ticket.description}
        </p>
      )}

      {/* Location */}
      {ticket.location && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          📍 {ticket.location}
        </p>
      )}

      {/* Meta chips */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ background: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', border: '1px solid var(--surface-border)' }}>
          📁 {ticket.category}
        </span>
        <span style={{ background: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', border: '1px solid var(--surface-border)', color: priorityColors[ticket.priority], fontWeight: '700' }}>
          {priorityIcons[ticket.priority]} {ticket.priority}
        </span>
        {ticket.comments?.length > 0 && (
          <span style={{ background: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', border: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
            💬 {ticket.comments.length}
          </span>
        )}
        {ticket.rating && (
          <span style={{ background: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', border: '1px solid var(--surface-border)', color: 'var(--warning)' }}>
            ⭐ {ticket.rating}/5
          </span>
        )}
      </div>

      {/* Student info (admin) */}
      {isAdmin && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem', borderTop: '1px solid var(--surface-border)' }}>
          <Avatar initials={ticket.studentName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'} size={22} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.studentName || ticket.studentId}</span>
          {ticket.department && <span style={{ fontSize: '0.7rem', marginLeft: 'auto', color: 'var(--text-muted)' }}>→ {ticket.department?.split(' ')[0]}</span>}
        </div>
      )}

      {/* Admin action buttons */}
      {isAdmin && !['Resolved', 'Closed'].includes(ticket.status) && (
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '0.4rem' }}
          onClick={e => e.stopPropagation()}>
          {ticket.status === 'Pending' && (
            <button className="btn btn-outline" onClick={() => onStatusChange(ticket.id, 'In Progress')} style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem' }}>▶ Start</button>
          )}
          {(ticket.status === 'In Progress' || ticket.status === 'Escalated') && (
            <button className="btn btn-primary" onClick={() => onStatusChange(ticket.id, 'Resolved')} style={{ flex: 1, padding: '0.4rem', fontSize: '0.78rem', background: 'var(--secondary)', color: '#003824' }}>✓ Resolve</button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(ticket.id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '9999px', color: 'var(--danger)', padding: '0.4rem 0.7rem', cursor: 'pointer', fontSize: '0.78rem', transition: 'all 0.2s' }}>🗑</button>
          )}
        </div>
      )}
    </div>
  );
}
