import React from 'react';
import { getSlaStatus } from '../utils/storage';

// ── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ initials, size = 32, color = 'var(--primary)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, var(--secondary))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: '700', fontSize: size * 0.38, color: 'white',
      flexShrink: 0, letterSpacing: '-0.02em', userSelect: 'none',
    }}>{initials}</div>
  );
}

// ── StatBadge ────────────────────────────────────────────────────────────────
export function StatBadge({ label, value, color, sub }) {
  return (
    <div className="glass" style={{ padding: '1.25rem', textAlign: 'center', borderTop: `3px solid ${color}` }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-label)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{label}</p>
      <p style={{ fontSize: '2rem', fontWeight: '700', color }}>{value}</p>
      {sub && <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.2rem' }}>{sub}</p>}
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ message, icon = '📭' }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
      <p style={{ fontSize: '0.9rem' }}>{message}</p>
    </div>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  const colors = { success: 'var(--secondary)', error: 'var(--danger)', info: 'var(--primary)', warning: 'var(--warning)' };
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
      background: 'rgba(11,19,38,0.97)', border: `1px solid ${colors[type]}40`,
      borderLeft: `4px solid ${colors[type]}`,
      borderRadius: '12px', padding: '1rem 1.25rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      animation: 'fadeIn 0.3s ease-out', minWidth: '280px', maxWidth: '380px',
    }}>
      <span style={{ color: colors[type], fontSize: '1rem', fontWeight: '700' }}>{icons[type]}</span>
      <span style={{ flex: 1, fontSize: '0.875rem' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: 0, lineHeight: 1 }}>✕</button>
    </div>
  );
}

// ── FilterPills ──────────────────────────────────────────────────────────────
export function FilterPills({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          style={{
            padding: '0.3rem 0.8rem', borderRadius: '9999px', border: '1px solid',
            borderColor: value === opt ? 'var(--primary)' : 'var(--surface-border)',
            background: value === opt ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
            color: value === opt ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600',
            fontFamily: 'var(--font-label)', transition: 'all 0.18s',
          }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

// ── SLA Chip (on ticket card) ────────────────────────────────────────────────
export function SlaChip({ ticket }) {
  const sla = getSlaStatus(ticket);
  if (!sla) return null;
  return (
    <span style={{
      padding: '0.2rem 0.6rem', borderRadius: '9999px',
      fontSize: '0.68rem', fontFamily: 'var(--font-label)', fontWeight: '700',
      background: `${sla.color}18`, color: sla.color,
      border: `1px solid ${sla.color}40`, display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
    }}>
      {sla.status === 'breached' ? '🔴' : sla.status === 'critical' ? '🟡' : '🟢'} {sla.label}
    </span>
  );
}

// ── SLA Progress Bar (in modal) ───────────────────────────────────────────────
export function SlaBar({ ticket }) {
  const sla = getSlaStatus(ticket);
  if (!sla) return null;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.78rem' }}>
        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>SLA Status</span>
        <span style={{ color: sla.color, fontWeight: '700', fontFamily: 'var(--font-label)' }}>{sla.label}</span>
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${sla.pct}%`,
          background: sla.status === 'done' ? 'var(--secondary)' : sla.color,
          borderRadius: '9999px', transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

// ── Star Rating ──────────────────────────────────────────────────────────────
export function StarRating({ value, onChange, readonly = false }) {
  return (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onClick={() => !readonly && onChange && onChange(star)}
          style={{
            background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer',
            fontSize: '1.4rem', padding: '0.1rem',
            filter: star <= (value || 0) ? 'none' : 'grayscale(1) opacity(0.3)',
            transition: 'filter 0.15s, transform 0.15s',
            transform: !readonly && 'scale(1)',
          }}
          onMouseEnter={e => { if (!readonly) e.currentTarget.style.transform = 'scale(1.2)'; }}
          onMouseLeave={e => { if (!readonly) e.currentTarget.style.transform = 'scale(1)'; }}
        >⭐</button>
      ))}
    </div>
  );
}
