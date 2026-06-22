import React from 'react';
import { DEPARTMENTS, exportTicketsCSV } from '../utils/storage';
import HotspotMap from './HotspotMap';

// ─── Bar Chart (SVG) ──────────────────────────────────────────────────────
function BarChart({ data, color = 'var(--primary)', height = 120 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  const barW = 28;
  const gap = 12;
  const svgW = data.length * (barW + gap);

  return (
    <svg width="100%" viewBox={`0 0 ${svgW} ${height + 28}`} style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const barH = Math.max(4, (d.count / max) * height);
        const x = i * (barW + gap);
        const y = height - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="5"
              fill={d.count === 0 ? 'rgba(255,255,255,0.06)' : color}
              opacity={d.count === 0 ? 1 : 0.85} />
            {d.count > 0 && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fill="white" fontSize="10" fontFamily="Geist, monospace" fontWeight="700">{d.count}</text>
            )}
            <text x={x + barW / 2} y={height + 18} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="Geist, monospace">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Line / Area Chart (SVG) ──────────────────────────────────────────────
function AreaChart({ data, height = 100 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d.count), 1);
  const w = 500;
  const pad = 10;
  const innerW = w - pad * 2;
  const innerH = height;

  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * innerW,
    y: innerH - (d.count / max) * innerH + pad,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${innerH + pad} L${points[0].x},${innerH + pad} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height + 30}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
          {data[i].count > 0 && <text x={p.x} y={p.y - 10} textAnchor="middle" fill="white" fontSize="10" fontFamily="Geist, monospace" fontWeight="700">{data[i].count}</text>}
          <text x={p.x} y={height + 25} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="Geist, monospace">{data[i].label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Donut Segment ────────────────────────────────────────────────────────
function DonutChart({ resolved, total }) {
  const pct = total ? Math.round((resolved / total) * 100) : 0;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--secondary)" strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" fontFamily="Inter, sans-serif">{pct}%</text>
      </svg>
      <div>
        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--secondary)' }}>{resolved}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>of {total} resolved</p>
      </div>
    </div>
  );
}

// ─── Main Analytics Component ─────────────────────────────────────────────
export default function Analytics({ analytics, stats }) {
  const { dailySubmissions, deptPerf, byPriority, staffPerf } = analytics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Header with CSV export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.2rem' }}>Campus Analytics Dashboard</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>All-time data across {stats.total || 0} tickets</p>
        </div>
        <button className="btn btn-outline" onClick={exportTicketsCSV}
          style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📥 Export CSV
        </button>
      </div>

      {/* Row 1: Submissions + Resolution */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.35rem' }}>Daily Submissions — Last 7 Days</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.25rem' }}>Ticket volume trend to identify peak days</p>
          <AreaChart data={dailySubmissions} height={100} />
        </div>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.35rem' }}>Resolution Rate</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.25rem' }}>All-time closed tickets</p>
          <DonutChart resolved={stats.resolved || 0} total={stats.total || 0} />
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <p>⏱ Avg resolution: <strong style={{ color: 'var(--text-main)' }}>{stats.avgResolutionHours || 0}h</strong></p>
            <p style={{ marginTop: '0.25rem' }}>⭐ Avg rating: <strong style={{ color: 'var(--warning)' }}>{stats.avgRating || '—'}</strong></p>
          </div>
        </div>
      </div>

      {/* Row 2: Category bar + Priority bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.35rem' }}>Tickets by Category</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.25rem' }}>Which departments get the most issues</p>
          <BarChart
            data={Object.entries(stats.byCategory || {}).map(([cat, count]) => ({ label: DEPARTMENTS[cat]?.icon + cat.slice(0, 5), count }))}
            color="var(--primary)"
          />
        </div>
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.35rem' }}>Tickets by Priority</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.25rem' }}>Distribution of issue severity</p>
          <BarChart
            data={byPriority}
            color="var(--warning)"
          />
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
            {byPriority.map(p => (
              <div key={p.label} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: p.label === 'High' ? 'var(--danger)' : p.label === 'Medium' ? 'var(--warning)' : 'var(--primary)' }}>{p.count}</p>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Performance Table */}
      <div className="glass" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.35rem' }}>Department SLA Performance</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.25rem' }}>Resolution rates and average times per department</p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                {['Department', 'SLA', 'Total', 'Resolved', 'Escalated', 'Rate', 'Avg Time', 'Rating'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptPerf.map((d, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '600' }}>{DEPARTMENTS[d.category]?.icon} {d.category}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{d.slaHours}h</td>
                  <td style={{ padding: '0.75rem' }}>{d.total}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--secondary)', fontWeight: '600' }}>{d.resolved}</td>
                  <td style={{ padding: '0.75rem', color: d.escalated > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: d.escalated > 0 ? '700' : '400' }}>{d.escalated}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', minWidth: '50px' }}>
                        <div style={{ height: '100%', width: `${d.resolutionRate}%`, background: d.resolutionRate >= 75 ? 'var(--secondary)' : d.resolutionRate >= 40 ? 'var(--warning)' : 'var(--danger)', borderRadius: '9999px' }} />
                      </div>
                      <span style={{ color: d.resolutionRate >= 75 ? 'var(--secondary)' : d.resolutionRate >= 40 ? 'var(--warning)' : 'var(--danger)', fontWeight: '700', fontFamily: 'var(--font-label)', fontSize: '0.75rem' }}>{d.resolutionRate}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{d.avgResHours != null ? `${d.avgResHours}h` : '—'}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--warning)' }}>{d.avgRating ? `⭐ ${d.avgRating}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hotspot Map */}
      <HotspotMap />

      {/* Staff leaderboard */}
      {staffPerf.length > 0 && (
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.35rem' }}>Staff Performance Leaderboard</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.25rem' }}>Tickets assigned vs resolved per staff member</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {staffPerf.sort((a, b) => b.resolutionRate - a.resolutionRate).map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: i === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: i === 0 ? 'var(--warning)' : 'var(--text-muted)', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.75rem', color: 'white', flexShrink: 0 }}>{s.avatar}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{s.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-label)' }}>{s.department} · {s.assigned} assigned, {s.resolved} resolved</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '700', fontSize: '1rem', color: s.resolutionRate >= 75 ? 'var(--secondary)' : s.resolutionRate >= 40 ? 'var(--warning)' : 'var(--danger)' }}>{s.resolutionRate}%</p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>resolution rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
