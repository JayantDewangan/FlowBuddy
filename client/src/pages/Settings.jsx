import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as Icons from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { settingsAPI, cycleAPI } from '../api';

export default function Settings() {
  const { user, logout, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '' });
  const [notifPrefs, setNotifPrefs] = useState(user?.notificationPreferences || {
    periodReminder: true,
    fertileWindowReminder: true,
    dailyLogReminder: false,
    dailyLogTime: '20:00',
  });
  const [cycles, setCycles] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [showCycles, setShowCycles] = useState(false);

  useEffect(() => {
    if (showCycles) {
      cycleAPI.getAll().then((res) => setCycles(res.data)).catch(() => {});
    }
  }, [showCycles]);

  const handleProfileSave = async () => {
    setLoadingProfile(true);
    try {
      await settingsAPI.updateProfile(profile);
      setUser((u) => ({ ...u, name: profile.name }));
      toast.success('Profile updated 💕');
    } catch {
      toast.error('Could not update profile 💔');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleNotifSave = async () => {
    setLoadingNotif(true);
    try {
      await settingsAPI.updateNotifications(notifPrefs);
      toast.success('Notification preferences saved 🔔');
    } catch {
      toast.error('Could not save preferences 💔');
    } finally {
      setLoadingNotif(false);
    }
  };

  const handleDeleteCycle = async (id) => {
    if (!window.confirm('Remove this cycle entry?')) return;
    try {
      await cycleAPI.delete(id);
      setCycles((c) => c.filter((cy) => cy._id !== id));
      toast.success('Cycle entry removed 🌸');
    } catch {
      toast.error('Could not remove 💔');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Icons.Settings color="var(--primary-dark)" size={32} /> Settings
        </h1>
        <p>Make FlowBuddy feel like yours</p>
      </div>

      <div className="page-content desktop-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Profile */}
        <div className="card fade-in-up">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.User size={20} color="var(--primary)" /> Profile
          </h3>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input
              className="form-input"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleProfileSave}
            disabled={loadingProfile}
          >
            {loadingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Notifications */}
        <div className="card fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icons.Bell size={20} color="var(--primary)" /> Reminders
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Gentle nudges to help you stay in tune 💕</p>

          {[
            { field: 'periodReminder', label: 'Period reminder', desc: '2 days before your expected period' },
            { field: 'fertileWindowReminder', label: 'Fertile window reminder', desc: 'When your fertile window begins' },
            { field: 'dailyLogReminder', label: 'Daily log reminder', desc: 'A gentle nudge to log your day' },
          ].map(({ field, label, desc }) => (
            <div key={field} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.6rem 0', borderBottom: '1px solid var(--border-soft)',
            }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{label}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={notifPrefs[field] || false}
                  onChange={(e) => setNotifPrefs((p) => ({ ...p, [field]: e.target.checked }))}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}

          {notifPrefs.dailyLogReminder && (
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label className="form-label">Reminder Time</label>
              <input
                className="form-input"
                type="time"
                value={notifPrefs.dailyLogTime}
                onChange={(e) => setNotifPrefs((p) => ({ ...p, dailyLogTime: e.target.value }))}
              />
            </div>
          )}

          <button
            className="btn btn-secondary"
            style={{ marginTop: '0.75rem' }}
            onClick={handleNotifSave}
            disabled={loadingNotif}
          >
            {loadingNotif ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Cycle history */}
        <div className="card fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.CalendarDays size={20} color="var(--primary)" /> Cycle History
            </h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowCycles((s) => !s)}
            >
              {showCycles ? 'Hide' : 'Show'}
            </button>
          </div>

          {showCycles && (
            <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {cycles.length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No cycles logged yet 🌸</p>
              ) : (
                cycles.map((c) => (
                  <div key={c._id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 0.75rem',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.85rem',
                  }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>
                        {new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {c.endDate && (
                        <span style={{ color: 'var(--text-muted)' }}>
                          {' '}→ {new Date(c.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {c.cycleLength && (
                        <span style={{ color: 'var(--text-light)', marginLeft: '0.5rem' }}>
                          ({c.cycleLength}d cycle)
                        </span>
                      )}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem', color: '#FB7185' }}
                      onClick={() => handleDeleteCycle(c._id)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="card fade-in-up" style={{ animationDelay: '0.3s', borderColor: '#FCA5A5' }}>
          <h3 style={{ fontSize: '1rem', color: '#DC2626', marginBottom: '0.75rem' }}>Account</h3>
          <button className="btn btn-danger btn-full" onClick={logout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Icons.LogOut size={18} /> Log Out
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
