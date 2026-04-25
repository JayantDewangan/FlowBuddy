import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { insightsAPI } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar } from 'recharts';
import { MOODS, SYMPTOM_LABELS } from '../utils/constants';

const MOOD_COLORS = {
  happy: '#86EFAC', calm: '#93C5FD', anxious: '#FCA5A5',
  irritable: '#FCD34D', sad: '#C4B5FD', energetic: '#F9A8D4',
};

export default function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insightsAPI.get()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!data || data.totalCycles === 0) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Icons.Lightbulb color="var(--primary-dark)" size={32} /> Insights</h1>
        </div>
        <div className="page-content">
          <div className="empty-state">
            <div className="empty-state-icon" style={{ color: 'var(--primary)' }}><Icons.Sprout size={64} /></div>
            <h3>Not enough data yet!</h3>
            <p>Log a few cycles and your insights will bloom here 🌸 Keep going — every entry counts!</p>
          </div>
        </div>
      </div>
    );
  }

  const moodChartData = MOODS.map((m) => ({
    name: m.label,
    value: data.moodCount[m.key] || 0,
    color: MOOD_COLORS[m.key],
  })).filter((d) => d.value > 0);

  const cycleLengthData = data.cycleLengths.map((len, i) => ({
    name: `Cycle ${i + 1}`,
    days: len,
  }));

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Icons.Lightbulb color="var(--primary-dark)" size={32} /> Insights</h1>
          <p>Your cycle story, at a glance</p>
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
        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="card card--flat fade-in-up" style={{ background: 'linear-gradient(135deg, var(--surface-2), var(--surface))' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>AVG CYCLE</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)' }}>{data.avgCycleLength}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>days</p>
          </div>
          <div className="card card--flat fade-in-up" style={{ animationDelay: '0.05s', background: 'linear-gradient(135deg, var(--surface-2), var(--surface))' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>AVG PERIOD</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)' }}>{data.avgPeriodLength}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>days</p>
          </div>
          <div className="card card--flat fade-in-up" style={{ animationDelay: '0.1s', background: 'linear-gradient(135deg, var(--surface-2), var(--surface))' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>CYCLES LOGGED</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)' }}>{data.totalCycles}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>total</p>
          </div>
          <div className="card card--flat fade-in-up" style={{ animationDelay: '0.15s', background: 'linear-gradient(135deg, var(--surface-2), var(--surface))' }}>
            <p style={{ fontSize: '0.75rem', color: '#60A5FA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>DAYS LOGGED</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text)' }}>{data.totalLogs}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>entries</p>
          </div>
        </div>

        <div className="desktop-grid">
          <div className="stack">
        {/* Cycle length chart */}
        {cycleLengthData.length > 1 && (
          <div className="card fade-in-up" style={{ animationDelay: '0.2s' }}>
            <p className="section-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.LineChart size={20} color="var(--primary)" /> Cycle Lengths
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={cycleLengthData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Nunito' }} />
                <YAxis tick={{ fontSize: 11, fontFamily: 'Nunito' }} domain={[20, 40]} />
                <Tooltip
                  formatter={(v) => [`${v} days`, 'Cycle length']}
                  contentStyle={{ fontFamily: 'Nunito', borderRadius: 12, border: '1px solid #F3E8FF' }}
                />
                <Bar dataKey="days" radius={[8, 8, 0, 0]}>
                  {cycleLengthData.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? '#C084FC' : '#F9A8D4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
              Average: {data.avgCycleLength} days ✨
            </p>
          </div>
        )}

        {/* Mood breakdown */}
        {moodChartData.length > 0 && (
          <div className="card fade-in-up" style={{ animationDelay: '0.25s' }}>
            <p className="section-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.MessageCircleHeart size={20} color="var(--primary)" /> Mood Patterns
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={moodChartData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'Nunito' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontFamily: 'Nunito' }} width={100} />
                <Tooltip
                  formatter={(v) => [`${v} days`, 'Count']}
                  contentStyle={{ fontFamily: 'Nunito', borderRadius: 12, border: '1px solid #F3E8FF' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {moodChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        </div>
          <div className="stack">

        {/* Top symptoms */}
        {data.topSymptoms.length > 0 && (
          <div className="card fade-in-up" style={{ animationDelay: '0.3s' }}>
            <p className="section-title" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icons.Stethoscope size={20} color="var(--primary)" /> Most Common Symptoms
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {data.topSymptoms.map((s, i) => (
                <div key={s.symptom} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    width: 24, height: 24,
                    borderRadius: '50%',
                    background: 'var(--secondary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 800, color: 'var(--secondary-dark)',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ flex: 1, fontWeight: 600, color: 'var(--text)' }}>
                    {SYMPTOM_LABELS[s.symptom] || s.symptom}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {s.count}x
                  </span>
                  <div style={{
                    height: 6,
                    width: `${Math.max(30, (s.count / data.topSymptoms[0].count) * 80)}px`,
                    background: 'linear-gradient(90deg, var(--secondary), var(--primary))',
                    borderRadius: 'var(--radius-full)',
                  }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not enough data hint */}
        {!data.hasEnoughData && (
          <div className="card card--flat fade-in-up" style={{
            background: 'var(--primary-light)',
            border: 'none',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Icons.Lightbulb size={18} /> Log at least 2 cycles to unlock full pattern insights!
            </p>
          </div>
        )}
        </div>
      </div>
      </div>
    </div>
  );
}
