import React, { useState, useEffect, useRef } from 'react';
import { getTicketsByStudent, saveTicket, getAnnouncements, runEscalationCheck, CATEGORIES, DEPARTMENTS, findSimilarTickets, createNotification } from '../utils/storage';
import TicketCard from './TicketCard';
import TicketModal from './TicketModal';
import { Avatar, EmptyState, FilterPills, Toast } from './UI';

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function StudentDashboard({ user }) {
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: '', category: 'Maintenance', priority: 'Low', description: '', location: '', image: null });
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [imagePreview, setImagePreview] = useState(null);
  const [similarTickets, setSimilarTickets] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [publicTicker, setPublicTicker] = useState([]);

  useEffect(() => {
    const load = async () => {
      const updated = await runEscalationCheck();
      setTickets(updated.filter(t => t.studentId === user.id));
      setAnnouncements(await getAnnouncements());
      setVoiceSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

      const locParam = new URLSearchParams(window.location.search).get('location');
      if (locParam) {
        setFormData(f => ({ ...f, location: locParam }));
        setTab('submit');
      }

      const resolved = updated.filter(t => t.status === 'Resolved').sort((a,b) => new Date(b.resolvedAt) - new Date(a.resolvedAt)).slice(0, 5);
      setPublicTicker(resolved);
    };
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.title.length > 5) setSimilarTickets(await findSimilarTickets(formData.title));
      else setSimilarTickets([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.title]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Image too large. Max 2MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setImagePreview(ev.target.result); setFormData(f => ({ ...f, image: ev.target.result })); };
    reader.readAsDataURL(file);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setFormData(f => ({ ...f, description: f.description ? f.description + ' ' + transcript : transcript }));
    };
    recognition.onerror = () => { setIsListening(false); showToast('Voice input failed. Try again.', 'error'); };
    recognition.start();
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const handleAiTriage = () => {
    const text = (formData.title + ' ' + formData.description).toLowerCase().trim();
    if (!text) return showToast('Please enter a title or description first.', 'error');
    
    setIsAiLoading(true);
    setTimeout(() => {
      let cat = 'Maintenance';
      let pri = 'Low';
      
      if (text.match(/wifi|network|internet|projector|pc|computer|server/)) cat = 'IT & Network';
      else if (text.match(/clean|trash|garbage|smell|dirty|washroom|toilet|dust/)) cat = 'Cleanliness';
      else if (text.match(/security|guard|fight|stranger|access|theft/)) { cat = 'Security'; pri = 'High'; }
      else if (text.match(/bed|cupboard|table|chair|desk/)) cat = 'Furniture';
      
      if (text.match(/urgent|emergency|now|leak|broken|fire|blood/)) pri = 'High';
      
      setFormData(f => ({ ...f, category: cat, priority: pri }));
      setIsAiLoading(false);
      showToast('✨ AI successfully auto-categorized your issue!');
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    const newTicket = await saveTicket({ ...formData, studentId: user.id, studentName: user.name });
    setTickets(prev => [newTicket, ...prev]);
    setFormData({ title: '', category: 'Maintenance', priority: 'Low', description: '', location: '', image: null });
    setImagePreview(null);
    setSimilarTickets([]);
    setTab('dashboard');
    showToast(`✅ Ticket submitted! SLA: ${DEPARTMENTS[formData.category]?.slaHours}h response guaranteed.`);
  };

  const filteredTickets = tickets.filter(t => statusFilter === 'All' || t.status === statusFilter);
  const pending = tickets.filter(t => t.status === 'Pending').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;
  const escalated = tickets.filter(t => t.status === 'Escalated').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedTicket && (
        <TicketModal ticket={selectedTicket} user={user} isAdmin={false}
          onClose={() => setSelectedTicket(null)}
          onTicketsUpdated={(all) => { setTickets(all.filter(t => t.studentId === user.id)); setSelectedTicket(null); }} />
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {announcements.slice(0, 2).map(ann => (
            <div key={ann.id} style={{ background: ann.type === 'warning' ? 'rgba(245,158,11,0.07)' : 'rgba(59,130,246,0.07)', border: `1px solid ${ann.type === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`, borderLeft: `4px solid ${ann.type === 'warning' ? 'var(--warning)' : 'var(--primary)'}`, borderRadius: '10px', padding: '0.875rem 1.25rem', display: 'flex', gap: '0.75rem' }}>
              <span>{ann.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
              <div><p style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.15rem' }}>{ann.title}</p><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{ann.message}</p></div>
            </div>
          ))}
        </div>
      )}

      {/* Profile header */}
      <div className="glass" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <Avatar initials={user.avatar} size={50} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.15rem' }}>Hello, {user.name.split(' ')[0]} 👋</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'var(--font-label)' }}>{user.id} · Student since {user.joined}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Pending', value: pending, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Active', value: inProgress, color: 'var(--primary)', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Resolved', value: resolved, color: 'var(--secondary)', bg: 'rgba(16,185,129,0.1)' },
            ...(escalated > 0 ? [{ label: 'Escalated', value: escalated, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' }] : []),
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '0.5rem 0.875rem', background: s.bg, borderRadius: '10px', border: `1px solid ${s.color}25` }}>
              <p style={{ fontSize: '1.3rem', fontWeight: '700', color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Public Activity Ticker */}
      {publicTicker.length > 0 && (
        <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--secondary)', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap', zIndex: 2 }}>
            ⚡ Live Activity
          </div>
          <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', padding: '0.5rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'inline-block', animation: 'marquee 25s linear infinite' }}>
              {publicTicker.map(t => (
                <span key={t.id} style={{ marginRight: '3rem' }}>
                  ✅ {DEPARTMENTS[t.category]?.icon} {t.department} fixed an issue in <strong>{t.location || 'Campus'}</strong> ({new Date(t.resolvedAt).toLocaleDateString()})
                </span>
              ))}
            </div>
          </div>
          <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
        </div>
      )}


      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[['dashboard', '📋 My Tickets'], ['submit', '➕ New Ticket']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '0.55rem 1.2rem' }}>{label}</button>
        ))}
      </div>

      {/* ── My Tickets ── */}
      {tab === 'dashboard' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>My Reports <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.875rem' }}>({filteredTickets.length})</span></h3>
            <FilterPills options={['All', 'Pending', 'In Progress', 'Escalated', 'Resolved']} value={statusFilter} onChange={setStatusFilter} />
          </div>
          {filteredTickets.length === 0
            ? <EmptyState message={statusFilter === 'All' ? 'No tickets yet. Submit your first issue!' : `No "${statusFilter}" tickets.`} />
            : <div className="grid-cards">{filteredTickets.map(t => <TicketCard key={t.id} ticket={t} isAdmin={false} onClick={setSelectedTicket} />)}</div>
          }
        </div>
      )}

      {/* ── Submit Tab ── */}
      {tab === 'submit' && (
        <div className="glass" style={{ padding: '2rem', maxWidth: '660px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.35rem' }}>Submit a New Ticket</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
            Your ticket is routed to the responsible department with an automatic SLA guarantee.
          </p>
          <form onSubmit={handleSubmit}>
            {/* Title + duplicate detection */}
            <label>Issue Title <span style={{ color: 'var(--danger)' }}>*</span></label>
            <input type="text" placeholder="e.g. AC not working in Seminar Hall 2"
              value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} required />

            {/* Duplicate warning */}
            {similarTickets.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
                <p style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                  ⚠️ Similar open tickets found — check before submitting a duplicate:
                </p>
                {similarTickets.map(t => (
                  <div key={t.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.78rem', padding: '0.3rem 0' }}>
                    <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-label)', flexShrink: 0 }}>{t.id}</span>
                    <span style={{ color: 'var(--text-muted)', flex: 1 }}>{t.title}</span>
                    <span className={`badge badge-${t.status === 'Escalated' ? 'escalated' : t.status === 'In Progress' ? 'in-progress' : 'pending'}`} style={{ fontSize: '0.65rem' }}>{t.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Description + Voice */}
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Detailed Description</span>
              {voiceSupported && (
                <button type="button" onClick={isListening ? stopVoice : startVoice}
                  style={{ background: isListening ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.1)', border: `1px solid ${isListening ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.3)'}`, borderRadius: '8px', padding: '0.25rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', color: isListening ? 'var(--danger)' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s', fontWeight: '600' }}>
                  <span style={{ fontSize: '0.9rem', animation: isListening ? 'pulse 1s ease infinite' : 'none' }}>{isListening ? '⏹' : '🎤'}</span>
                  {isListening ? 'Stop Recording' : 'Voice Input'}
                </button>
              )}
            </label>
            {isListening && (
              <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ animation: 'pulse 0.8s ease infinite', fontSize: '1rem' }}>🔴</span> Listening… speak clearly in English
              </div>
            )}
            <textarea rows={3} placeholder="Describe the issue in detail…"
              value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }} />

            <label>Location</label>
            <input type="text" placeholder="e.g. Block B, Room 214" value={formData.location}
              onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
              <label style={{ margin: 0 }}>Category & Priority</label>
              <button type="button" onClick={handleAiTriage} disabled={isAiLoading}
                style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none', borderRadius: '8px', padding: '0.35rem 0.85rem', color: 'white', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.2s', opacity: isAiLoading ? 0.7 : 1 }}>
                {isAiLoading ? 'Analyzing...' : '✨ AI Auto-Triage'}
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} style={{ margin: 0 }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <select value={formData.priority} onChange={e => setFormData(f => ({ ...f, priority: e.target.value }))} style={{ margin: 0 }}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* SLA info */}
            {DEPARTMENTS[formData.category] && (
              <div style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {DEPARTMENTS[formData.category].icon} Routes to: <strong style={{ color: 'var(--text-main)' }}>{DEPARTMENTS[formData.category].name}</strong>
                &nbsp;· SLA: <strong style={{ color: 'var(--secondary)' }}>{DEPARTMENTS[formData.category].slaHours}h guaranteed response</strong>
              </div>
            )}

            {/* Image upload */}
            <label>Attach Photo (optional)</label>
            <div style={{ marginBottom: '1.5rem' }}>
              <input type="file" accept="image/*" onChange={handleImageUpload}
                style={{ padding: '0.5rem', cursor: 'pointer', marginBottom: imagePreview ? '0.75rem' : 0 }} />
              {imagePreview && (
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--surface-border)' }} />
                  <button type="button" onClick={() => { setImagePreview(null); setFormData(f => ({ ...f, image: null })); }}
                    style={{ position: 'absolute', top: '0.4rem', right: '0.4rem', background: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: 'white', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Ticket →</button>
              <button type="button" className="btn btn-outline" onClick={() => setTab('dashboard')}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
