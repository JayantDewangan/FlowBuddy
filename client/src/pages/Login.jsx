import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { login, requestOtp, verifyOtp, googleLogin } = useAuth();
  const navigate = useNavigate();
  
  const [method, setMethod] = useState('otp'); // 'password' or 'otp'
  const [form, setForm] = useState({ email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      toast.success('Welcome back! 🌸');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong 💔');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!form.email) return toast.error('Please enter your email 🌸');
    setLoading(true);
    try {
      await requestOtp({ email: form.email });
      setOtpSent(true);
      toast.success('OTP sent to your email! 💌');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send OTP 💔');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!form.otp) return toast.error('Please enter the OTP 🌸');
    setLoading(true);
    try {
      const res = await verifyOtp({ email: form.email, otp: form.otp });
      if (res.isNewUser) {
        toast('We need a bit more info to create your account! 💕', { icon: '🌸' });
        // Redirect to register with OTP pre-filled or handled
        navigate('/register', { state: { email: form.email, otp: form.otp } });
      } else {
        toast.success('Welcome back! 🌸');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP 💔');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin({ credential: credentialResponse.credential });
      toast.success('Welcome back! 🌸');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google login failed 💔');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
    }}>
      <div className="fade-in-up" style={{ width: '100%', maxWidth: 400 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}><Icons.Flower2 size={48} /></div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Welcome back!</h1>
          <p>So happy to see you again</p>
        </div>

        {/* Method Toggle */}
        <div style={{ display: 'flex', marginBottom: '1.5rem', background: 'var(--surface-2)', padding: '0.25rem', borderRadius: 'var(--radius)' }}>
          <button
            onClick={() => { setMethod('otp'); setOtpSent(false); setForm({...form, otp: ''}); }}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: 'calc(var(--radius) - 4px)',
              background: method === 'otp' ? 'var(--primary)' : 'transparent',
              color: method === 'otp' ? 'var(--surface)' : 'var(--text-muted)',
              border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Email Code
          </button>
          <button
            onClick={() => setMethod('password')}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: 'calc(var(--radius) - 4px)',
              background: method === 'password' ? 'var(--primary)' : 'transparent',
              color: method === 'password' ? 'var(--surface)' : 'var(--text-muted)',
              border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Password
          </button>
        </div>

        {/* Form */}
        <div className="card">
          {method === 'password' ? (
            <form onSubmit={handlePasswordLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading ? <><Icons.Loader2 size={18} className="spinner" style={{width:18, height:18, border:'none'}} /> Logging in...</> : <><Icons.LogIn size={18} /> Log In</>}
              </button>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={otpSent}
                  required
                />
              </div>
              {otpSent && (
                <div className="form-group fade-in-up">
                  <label className="form-label">6-Digit Code</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="123456"
                    value={form.otp}
                    onChange={(e) => setForm({ ...form, otp: e.target.value })}
                    required
                  />
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading ? <><Icons.Loader2 size={18} className="spinner" style={{width:18, height:18, border:'none'}} /> Please wait...</> : otpSent ? <><Icons.Check size={18} /> Verify Code</> : <><Icons.Send size={18} /> Send Code</>}
              </button>
            </form>
          )}

          <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed 💔')}
              theme="filled_black"
              shape="pill"
            />
          </div>
        </div>

        {/* Links */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ fontSize: '0.9rem' }}>
            New here?{' '}
            <Link to="/register" style={{ fontWeight: 700 }}>Create an account</Link>
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
            Got an invite code?{' '}
            <Link to="/join/enter" style={{ fontWeight: 700 }}>Join as a viewer</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
