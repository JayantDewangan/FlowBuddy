import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { viewerAPI, messageAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { getMoodConfig } from '../utils/constants';

const Icon = ({ name, size = 24, ...props }) => {
  const LucideIcon = Icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} {...props} />;
};

export default function ViewerDashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    viewerAPI.getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load dashboard 💔'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '1rem' }} className="float"><Icons.Heart size={48} /></div>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ color: 'var(--secondary-dark)', marginBottom: '1rem' }}><Icons.HeartCrack size={48} /></div>
          <h2>Oops!</h2>
          <p style={{ marginTop: '0.5rem' }}>{error}</p>
          <button className="btn btn-ghost" style={{ marginTop: '1.5rem' }} onClick={logout}>
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header fade-in-up" style={{ textAlign: 'center', paddingTop: '2rem' }}>
        <div style={{ color: 'var(--primary)', marginBottom: '1rem' }} className="float">
          <Icons.Heart size={56} fill="rgba(192, 132, 252, 0.2)" />
        </div>
        <p style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem' }}>
          MEMBER OF {data.userName.toUpperCase()}'S CIRCLE
        </p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(to right, #F3E8FF, #D8B4FE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Hello, {user?.name?.split(' ')[0]}! 🤍
        </h1>
      </div>

      <div className="page-content stack">
        {/* No data shared */}
        {data.noDataShared && (
          <div className="card fade-in-up" style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
            border: '1px solid var(--border)'
          }}>
            <div style={{ color: 'var(--primary)', marginBottom: '1.5rem', opacity: 0.5 }}>
              <Icons.EyeOff size={64} />
            </div>
            <h2 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>Nothing to show yet</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
              {data.userName} hasn't shared any specific details with you yet — that's okay! Just knowing you care is enough 💕
            </p>
          </div>
        )}

        <div className="desktop-grid">
          <div className="stack">
            {/* Phase info */}
            {data.phase && (
              <div className="card fade-in-up" style={{
                background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
                border: '1px solid var(--primary)',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <span style={{ color: 'var(--primary)' }}><Icons.Moon size={32} /></span>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '1px' }}>RIGHT NOW</p>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text)' }}>{data.phase.friendlyName}</h3>
                  </div>
                </div>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                  {data.phase.message}
                </p>

                <div className="stack" style={{ gap: '0.6rem' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }}>HOW YOU CAN HELP:</p>
                  {data.phase.tips.map((tip, i) => (
                    <div key={i} style={{
                      fontSize: '0.9rem',
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius)',
                      padding: '0.75rem 1rem',
                      color: 'var(--text)',
                      border: '1px solid var(--border-soft)',
                    }}>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mood */}
            {data.mood && (
              <div className="card fade-in-up" style={{ background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--primary-dark)' }}><Icon name={getMoodConfig(data.mood.label.toLowerCase())?.icon || 'Smile'} size={48} /></span>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px' }}>TODAY'S VIBE</p>
                    <p style={{ fontWeight: 800, color: 'var(--text)', textTransform: 'capitalize', fontSize: '1.4rem' }}>
                      {data.mood.label}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="stack">
            {/* Period countdown */}
            {data.periodCountdown && (
              <div className="card fade-in-up" style={{
                background: 'rgba(236, 72, 153, 0.05)',
                border: '1px solid var(--secondary)',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: 'var(--secondary)' }}><Icons.Droplets size={32} /></span>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 800, letterSpacing: '1px' }}>HEADS UP</p>
                    <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem' }}>
                      {data.periodCountdown.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Symptom summary */}
            {data.symptomSummary && (
              <div className="card fade-in-up" style={{
                background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
                border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ marginTop: '0.2rem', color: 'var(--secondary)' }}><Icons.HeartPulse size={28} /></span>
                  <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                    {data.symptomSummary}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.8 }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Icons.Lock size={14} /> You only see what {data.userName} has chosen to share
          </p>
          <button
            className="btn btn-ghost"
            style={{ marginTop: '1.5rem', color: 'var(--error)' }}
            onClick={logout}
          >
            <Icons.LogOut size={18} /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
