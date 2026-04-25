import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function JoinViewer() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { registerViewer } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    inviteCode: inviteCode === 'enter' ? '' : inviteCode || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.inviteCode) {
      toast.error("Don't forget your invite code! 🌸");
      return;
    }
    setLoading(true);
    try {
      await registerViewer(form);
      toast.success("You're in! 💕 Check your special dashboard.");
      navigate('/viewer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong 💔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
    }}>
      <div className="fade-in-up" style={{ width: '100%', maxWidth: 450 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }} className="float">
            <Icons.HeartHandshake size={64} fill="rgba(192, 132, 252, 0.1)" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(to right, #F3E8FF, #D8B4FE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            You're invited!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            Someone special wants to include you in their circle
          </p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', border: '1px solid var(--border)' }}>
          <div style={{
            background: 'rgba(192, 132, 252, 0.05)',
            borderRadius: 'var(--radius)',
            padding: '1.25rem',
            marginBottom: '2rem',
            fontSize: '0.95rem',
            color: 'var(--text)',
            border: '1px solid rgba(192, 132, 252, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            lineHeight: 1.5,
          }}>
            <span style={{marginTop: '0.1rem', color: 'var(--primary)'}}><Icons.ShieldCheck size={20} /></span>
            <span>As a viewer, you'll see a <strong>gentle, privacy-safe dashboard</strong> — you'll never see raw health data. Only what they choose to share with you.</span>
          </div>

          <form onSubmit={handleSubmit} className="stack" style={{ gap: '1.5rem' }}>
            {inviteCode === 'enter' && (
              <div className="form-group">
                <label className="form-label">Invite Code</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Enter the code they shared with you"
                  value={form.inviteCode}
                  onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
                  required
                />
              </div>
            )}
            {inviteCode !== 'enter' && (
              <div style={{
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius)',
                padding: '1rem',
                fontSize: '1rem',
                color: 'var(--primary)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                border: '1px dashed var(--primary)',
              }}>
                <Icons.Sparkles size={20} /> INVITE CODE: {form.inviteCode}
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="What should they call you?"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Create a Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Secure your account"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ padding: '1rem', fontSize: '1.1rem' }}
            >
              {loading ? <Icons.Loader2 className="spinner" size={20} /> : <><Icons.Users size={20} /> Join the Circle</>}
            </button>
          </form>
        </div>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          By joining, you agree to support and care for your friend 🌸
        </p>
      </div>
    </div>
  );
}
