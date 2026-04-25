import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div className="fade-in-up">
        <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }} className="float"><Icons.Flower2 size={64} /></div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Oops!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          We couldn't find the page you're looking for.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Icons.Home size={18} /> Take me home
        </Link>
      </div>
    </div>
  );
}
