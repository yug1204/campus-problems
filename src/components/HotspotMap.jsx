import React, { useState } from 'react';
import { getHotspotData } from '../utils/storage';

const TYPE_COLORS_MAP = {
  Academic: { base: '#3b82f6', light: 'rgba(59,130,246,0.12)' },
  Facility: { base: '#8b5cf6', light: 'rgba(139,92,246,0.12)' },
  Hostel:   { base: '#f97316', light: 'rgba(249,115,22,0.12)' },
  Security: { base: '#ef4444', light: 'rgba(239,68,68,0.12)' },
};

const getHeatColor = (count, max) => {
  if (count === 0) return { bg: 'rgba(255,255,255,0.03)', border: 'var(--surface-border)', text: 'var(--text-muted)' };
  const intensity = count / Math.max(max, 1);
  if (intensity >= 0.7) return { bg: 'rgba(239,68,68,0.18)', border: 'rgba(239,68,68,0.5)', text: 'var(--danger)' };
  if (intensity >= 0.4) return { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.45)', text: 'var(--warning)' };
  return { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.35)', text: 'var(--primary)' };
};

export default function HotspotMap() {
  const [hotspots, setHotspots] = useState([]);
  const [selected, setSelected] = useState(null);

  React.useEffect(() => {
    getHotspotData().then(setHotspots);
  }, []);

  const maxCount = Math.max(...hotspots.map(h => h.count), 1);
  const rows = [0, 1, 2];
  const cols = [0, 1, 2, 3];
  const rowLabels = ['Academic Block', 'Central Campus', 'Hostel Zone'];

  return (
    <div className="glass" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.25rem' }}>🗺️ Campus Complaint Hotspot Map</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Open tickets per campus zone — click a zone to see details</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { color: 'rgba(59,130,246,0.5)', label: 'Low (1)' },
            { color: 'rgba(245,158,11,0.6)', label: 'Medium (2–3)' },
            { color: 'rgba(239,68,68,0.6)', label: 'High (4+)' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Map */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* Row labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'space-around', paddingTop: '0.5rem' }}>
          {rowLabels.map(l => (
            <div key={l} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em', height: '90px', display: 'flex', alignItems: 'center' }}>{l}</div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, 90px)', gap: '0.5rem' }}>
          {hotspots.map(zone => {
            const heat = getHeatColor(zone.count, maxCount);
            const isSelected = selected?.id === zone.id;
            return (
              <div
                key={zone.id}
                onClick={() => setSelected(isSelected ? null : zone)}
                style={{
                  background: isSelected ? `${heat.bg.replace('0.1', '0.2').replace('0.18', '0.3')}` : heat.bg,
                  border: `2px solid ${isSelected ? heat.text : heat.border}`,
                  borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.25rem', transition: 'all 0.2s',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: isSelected ? `0 4px 20px ${heat.border}` : 'none',
                }}
              >
                <p style={{ fontSize: '1.5rem', fontWeight: '800', color: zone.count === 0 ? 'var(--text-muted)' : heat.text, lineHeight: 1 }}>
                  {zone.count === 0 ? '—' : zone.count}
                </p>
                <p style={{ fontSize: '0.7rem', fontWeight: '600', color: zone.count === 0 ? 'var(--text-muted)' : heat.text, textAlign: 'center', lineHeight: 1.2, padding: '0 0.25rem' }}>{zone.name}</p>
                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{zone.type}</p>
                {zone.count > 0 && (
                  <div style={{
                    position: 'absolute', top: '6px', right: '8px',
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: heat.text, opacity: 0.7,
                    animation: 'pulse 2s ease infinite'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel for selected zone */}
      {selected && (
        <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{selected.name} — {selected.count} open ticket{selected.count !== 1 ? 's' : ''}</p>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
          {selected.tickets.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>✅ No open complaints in this zone.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selected.tickets.map(t => (
                <div key={t.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ fontFamily: 'var(--font-label)', color: 'var(--primary)', flexShrink: 0 }}>{t.id}</span>
                  <span style={{ flex: 1, color: 'var(--text-muted)' }}>{t.title}</span>
                  <span className={`badge badge-${t.status === 'Escalated' ? 'escalated' : t.status === 'In Progress' ? 'in-progress' : 'pending'}`} style={{ fontSize: '0.65rem' }}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
