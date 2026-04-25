import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { insightsAPI } from '../api';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TYPE_STYLES = {
  period:    { bg: 'rgba(236, 72, 153, 0.2)', label: 'Period', text: '#F9A8D4', border: '1px solid #EC4899' },
  fertile:   { bg: 'rgba(167, 139, 250, 0.2)', label: 'Fertile window', text: '#D8B4FE', border: '1px solid #8B5CF6' },
  ovulation: { bg: 'rgba(168, 85, 247, 0.3)', label: 'Ovulation', text: '#F3E8FF', border: '1px solid #C084FC', glow: true },
  predicted: { bg: 'transparent', label: 'Predicted period', text: '#F9A8D4', border: '1px dashed #EC4899' },
  empty:     { bg: 'var(--surface)', label: '', text: 'inherit', border: '1px solid var(--border)' },
};

export default function CalendarView() {
  const navigate = useNavigate();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [calData, setCalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    setLoading(true);
    insightsAPI.getCalendar(month, year)
      .then((res) => setCalData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [month, year]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getKey = (d) => {
    const date = new Date(year, month, d);
    return date.toISOString().split('T')[0];
  };

  const isToday = (d) => {
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Icons.CalendarDays color="var(--primary-dark)" size={32} /> Calendar
          </h1>
          <p>Your cycle at a glance</p>
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
        <div className="desktop-grid">
          <div className="stack">
            {/* Month navigation */}
            <div className="card" style={{ padding: '1.5rem', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <button className="btn btn-ghost btn-sm" onClick={prevMonth}><Icons.ChevronLeft size={24} color="var(--primary)"/></button>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, background: 'linear-gradient(to right, #C084FC, #F9A8D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {MONTHS[month]} {year}
                </h3>
                <button className="btn btn-ghost btn-sm" onClick={nextMonth}><Icons.ChevronRight size={24} color="var(--primary)" /></button>
              </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAYS.map((d) => (
              <div key={d} style={{
                textAlign: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-light)',
                padding: '4px 0',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
              {cells.map((d, i) => {
                if (!d) return <div key={`empty-${i}`} />;
                const key = getKey(d);
                const dayData = calData[key] || { type: 'empty' };
                const style = TYPE_STYLES[dayData.type] || TYPE_STYLES.empty;
                const today_ = isToday(d);

                return (
                  <div
                    key={d}
                    onClick={() => setSelectedDay({ d, key, dayData })}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--radius)',
                      background: selectedDay?.d === d ? 'var(--primary)' : style.bg,
                      border: today_ ? '2px solid var(--primary-dark)' : style.border,
                      boxShadow: style.glow || (selectedDay?.d === d) ? '0 0 15px rgba(168, 85, 247, 0.4)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      transform: selectedDay?.d === d ? 'scale(1.05)' : 'none',
                    }}
                  >
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: today_ ? 800 : 600,
                      color: style.text !== 'inherit' ? style.text : today_ ? 'var(--primary-dark)' : 'var(--text)',
                    }}>
                      {d}
                    </span>
                    {dayData.hasLog && (
                      <div style={{
                        position: 'absolute',
                        bottom: 2,
                        width: 4, height: 4,
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        opacity: 0.6,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
            </div>
          </div>
          <div className="stack">
            {/* Selected day detail */}
            <div className="card fade-in-up" style={{ background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', minHeight: '200px' }}>
              {selectedDay ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {MONTHS[month]} {selectedDay.d}, {year}
                      </p>
                      {selectedDay.dayData.type !== 'empty' && (
                        <div style={{
                          display: 'inline-block',
                          marginTop: '0.5rem',
                          padding: '0.3rem 0.8rem',
                          borderRadius: 'var(--radius)',
                          background: TYPE_STYLES[selectedDay.dayData.type]?.bg,
                          color: TYPE_STYLES[selectedDay.dayData.type]?.text,
                          border: TYPE_STYLES[selectedDay.dayData.type]?.border,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                        }}>
                          {TYPE_STYLES[selectedDay.dayData.type]?.label}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedDay.dayData.mood ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span style={{ padding: '0.5rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}>
                        <Icons.Smile size={24} color="var(--primary-dark)" />
                      </span>
                      <p style={{ fontSize: '1rem', color: 'var(--text)', fontWeight: 600, textTransform: 'capitalize' }}>
                        Mood: {selectedDay.dayData.mood}
                      </p>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1rem' }}>No mood logged</p>
                  )}
                  
                  {selectedDay.dayData.hasLog && (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      onClick={() => navigate(`/log?date=${selectedDay.key}`)}
                    >
                      <Icons.FileText size={18} /> View Full Log
                    </button>
                  )}
                  {selectedDay.dayData.type === 'empty' && !selectedDay.dayData.hasLog && (
                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No data for this day.</p>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', opacity: 0.7 }}>
                  <Icons.MousePointerClick size={48} style={{ marginBottom: '1rem' }} />
                  <p>Select a day to view details</p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="card card--flat" style={{ padding: '1.25rem', border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--text)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Legend</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(TYPE_STYLES).filter(([k]) => k !== 'empty').map(([key, style]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '4px',
                      background: style.bg,
                      border: style.border,
                      boxShadow: style.glow ? '0 0 10px rgba(168, 85, 247, 0.4)' : 'none'
                    }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{style.label}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '4px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Has log</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
