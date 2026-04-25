import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import * as Icons from 'lucide-react';
import { logAPI } from '../api';
import { MOODS, SYMPTOMS, FLOW_INTENSITIES, todayISO } from '../utils/constants';

const Icon = ({ name, size = 24, ...props }) => {
  const LucideIcon = Icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} {...props} />;
};

export default function DailyLog() {
  const [searchParams] = useSearchParams();
  const initialDate = searchParams.get('date') || todayISO();
  const [date, setDate] = useState(initialDate);
  const [form, setForm] = useState({
    mood: null,
    symptoms: [],
    flowIntensity: null,
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing log for selected date
  useEffect(() => {
    setFetching(true);
    setSaved(false);
    logAPI.getAll({ date })
      .then((res) => {
        if (res.data[0]) {
          const log = res.data[0];
          setForm({
            mood: log.mood || null,
            symptoms: log.symptoms || [],
            flowIntensity: log.flowIntensity || null,
            note: log.note || '',
          });
          setSaved(true);
        } else {
          setForm({ mood: null, symptoms: [], flowIntensity: null, note: '' });
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [date]);

  const toggleSymptom = (key) => {
    setForm((f) => ({
      ...f,
      symptoms: f.symptoms.includes(key)
        ? f.symptoms.filter((s) => s !== key)
        : [...f.symptoms, key],
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await logAPI.upsert({ date, ...form });
      setSaved(true);
      toast.success('Log saved! 💕');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save 💔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Icon name="PenLine" color="var(--primary-dark)" size={32} /> Daily Log
          </h1>
          <p>How are you feeling today?</p>
        </div>
        <button 
          className="btn btn-ghost" 
          onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
          style={{ padding: '0.5rem', color: 'var(--text-muted)' }}
        >
          <Icons.LogOut size={22} />
        </button>
      </div>

      <div className="page-content">
        {/* Date picker */}
        <div className="card card--flat fade-in-up">
          <label className="form-label">Which day are you logging?</label>
          <input
            className="form-input"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {fetching ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : (
          <div className="desktop-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Mood */}
              <div className="card fade-in-up" style={{ animationDelay: '0.05s', background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', border: '1px solid var(--border)' }}>
                <p className="section-title" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon name="Smile" size={20} color="var(--primary)" /> Mood
                </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {MOODS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setForm((f) => ({ ...f, mood: f.mood === m.key ? null : m.key }))}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius)',
                      border: '2px solid',
                      borderColor: form.mood === m.key ? 'var(--primary)' : 'var(--border)',
                      background: form.mood === m.key ? 'var(--primary-light)' : 'var(--surface-2)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontFamily: 'Nunito, sans-serif',
                    }}
                  >
                    <span style={{ color: form.mood === m.key ? 'var(--primary-dark)' : 'var(--text-light)' }}>
                      <Icon name={m.icon} size={28} />
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: form.mood === m.key ? 'var(--primary-dark)' : 'var(--text-muted)',
                    }}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

              {/* Symptoms */}
              <div className="card fade-in-up" style={{ animationDelay: '0.1s', background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', border: '1px solid var(--border)' }}>
                <p className="section-title" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Icon name="Stethoscope" size={20} color="var(--primary)" /> Symptoms
                </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SYMPTOMS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => toggleSymptom(s.key)}
                    className={`pill symptom-pill ${form.symptoms.includes(s.key) ? 'active' : ''}`}
                  >
                    <Icon name={s.icon} size={16} /> {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="stack">
            {/* Flow Intensity */}
            <div className="card fade-in-up" style={{ animationDelay: '0.15s', background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', border: '1px solid var(--border)' }}>
              <p className="section-title" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="Droplets" size={20} color="#EC4899" /> Flow Intensity
              </p>
              <div style={{
                display: 'flex',
                gap: '0.6rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
              }}>
                {FLOW_INTENSITIES.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setForm((prev) => ({ ...prev, flowIntensity: prev.flowIntensity === f.key ? null : f.key }))}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius)',
                      border: '2px solid',
                      borderColor: form.flowIntensity === f.key ? 'var(--secondary)' : 'var(--border)',
                      background: form.flowIntensity === f.key ? 'var(--secondary-light)' : 'var(--surface-2)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                      fontFamily: 'Nunito, sans-serif',
                      minWidth: 64,
                    }}
                  >
                    <span style={{ color: form.flowIntensity === f.key ? 'var(--secondary-dark)' : 'var(--text-light)' }}>
                      <Icon name={f.icon} size={24} />
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: form.flowIntensity === f.key ? 'var(--secondary-dark)' : 'var(--text-muted)',
                    }}>
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="card fade-in-up" style={{ animationDelay: '0.2s', background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', border: '1px solid var(--border)' }}>
              <p className="section-title" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon name="PenTool" size={20} color="var(--primary)" /> Notes (optional)
              </p>
              <textarea
                className="form-input"
                placeholder="Anything else on your mind? This is your space 💕"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                rows={3}
                maxLength={1000}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.3rem', textAlign: 'right' }}>
                {form.note.length}/1000
              </p>
            </div>

            {/* Save button */}
            <button
              className="btn btn-primary btn-full fade-in-up"
              style={{ animationDelay: '0.25s' }}
              onClick={handleSave}
              disabled={loading}
            >
              <Icon name={saved ? "CheckCircle" : "Save"} size={18} /> 
              {loading ? 'Saving...' : saved ? 'Update Log' : 'Save Log'}
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
