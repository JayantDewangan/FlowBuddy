import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const { register, verifyOtp, googleLogin } = useAuth();
  const location = useLocation();
  
  const [form, setForm] = useState({ 
    name: '', 
    email: location.state?.email || '', 
    password: '',
    otp: location.state?.otp || ''
  });
  
  const [isOtpRegistration, setIsOtpRegistration] = useState(!!location.state?.otp);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isOtpRegistration) {
      setLoading(true);
      try {
        await verifyOtp({ email: form.email, otp: form.otp, name: form.name, isRegistering: true });
        toast.success("You're in! Welcome to FlowBuddy 🌸");
      } catch (err) {
        toast.error(err.response?.data?.message || 'Something went wrong 💔');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password needs to be at least 6 characters 🌸');
      return;
    }
    
    setLoading(true);
    try {
      await register(form);
      toast.success("You're in! Welcome to FlowBuddy 🌸");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong 💔');
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
          <div style={{ color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}><Icons.Heart size={48} /></div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Let's get started!</h1>
          <p>Your cycle journey begins here</p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="What should we call you?"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isOtpRegistration}
                required
              />
            </div>
            
            {!isOtpRegistration && (
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            )}
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Icons.Lock size={14} /> Your health data is private and belongs only to you.
            </p>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? <><Icons.Loader2 size={18} className="spinner" style={{width:18, height:18, border:'none'}} /> Creating your account...</> : <><Icons.UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          {!isOtpRegistration && (
            <>
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
                  text="signup_with"
                />
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 700 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
