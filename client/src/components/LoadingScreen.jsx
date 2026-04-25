export default function LoadingScreen({ message = 'Just a moment...' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      background: 'var(--bg)',
    }}>
      <div style={{ fontSize: '3rem', animation: 'float 2s ease-in-out infinite' }}>🌸</div>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{message}</p>
    </div>
  );
}
