import React, { useState } from 'react';
import { addComment, updateTicketStatus, deleteTicket, rateTicket, assignTicket, getStaffList } from '../utils/storage';
import { Avatar, SlaBar, StarRating } from './UI';

const statusClasses = { 'Pending': 'badge-pending', 'In Progress': 'badge-in-progress', 'Resolved': 'badge-resolved', 'Escalated': 'badge-escalated' };
const priorityColors = { Low: 'var(--primary)', Medium: 'var(--warning)', High: 'var(--danger)', Critical: '#ff2d6e' };

export default function TicketModal({ ticket: init, user, isAdmin, isStaff, isDean, onClose, onTicketsUpdated }) {
  const [ticket, setTicket] = useState(init);
  const [commentText, setCommentText] = useState('');
  const [ratingVal, setRatingVal] = useState(ticket.rating || 0);
  const [assignTarget, setAssignTarget] = useState('');
  const [staffList, setStaffList] = useState([]);

  React.useEffect(() => {
    if (isAdmin) getStaffList().then(setStaffList);
  }, [isAdmin]);

  const sync = (updated) => {
    const found = updated.find(t => t.id === ticket.id);
    if (found) setTicket(found);
    onTicketsUpdated(updated);
  };

  const handleStatus = async (newStatus) => sync(await updateTicketStatus(ticket.id, newStatus, user.name));
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    sync(await addComment(ticket.id, commentText, user.name, user.role));
    setCommentText('');
  };
  const handleRate = async (stars) => { setRatingVal(stars); sync(await rateTicket(ticket.id, stars)); };
  const handleAssign = async () => {
    if (!assignTarget) return;
    const staff = staffList.find(s => s.id === assignTarget);
    if (!staff) return;
    sync(await assignTicket(ticket.id, staff.id, staff.name));
    setAssignTarget('');
  };
  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this ticket?')) return;
    onTicketsUpdated(await deleteTicket(ticket.id));
    onClose();
  };
  const handlePrint = () => window.print();

  const handleWhatsApp = () => {
    const text = `🚨 Campus Solver Alert: A new ${ticket.priority} priority ticket (${ticket.id}) has been assigned to you.\n📍 Location: ${ticket.location || 'N/A'}\n📝 Issue: ${ticket.title}\n⏱ SLA Deadline: ${new Date(ticket.slaDeadline).toLocaleString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = `Campus Solver: Ticket Assignment ${ticket.id}`;
    const body = `Hello ${ticket.assignedName},\n\nA new ${ticket.priority} priority ticket has been assigned to you.\n\nTicket ID: ${ticket.id}\nTitle: ${ticket.title}\nLocation: ${ticket.location || 'N/A'}\nCategory: ${ticket.category}\nSLA Deadline: ${new Date(ticket.slaDeadline).toLocaleString()}\n\nPlease check the Campus Solver portal for more details.\n\nThank you.`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const MetaCell = ({ label, value, color }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--surface-border)' }}>
      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>{label}</p>
      <p style={{ fontWeight: '600', fontSize: '0.875rem', color: color || 'var(--text-main)' }}>{value || '—'}</p>
    </div>
  );

  const canControl = isAdmin || isStaff;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}>
      <div className="glass" style={{ width: '100%', maxWidth: '680px', maxHeight: '93vh', overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <span className={`badge ${statusClasses[ticket.status] || 'badge-pending'}`}>{ticket.status}</span>
              <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.75rem', color: 'var(--primary)', alignSelf: 'center' }}>{ticket.id}</span>
              {ticket.status === 'Escalated' && <span style={{ fontSize: '0.72rem', background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', padding: '0.15rem 0.6rem', borderRadius: '4px', fontWeight: '700', fontFamily: 'var(--font-label)' }}>🚨 SLA BREACHED</span>}
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', lineHeight: 1.3 }}>{ticket.title}</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button onClick={handlePrint} title="Print ticket" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', borderRadius: '10px', width: '34px', height: '34px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>🖨️</button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--surface-border)', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        </div>


        {/* SLA bar */}
        <SlaBar ticket={ticket} />

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
          <MetaCell label="Category" value={ticket.category} />
          <MetaCell label="Priority" value={ticket.priority} color={priorityColors[ticket.priority]} />
          <MetaCell label="Department" value={ticket.department} />
          <MetaCell label="Submitted" value={new Date(ticket.timestamp).toLocaleDateString()} />
          <MetaCell label="SLA Deadline" value={ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'} />
          <MetaCell label="Location" value={ticket.location} />
        </div>

        {/* Student + Assigned To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
            <Avatar initials={ticket.studentName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'} size={36} />
            <div>
              <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{ticket.studentName}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-label)' }}>Student · {ticket.studentId}</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: ticket.assignedName ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)', borderRadius: '10px', border: `1px solid ${ticket.assignedName ? 'rgba(16,185,129,0.2)' : 'var(--surface-border)'}` }}>
              <Avatar initials={ticket.assignedName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '—'} size={36} color={ticket.assignedName ? 'var(--secondary)' : 'var(--text-muted)'} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{ticket.assignedName || 'Unassigned'}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-label)' }}>Assigned Staff</p>
              </div>
            </div>
            {ticket.assignedName && isAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.1rem' }}>
                <button onClick={handleWhatsApp} title="Send WhatsApp Message" style={{ flex: 1, padding: '0.4rem', background: 'rgba(37, 211, 102, 0.1)', border: '1px solid rgba(37, 211, 102, 0.3)', borderRadius: '6px', color: '#25D366', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  WhatsApp
                </button>
                <button onClick={handleEmail} title="Send Email" style={{ flex: 1, padding: '0.4rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  ✉️ Email
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {ticket.description && (
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Description</p>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>{ticket.description}</p>
          </div>
        )}

        {/* Image attachment */}
        {ticket.image && (
          <div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Attachment</p>
            <img src={ticket.image} alt="Attachment" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--surface-border)' }} />
          </div>
        )}

        {/* Status History */}
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Status History</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {(ticket.statusHistory || []).map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: h.to === 'Escalated' ? 'var(--danger)' : h.to === 'Resolved' ? 'var(--secondary)' : 'var(--primary)', marginTop: '4px', flexShrink: 0 }} />
                  {i < (ticket.statusHistory || []).length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--surface-border)', minHeight: '20px' }} />}
                </div>
                <div style={{ paddingBottom: '0.875rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                    {h.from ? `${h.from} → ${h.to}` : `Submitted as ${h.to}`}
                    {h.note && <span style={{ fontWeight: '400', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({h.note})</span>}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>
                    {h.by} · {new Date(h.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution */}
        {ticket.resolvedAt && (
          <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '1rem' }}>
            <p style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--secondary)' }}>✅ Issue Resolved</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>on {new Date(ticket.resolvedAt).toLocaleString()}</p>
            {!isAdmin && !isStaff && !isDean && (
              <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid rgba(16,185,129,0.15)' }}>
                <p style={{ fontSize: '0.82rem', marginBottom: '0.5rem', fontWeight: '600' }}>Rate this resolution</p>
                <StarRating value={ratingVal} onChange={handleRate} readonly={!!ticket.rating} />
                {ticket.rating && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>You rated: {ticket.rating}/5 ⭐</p>}
              </div>
            )}
          </div>
        )}

        {/* Admin: Assign to staff */}
        {isAdmin && (
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: '600', marginBottom: '0.75rem' }}>👤 Assign to Staff</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select value={assignTarget} onChange={e => setAssignTarget(e.target.value)} style={{ flex: 1, margin: 0, padding: '0.5rem 0.75rem' }}>
                <option value="">— Select staff member —</option>
                {staffList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
              </select>
              <button onClick={handleAssign} disabled={!assignTarget} className="btn btn-primary" style={{ padding: '0.5rem 1rem', opacity: assignTarget ? 1 : 0.5 }}>Assign</button>
            </div>
          </div>
        )}

        {/* Admin / Staff controls */}
        {canControl && !['Resolved', 'Closed'].includes(ticket.status) && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {ticket.status === 'Pending' && isAdmin && <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => handleStatus('In Progress')}>▶ Mark In Progress</button>}
            {['In Progress', 'Escalated'].includes(ticket.status) && <button className="btn btn-primary" style={{ flex: 1, background: 'var(--secondary)', color: '#003824' }} onClick={() => handleStatus('Resolved')}>✓ Mark Resolved</button>}
            {isAdmin && <button onClick={handleDelete} style={{ padding: '0.6rem 1.25rem', borderRadius: '9999px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>🗑 Delete</button>}
          </div>
        )}

        {/* Comments */}
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>Comments ({ticket.comments?.length || 0})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.875rem' }}>
            {(ticket.comments || []).map((c, i) => {
              const roleColor = { admin: 'var(--primary)', staff: 'var(--warning)', dean: '#8b5cf6' };
              return (
                <div key={i} style={{ background: roleColor[c.authorRole] ? `${roleColor[c.authorRole]}10` : 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.875rem', border: `1px solid ${roleColor[c.authorRole] ? `${roleColor[c.authorRole]}30` : 'var(--surface-border)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.82rem', color: roleColor[c.authorRole] || 'var(--text-main)' }}>
                      {c.author}
                      {c.authorRole && c.authorRole !== 'student' && <span style={{ fontSize: '0.65rem', background: `${roleColor[c.authorRole]}25`, padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.4rem', textTransform: 'uppercase' }}>{c.authorRole}</span>}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-label)' }}>{new Date(c.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.text}</p>
                </div>
              );
            })}
            {(!ticket.comments || ticket.comments.length === 0) && <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No comments yet.</p>}
          </div>
          <form onSubmit={handleComment} style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="text" placeholder={isDean ? 'Add a remark as Dean…' : 'Add a comment…'} value={commentText} onChange={e => setCommentText(e.target.value)} style={{ flex: 1, margin: 0 }} />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1rem', flexShrink: 0 }}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
