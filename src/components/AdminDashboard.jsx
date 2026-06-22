import React, { useState, useEffect } from 'react';
import { getTickets, updateTicketStatus, deleteTicket, getStats, getAnnouncements, saveAnnouncement, deleteAnnouncement, runEscalationCheck, bulkUpdateStatus, getAnalytics, CATEGORIES, DEPARTMENTS } from '../utils/storage';
import TicketCard from './TicketCard';
import TicketModal from './TicketModal';
import Analytics from './Analytics';
import { Avatar, StatBadge, EmptyState, FilterPills, Toast } from './UI';

export default function AdminDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tab, setTab] = useState('overview');
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [annForm, setAnnForm] = useState({ title: '', message: '', type: 'info' });
  const [qrLocation, setQrLocation] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  // Bulk select state
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      const updated = await runEscalationCheck();
      setTickets(updated);
      setStats(await getStats());
      setAnnouncements(await getAnnouncements());
    };
    load();
  }, []);

  useEffect(() => {
    const loadAn = async () => {
      if (tab === 'analytics') setAnalytics(await getAnalytics());
    };
    loadAn();
  }, [tab]);

  const refresh = async (updated) => { setTickets(updated); setStats(await getStats()); };
  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3500); };

  const handleStatusChange = async (id, newStatus) => {
    const updated = await updateTicketStatus(id, newStatus, user.name);
    refresh(updated);
    showToast(`Ticket marked as ${newStatus}`, 'success');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    const updated = await deleteTicket(id);
    refresh(updated);
    showToast('Ticket deleted.', 'info');
  };

  const handleBulkResolve = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Resolve ${selectedIds.size} selected tickets?`)) return;
    const updated = await bulkUpdateStatus([...selectedIds], 'Resolved', user.name);
    refresh(updated);
    setSelectedIds(new Set());
    setBulkMode(false);
    showToast(`${selectedIds.size} tickets resolved.`, 'success');
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    setAnnouncements(await saveAnnouncement({ ...annForm, author: user.name }));
    setAnnForm({ title: '', message: '', type: 'info' });
    showToast('Announcement posted!', 'success');
  };

  const handleAnnDelete = async (id) => {
    setAnnouncements(await deleteAnnouncement(id));
  };

  const filtered = tickets.filter(t => {
    const s = statusFilter === 'All' || t.status === statusFilter;
    const c = categoryFilter === 'All' || t.category === categoryFilter;
    const p = priorityFilter === 'All' || t.priority === priorityFilter;
    const q = !search || [t.title, t.studentName, t.id, t.location].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    return s && c && p && q;
  });

  const escalatedCount = tickets.filter(t => t.status === 'Escalated').length;

  const TABS = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'tickets', label: `🎫 Tickets${escalatedCount > 0 ? ` (${escalatedCount} 🚨)` : ''}` },
    { key: 'analytics', label: '📈 Analytics' },
    { key: 'tools', label: '🛠️ Tools' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedTicket && (
        <TicketModal ticket={selectedTicket} user={user} isAdmin={true}
          onClose={() => setSelectedTicket(null)}
          onTicketsUpdated={(updated) => { refresh(updated); setSelectedTicket(null); }} />
      )}

      {/* Admin Header */}
      <div className="glass" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Avatar initials={user.avatar} size={50} color="var(--warning)" />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.15rem' }}>Admin Control Panel 👮</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-label)' }}>{user.name} · {user.department || 'Administration'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Pending', value: stats.pending || 0, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Escalated', value: stats.escalated || 0, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
            { label: 'Avg Rating', value: stats.avgRating || '—', color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Resolution', value: `${stats.resolutionRate || 0}%`, color: 'var(--secondary)', bg: 'rgba(16,185,129,0.1)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem 0.875rem', background: s.bg, borderRadius: '10px', border: `1px solid ${s.color}25` }}>
              <p style={{ fontSize: '1.3rem', fontWeight: '700', color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} className={`btn ${tab === key ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.55rem 1.2rem' }}>{label}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            <StatBadge label="Total" value={stats.total || 0} color="var(--primary)" />
            <StatBadge label="Pending" value={stats.pending || 0} color="var(--warning)" />
            <StatBadge label="In Progress" value={stats.inProgress || 0} color="var(--primary)" />
            <StatBadge label="Resolved" value={stats.resolved || 0} color="var(--secondary)" />
            <StatBadge label="Escalated" value={stats.escalated || 0} color="var(--danger)" sub="SLA breached" />
            <StatBadge label="Avg Res. Time" value={`${stats.avgResolutionHours || 0}h`} color="var(--secondary)" />
          </div>

          {escalatedCount > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderLeft: '4px solid var(--danger)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
              <p style={{ fontWeight: '700', color: 'var(--danger)', marginBottom: '0.4rem' }}>🚨 {escalatedCount} SLA Breach{escalatedCount > 1 ? 'es' : ''} — Immediate Action Required</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>These tickets exceeded their SLA deadline and were auto-escalated. Go to the Tickets tab to resolve them.</p>
            </div>
          )}

          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.25rem' }}>Tickets by Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(stats.byCategory || {}).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                const pct = Math.round((count / (stats.total || 1)) * 100);
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.82rem', alignItems: 'center' }}>
                      <span>{DEPARTMENTS[cat]?.icon} {cat}</span>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>SLA {DEPARTMENTS[cat]?.slaHours}h</span>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{count} ({pct}%)</span>
                      </div>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right, var(--primary), var(--secondary))', borderRadius: '9999px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>🚨 Escalated & High Priority</h3>
            <div className="grid-cards">
              {tickets.filter(t => t.status === 'Escalated' || (t.priority === 'High' && !['Resolved', 'Closed'].includes(t.status))).length === 0
                ? <EmptyState message="No urgent tickets right now 🎉" icon="✅" />
                : tickets.filter(t => t.status === 'Escalated' || (t.priority === 'High' && !['Resolved', 'Closed'].includes(t.status))).map(t => (
                  <TicketCard key={t.id} ticket={t} isAdmin={true} onStatusChange={handleStatusChange} onDelete={handleDelete} onClick={setSelectedTicket} />
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* ── TICKETS TAB ── */}
      {tab === 'tickets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" placeholder="🔍  Search by title, student, location, or ID…"
              value={search} onChange={e => setSearch(e.target.value)} style={{ margin: 0, padding: '0.75rem 1rem' }} />
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              {[
                { label: 'STATUS', options: ['All', 'Pending', 'In Progress', 'Escalated', 'Resolved'], value: statusFilter, onChange: setStatusFilter },
                { label: 'PRIORITY', options: ['All', 'Low', 'Medium', 'High'], value: priorityFilter, onChange: setPriorityFilter },
                { label: 'CATEGORY', options: ['All', ...CATEGORIES], value: categoryFilter, onChange: setCategoryFilter },
              ].map(f => (
                <div key={f.label}>
                  <p style={{ fontSize: '0.68rem', fontFamily: 'var(--font-label)', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>{f.label}</p>
                  <FilterPills options={f.options} value={f.value} onChange={f.onChange} />
                </div>
              ))}
            </div>
          </div>

          {/* Bulk actions bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Showing <strong style={{ color: 'var(--text-main)' }}>{filtered.length}</strong> of {tickets.length} tickets
              {bulkMode && selectedIds.size > 0 && <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>· {selectedIds.size} selected</span>}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={`btn ${bulkMode ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem' }}
                onClick={() => { setBulkMode(m => !m); setSelectedIds(new Set()); }}>
                {bulkMode ? '✕ Cancel' : '☑ Bulk Select'}
              </button>
              {bulkMode && selectedIds.size > 0 && (
                <button className="btn btn-primary" style={{ padding: '0.4rem 0.875rem', fontSize: '0.8rem', background: 'var(--secondary)', color: '#003824' }} onClick={handleBulkResolve}>
                  ✓ Resolve {selectedIds.size} Selected
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0
            ? <EmptyState message="No tickets match your filters." />
            : <div className="grid-cards">
                {filtered.map(t => (
                  <div key={t.id} style={{ position: 'relative' }}>
                    {bulkMode && (
                      <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 10 }} onClick={e => { e.stopPropagation(); toggleSelect(t.id); }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${selectedIds.has(t.id) ? 'var(--primary)' : 'var(--surface-border)'}`, background: selectedIds.has(t.id) ? 'var(--primary)' : 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                          {selectedIds.has(t.id) && <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: '900' }}>✓</span>}
                        </div>
                      </div>
                    )}
                    <TicketCard ticket={t} isAdmin={true}
                      onStatusChange={bulkMode ? null : handleStatusChange}
                      onDelete={bulkMode ? null : handleDelete}
                      onClick={bulkMode ? () => toggleSelect(t.id) : setSelectedTicket} />
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === 'analytics' && analytics && <Analytics analytics={analytics} stats={stats} />}
      {tab === 'analytics' && !analytics && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading analytics…</div>}

      {/* ── TOOLS & ANNOUNCEMENTS TAB ── */}
      {tab === 'tools' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* QR Code Generator */}
            <div className="glass" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.35rem' }}>🖨️ QR Poster Generator</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '1.5rem' }}>Generate printable QR codes for rooms. Scanning auto-fills the location.</p>
              
              <label>Room / Location Name</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <input type="text" placeholder="e.g. Seminar Hall 2" value={qrLocation} onChange={e => setQrLocation(e.target.value)} style={{ margin: 0, flex: 1 }} />
                <button type="button" className="btn btn-outline" disabled={!qrLocation} onClick={() => {
                  const url = `${window.location.origin}/?location=${encodeURIComponent(qrLocation)}`;
                  setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`);
                }}>Generate</button>
              </div>

              {qrUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <img src={qrUrl} alt="QR Code" style={{ width: '160px', height: '160px' }} />
                  </div>
                  <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>{qrLocation}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '1rem' }}>Scan to report an issue here</p>
                  <button className="btn btn-primary" onClick={() => {
                    const win = window.open('');
                    win.document.write(`<div style="font-family:sans-serif;text-align:center;padding:40px;"><h1>Scan to Report an Issue</h1><h2>📍 ${qrLocation}</h2><img src="${qrUrl}" style="width:300px;margin:20px 0;"/><p>Powered by Campus Solver</p></div>`);
                    win.document.close();
                    setTimeout(() => win.print(), 500);
                  }}>Print Poster</button>
                </div>
              )}
            </div>

            {/* Post Announcement */}
            <div className="glass" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem' }}>📢 Broadcast Announcement</h3>
              <form onSubmit={handleAnnouncement}>
                <label>Title</label>
                <input type="text" placeholder="Announcement title" value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))} required />
                <label>Message</label>
                <textarea rows={4} placeholder="Write the announcement…" value={annForm.message} onChange={e => setAnnForm(f => ({ ...f, message: e.target.value }))} required style={{ resize: 'vertical' }} />
                <label>Type</label>
                <select value={annForm.type} onChange={e => setAnnForm(f => ({ ...f, type: e.target.value }))} style={{ marginBottom: '1.5rem' }}>
                  <option value="info">ℹ️ Info</option>
                  <option value="warning">⚠️ Warning</option>
                </select>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Post to all students →</button>
              </form>
            </div>
          </div>

          {/* Active Announcements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Active Broadcasts ({announcements.length})</h3>
            {announcements.length === 0 ? <EmptyState message="No announcements." icon="📭" /> : announcements.map(ann => (
              <div key={ann.id} style={{ background: ann.type === 'warning' ? 'rgba(245,158,11,0.06)' : 'rgba(59,130,246,0.06)', border: `1px solid ${ann.type === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`, borderRadius: '10px', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{ann.title}</p>
                  <button onClick={() => handleAnnDelete(ann.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.82rem', padding: 0, flexShrink: 0 }}>✕</button>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem', lineHeight: 1.5 }}>{ann.message}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontFamily: 'var(--font-label)', marginTop: '0.5rem' }}>{ann.author} · {new Date(ann.timestamp).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
