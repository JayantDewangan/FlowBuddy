import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as Icons from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { circleAPI } from '../api';

const PRIVACY_LABELS = {
  sharePhase: { label: 'Current phase', desc: 'They see your current cycle phase and supportive tips' },
  shareMood: { label: "Today's mood", desc: 'They see a single mood emoji — nothing more' },
  sharePeriodCountdown: { label: 'Period countdown', desc: 'They see a gentle heads-up when your period is near' },
  shareSymptomSummary: { label: 'Symptom summary', desc: 'They see a soft summary like "she might need extra care" — never raw details' },
};

function PrivacyToggle({ field, enabled, onChange }) {
  const config = PRIVACY_LABELS[field];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 0',
      borderBottom: '1px solid var(--border-soft)',
    }}>
      <div style={{ flex: 1, marginRight: '1rem' }}>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>{config.label}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{config.desc}</p>
      </div>
      <label className="toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(field, e.target.checked)}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

export default function TrustedCircle() {
  const { user } = useAuth();
  const [viewers, setViewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState(user?.inviteCode || '');
  const [selectedViewer, setSelectedViewer] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    circleAPI.getViewers()
      .then((res) => setViewers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Invite code copied! 💕');
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied! 🌸');
  };

  const handleRegenerateCode = async () => {
    if (!window.confirm('Regenerating the code will invalidate the old one. Anyone with the old link can no longer join. Continue?')) return;
    try {
      const res = await circleAPI.regenerateInvite();
      setInviteCode(res.data.inviteCode);
      toast.success('New invite code generated 🌸');
    } catch {
      toast.error('Could not regenerate code 💔');
    }
  };

  const handleRelationshipChange = async (relationship) => {
    if (!selectedViewer) return;
    try {
      await circleAPI.updateRelationship(selectedViewer._id, relationship);
      setSelectedViewer((v) => ({ ...v, relationship }));
      setViewers((vs) => vs.map((v) =>
        v._id === selectedViewer._id ? { ...v, relationship } : v
      ));
      toast.success('Relationship updated 💕');
    } catch {
      toast.error('Could not update relationship 💔');
    }
  };

  const handlePrivacyChange = async (field, value) => {
    if (!selectedViewer) return;
    try {
      await circleAPI.updatePrivacy(selectedViewer._id, { [field]: value });
      setSelectedViewer((v) => ({
        ...v,
        privacySettings: { ...v.privacySettings, [field]: value },
      }));
      setViewers((vs) => vs.map((v) =>
        v._id === selectedViewer._id
          ? { ...v, privacySettings: { ...v.privacySettings, [field]: value } }
          : v
      ));
      toast.success('Privacy updated 💕');
    } catch {
      toast.error('Could not update settings 💔');
    }
  };

  const handleRevoke = async (viewerId) => {
    if (!window.confirm('This will permanently remove their access. Are you sure?')) return;
    try {
      await circleAPI.revokeViewer(viewerId);
      setViewers((vs) => vs.filter((v) => v._id !== viewerId));
      setSelectedViewer(null);
      toast.success('Access revoked 💕');
    } catch {
      toast.error('Could not revoke access 💔');
    }
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Icons.Heart color="var(--primary-dark)" size={32} /> Trusted Circle
          </h1>
          <p>Share with the people you love</p>
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
        {/* Invite section */}
        <div className="card fade-in-up" style={{ background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Icons.Link size={24} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Your Invite Code</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Share this with someone you trust</p>
            </div>
          </div>

          <div style={{
            background: 'var(--primary-light)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            textAlign: 'center',
            marginBottom: '0.75rem',
          }}>
            <p style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              letterSpacing: '0.15em',
              color: 'var(--primary-dark)',
              fontFamily: 'monospace',
            }}>
              {inviteCode}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem' }} onClick={handleCopyCode}>
              {copied ? <><Icons.Check size={16} /> Copied!</> : <><Icons.Copy size={16} /> Copy Code</>}
            </button>
            <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem' }} onClick={handleCopyLink}>
              <Icons.Link size={16} /> Copy Link
            </button>
          </div>
          <button
            className="btn btn-ghost btn-full"
            style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
            onClick={handleRegenerateCode}
          >
            <Icons.RefreshCw size={14} /> Generate New Code
          </button>
        </div>
        </div>

          <div className="stack">
        {/* Viewers list */}
        <div className="card fade-in-up" style={{ animationDelay: '0.1s', background: 'linear-gradient(135deg, var(--surface-2), var(--surface))', border: '1px solid var(--border)' }}>
          <p className="section-title" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
            <Icons.Users size={18} color="var(--primary)" /> Your Circle ({viewers.length})
          </p>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem' }}>
              <div className="spinner" />
            </div>
          ) : viewers.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <div style={{ color: 'var(--primary)' }}><Icons.Users size={48} /></div>
              <p>No one in your circle yet. Share your invite code to get started!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {viewers.map((v) => (
                <div
                  key={v._id}
                  onClick={() => setSelectedViewer(v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    background: selectedViewer?._id === v._id ? 'var(--primary-light)' : 'var(--surface-2)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    border: `2px solid ${selectedViewer?._id === v._id ? 'var(--primary)' : 'transparent'}`,
                  }}
                >
                  <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                    {v.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>{v.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{v.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className="badge badge-secondary" style={{ fontSize: '0.6rem', background: 'var(--primary-dark)', color: 'white', textTransform: 'uppercase' }}>
                      {v.relationship || 'Friend'}
                    </span>
                    {Object.entries(v.privacySettings || {}).filter(([,val]) => val).map(([key]) => (
                      <span key={key} className="badge badge-primary" style={{ fontSize: '0.6rem' }}>
                        {PRIVACY_LABELS[key]?.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy settings for selected viewer */}
        {selectedViewer && (
          <div className="card fade-in-up" style={{ border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(30, 21, 50, 0.8), rgba(21, 14, 35, 0.9))', boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
                <Icons.Settings size={18} color="var(--primary)" /> Privacy for {selectedViewer.name}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedViewer(null)}><Icons.X size={18} /></button>
            </div>
            {/* Relationship Tagging */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '1px' }}>
                Tag Relationship
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['boyfriend', 'husband', 'parent', 'doctor', 'friend'].map(rel => (
                  <button
                    key={rel}
                    onClick={() => handleRelationshipChange(rel)}
                    className="badge"
                    style={{
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      border: '1px solid var(--primary)',
                      background: selectedViewer.relationship === rel ? 'var(--primary)' : 'transparent',
                      color: selectedViewer.relationship === rel ? 'white' : 'var(--primary)',
                      textTransform: 'capitalize',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '1px' }}>
              Privacy Settings
            </p>
            {Object.keys(PRIVACY_LABELS).map((field) => (
              <PrivacyToggle
                key={field}
                field={field}
                enabled={selectedViewer.privacySettings?.[field] || false}
                onChange={handlePrivacyChange}
              />
            ))}

            <button
              className="btn btn-danger btn-full"
              style={{ marginTop: '1rem', fontSize: '0.85rem' }}
              onClick={() => handleRevoke(selectedViewer._id)}
            >
              <Icons.UserMinus size={16} /> Remove from Circle
            </button>
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  );
}
