import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🚂 Sahyatri</div>
        <div className="auth-subtitle">Create your passenger account</div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            { name: 'name',    label: 'Full Name',        type: 'text',     placeholder: 'Rahul Sharma',         icon: '👤' },
            { name: 'email',   label: 'Email',            type: 'email',    placeholder: 'you@example.com',      icon: '📧' },
            { name: 'phone',   label: 'Phone (optional)', type: 'tel',      placeholder: '+91 98765 43210',      icon: '📱' },
            { name: 'password',label: 'Password',         type: 'password', placeholder: 'Min 6 characters',     icon: '🔒' },
            { name: 'confirm', label: 'Confirm Password', type: 'password', placeholder: 'Repeat password',      icon: '🔒' },
          ].map(f => (
            <div key={f.name} className="input-group">
              <label className="label" htmlFor={f.name}>{f.label}</label>
              <input id={f.name} name={f.name} className="input" type={f.type} placeholder={f.placeholder}
                value={form[f.name]} onChange={handleChange} required={f.name !== 'phone'} />
            </div>
          ))}

          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.5rem 0.875rem', fontSize: '0.83rem', color: 'var(--crowd-high)' }}>{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading} id="register-submit-btn" style={{ marginTop: '0.25rem' }}>
            {loading ? '⏳ Creating…' : '🚀 Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
