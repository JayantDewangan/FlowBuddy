import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

export default function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Hero */}
      <div className="fade-in-up" style={{ maxWidth: 360 }}>
        <div style={{ color: 'var(--primary)', marginBottom: '1rem' }} className="float"><Icons.Flower2 size={80} /></div>
        <h1 style={{ marginBottom: '0.5rem' }}>
          Welcome to{' '}
          <span className="gradient-text">FlowBuddy</span>
        </h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.7 }}>
          Your warm, friendly companion for understanding your cycle — and sharing it with the people who care about you.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/register" className="btn btn-primary btn-full" style={{ fontSize: '1rem' }}>
            Get Started <Icons.ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-outline btn-full" style={{ fontSize: '1rem' }}>
            I already have an account
          </Link>
        </div>
      </div>

      {/* Feature pills */}
      <div className="fade-in-up" style={{
        marginTop: '3rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'center',
        maxWidth: 380,
        animationDelay: '0.2s',
      }}>
        <span className="pill" style={{ cursor: 'default' }}><Icons.Calendar size={14} /> Cycle Tracking</span>
        <span className="pill" style={{ cursor: 'default' }}><Icons.Moon size={14} /> Phase Awareness</span>
        <span className="pill" style={{ cursor: 'default' }}><Icons.BarChart2 size={14} /> Smart Insights</span>
        <span className="pill" style={{ cursor: 'default' }}><Icons.Heart size={14} /> Trusted Circle</span>
        <span className="pill" style={{ cursor: 'default' }}><Icons.Bell size={14} /> Gentle Reminders</span>
        <span className="pill" style={{ cursor: 'default' }}><Icons.WifiOff size={14} /> Works Offline</span>
      </div>

      {/* Footer note */}
      <p style={{ marginTop: '2.5rem', fontSize: '0.8rem', color: 'var(--text-light)', animationDelay: '0.4s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }} className="fade-in-up">
        <Icons.Lock size={12} /> Your data is always private. You control what you share.
      </p>
    </div>
  );
}
