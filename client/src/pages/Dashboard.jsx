import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as Icons from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { insightsAPI, cycleAPI, logAPI, messageAPI } from '../api';
import { PHASE_CONFIG, MOODS, todayISO, formatDate } from '../utils/constants';

const Icon = ({ name, size = 24, ...props }) => {
  const LucideIcon = Icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} {...props} />;
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [insights, setInsights] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogPeriod, setShowLogPeriod] = useState(false);
  const [periodDate, setPeriodDate] = useState(todayISO());

  useEffect(() => {
    const load = async () => {
      try {
        const [insRes, logRes] = await Promise.all([
          insightsAPI.get(),
          logAPI.getAll({ date: todayISO() }),
        ]);
        setInsights(insRes.data);
        setTodayLog(logRes.data[0] || null);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogPeriodStart = async () => {
    try {
      await cycleAPI.create({ startDate: periodDate });
      const res = await insightsAPI.get();
      setInsights(res.data);
      setShowLogPeriod(false);
      toast.success('Period logged! 🌺');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong 💔');
    }
  };

  const phase = insights?.currentPhase;
  const phaseConfig = phase ? PHASE_CONFIG[phase.phase] : null;
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div className="dashboard-header fade-in">
          <div>
            <p className="dashboard-greeting">
              {greeting()}
            </p>
            <h1 className="dashboard-title">
              {user?.name?.split(' ')[0]}
            </h1>
          </div>
          <div className="dashboard-actions">
            <button 
              className="btn btn-ghost logout-btn" 
              onClick={logout}
              title="Log Out"
            >
              <Icons.LogOut size={22} />
            </button>
            <Link to="/settings" style={{ textDecoration: 'none' }}>
              <div className="avatar dashboard-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            </Link>
          </div>
        </div>
      </div>

      <div className="page-content">

        {/* Phase Card */}
        {phase ? (
          <div className="card fade-in-up" style={{
            background: `linear-gradient(135deg, rgba(30, 21, 50, 0.8), rgba(21, 14, 35, 0.9))`,
            borderColor: `var(--primary)`,
            boxShadow: `0 0 30px rgba(168, 85, 247, 0.15)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ color: phaseConfig?.textColor }}><Icon name={phaseConfig?.icon} size={32} /></span>
              <div>
                <div className={`phase-badge phase-${phase.phase}`}>{phaseConfig?.friendlyName}</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Day {phase.dayOfCycle} of your cycle
                </p>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.75rem' }}>
              {phase.description}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {phase.tips.map((tip, i) => (
                <div key={i} style={{
                  fontSize: '0.9rem',
                  color: 'var(--text)',
                  background: 'rgba(168, 85, 247, 0.08)',
                  borderRadius: 'var(--radius)',
                  padding: '0.6rem 0.9rem',
                  border: '1px solid rgba(168, 85, 247, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card fade-in-up" style={{
            background: 'linear-gradient(135deg, var(--surface-2), var(--surface))',
            textAlign: 'center',
            padding: '3rem 1.5rem',
            border: '1px solid var(--border)'
          }}>
            <div style={{ marginBottom: '1rem', color: 'var(--primary)', filter: 'drop-shadow(0 0 20px rgba(168,85,247,0.5))' }}>
              <Icon name="Flower2" size={48} />
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Let's get to know your cycle!</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Log your first period to start getting personalized insights
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowLogPeriod(true)}
            >
              <Icon name="Droplet" size={18} /> Log My Period
            </button>
          </div>
        )}

        <div className="desktop-grid">
          <div className="stack">
            {/* Countdown card */}
            {insights?.prediction && (
          <div className="card fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', align: 'center', gap: '0.75rem' }}>
              <span style={{ color: 'var(--primary)' }}><Icon name="CalendarHeart" size={32} /></span>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.2rem' }}>
                  NEXT PERIOD
                </p>
                <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>
                  {insights.prediction.message}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  {formatDate(insights.prediction.nextPeriodDate)}
                </p>
              </div>
            </div>
          </div>
        )}

            {/* Today's Mood Quick-log */}
            <div className="card fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="section-header">
                <span className="section-title">How are you feeling today?</span>
            <Link to="/log" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
              {todayLog ? 'Edit' : 'Full log →'}
            </Link>
          </div>
              {todayLog?.mood ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--primary-dark)' }}>
                    <Icon name={MOODS.find((m) => m.key === todayLog.mood)?.icon} size={40} />
                  </span>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text)', textTransform: 'capitalize' }}>
                  {todayLog.mood}
                </p>
                {todayLog.note && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{todayLog.note}</p>
                )}
              </div>
            </div>
          ) : (
            <Link to="/log" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex',
                gap: '0.6rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                paddingRight: '1rem',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
              }}>
                {MOODS.map((m) => (
                  <div key={m.key} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: '0.6rem',
                    borderRadius: 'var(--radius)',
                        background: 'var(--surface-2)',
                        minWidth: 52,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}>
                        <span style={{ color: 'var(--primary-dark)' }}><Icon name={m.icon} size={24} /></span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.label}</span>
                  </div>
                ))}
              </div>
              </Link>
              )}
            </div>
          </div>

          <div className="stack">
            {/* Daily Quote Card */}
            <div className="card fade-in-up" style={{ animationDelay: '0.2s', background: 'linear-gradient(135deg, var(--surface-2), var(--surface))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
                <Icon name="Quote" size={20} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Wellness</span>
              </div>
              <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.6 }}>
                "Listen to your body. It's smarter than you think and always knows exactly what it needs today."
              </p>
            </div>

            {/* Quick stats */}
            {insights?.hasEnoughData && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="card card--flat fade-in-up" style={{ animationDelay: '0.2s' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVG CYCLE</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                {insights.avgCycleLength}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>days</p>
            </div>
            <div className="card card--flat fade-in-up" style={{ animationDelay: '0.25s' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>AVG PERIOD</p>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary-dark)' }}>
                {insights.avgPeriodLength}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>days</p>
            </div>
          </div>
            )}

            {/* Log period button */}
            {phase && (
              <button
                className="btn btn-secondary btn-full fade-in-up"
                style={{ animationDelay: '0.3s' }}
                onClick={() => setShowLogPeriod(true)}
              >
                <Icon name="Droplet" size={18} /> Log Period Start
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Log Period Modal */}
      {showLogPeriod && (
        <div className="modal-overlay" onClick={() => setShowLogPeriod(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name="Droplet" color="var(--primary)" /> Log Period Start
            </h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>When did your period start?</p>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                className="form-input"
                type="date"
                value={periodDate}
                max={todayISO()}
                onChange={(e) => setPeriodDate(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowLogPeriod(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleLogPeriodStart}>
                <Icon name="Check" size={18} /> Log It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
