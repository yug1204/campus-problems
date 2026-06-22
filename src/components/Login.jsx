import React, { useState } from 'react';
import { authenticate, registerStudent } from '../utils/storage';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('student');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const ROLES = [
    { key: 'student', label: '🎓 Student' },
    { key: 'admin',   label: '👮 Admin' },
    { key: 'staff',   label: '🔧 Staff' },
    { key: 'dean',    label: '🏛️ Dean' },
  ];

  const DEMOS = {
    student: { id: 'S001',     pass: '1234',     hint: 'ID: S001 / Pass: 1234' },
    admin:   { id: 'ADM001',   pass: 'admin123', hint: 'ID: ADM001 / Pass: admin123' },
    staff:   { id: 'STF001',   pass: 'staff123', hint: 'ID: STF001 / Pass: staff123' },
    dean:    { id: 'DEAN001',  pass: 'dean123',  hint: 'ID: DEAN001 / Pass: dean123' },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const user = await authenticate(loginId, password, role);
    if (user) onLogin(user);
    else setError('Invalid credentials. Check the hint below.');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regPassword !== confirmPassword) return setError('Passwords do not match.');
    if (regPassword.length < 4) return setError('Password must be at least 4 characters.');
    const result = await registerStudent(name, email, regPassword);
    if (result.error) return setError(result.error);
    onLogin(result.user);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 100px)', padding: '1rem' }}>
      <div className="glass animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '2rem', color: 'white', margin: '0 auto 1rem', boxShadow: '0 8px 20px rgba(59,130,246,0.3)' }}>C</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Campus Solver · {mode === 'login' ? 'Sign in to continue' : 'Register as student'}</p>
        </div>

        {/* Role Selector */}
        {mode === 'login' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.4rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: '12px' }}>
            {ROLES.map(r => (
              <button key={r.key} type="button" className="btn"
                style={{ padding: '0.45rem 0.25rem', fontSize: '0.7rem', fontWeight: '700', background: role === r.key ? 'var(--primary)' : 'transparent', color: role === r.key ? 'white' : 'var(--text-muted)', boxShadow: role === r.key ? '0 0 12px rgba(59,130,246,0.3)' : 'none', transition: 'all 0.2s', borderRadius: '8px' }}
                onClick={() => { setRole(r.key); setError(''); }}>
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* Demo hint */}
        {mode === 'login' && DEMOS[role] && (
          <div style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '0.65rem 1rem', marginBottom: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Demo: <code style={{ color: 'var(--primary)' }}>{DEMOS[role].hint}</code></span>
            <button type="button" onClick={() => { setLoginId(DEMOS[role].id); setPassword(DEMOS[role].pass); }}
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '6px', color: 'var(--primary)', padding: '0.2rem 0.6rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600' }}>
              Autofill
            </button>
          </div>
        )}

        {/* Login form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <label>ID or Email</label>
            <input type="text" placeholder="e.g. S001 or admin@campus.edu" value={loginId} onChange={e => setLoginId(e.target.value)} required />
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required style={{ marginBottom: '1.5rem', paddingRight: '2.75rem' }} />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: '0.875rem', top: '0.875rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign In →</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <label>Full Name</label>
            <input type="text" placeholder="e.g. Aarav Shah" value={name} onChange={e => setName(e.target.value)} required />
            <label>Email</label>
            <input type="email" placeholder="you@campus.edu" value={email} onChange={e => setEmail(e.target.value)} required />
            <label>Password</label>
            <input type="password" placeholder="Min 4 characters" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
            <label>Confirm Password</label>
            <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            {error && <p style={{ color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Account →</button>
          </form>
        )}

        {/* Toggle login/register */}
        {role === 'student' && (
          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', padding: 0 }}>
              {mode === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
