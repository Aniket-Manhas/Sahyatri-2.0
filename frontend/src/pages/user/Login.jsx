import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🚂 Sahyatri</div>
        <div className="auth-subtitle">Smart Indoor Railway Navigation</div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="input-group">
            <label className="label" htmlFor="password">Password</label>
            <input id="password" className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: '0.85rem', color: 'var(--crowd-high)' }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading} id="login-submit-btn" style={{ marginTop: '0.5rem' }}>
            {loading ? '⏳ Signing in…' : '🚀 Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          New passenger?{' '}
          <Link to="/register" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Create account</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Station staff?{' '}
          <Link to="/admin" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>Admin login →</Link>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.875rem', fontSize: '0.78rem' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Demo credentials:</div>
          <div style={{ color: 'var(--text-secondary)' }}>Admin: <code style={{ color: 'var(--accent-cyan)' }}>admin@sahyatri.com</code> / <code style={{ color: 'var(--accent-cyan)' }}>Admin@123</code></div>
          <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Register a new passenger account above</div>
        </div>
      </div>
    </div>
  );
}
