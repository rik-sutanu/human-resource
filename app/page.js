'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('employee');
  
  // UI States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if session is already active
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data.user) {
          router.push('/dashboard');
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setLoading(false);
      }
    }
    checkSession();
  }, [router]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to authenticate');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          email,
          password,
          role,
          name,
          phone,
          address
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to register');
      } else {
        setSuccess('Registration successful! Please sign in.');
        setIsLogin(true);
        // Clean fields
        setEmployeeId('');
        setPassword('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(0, 242, 254, 0.1)',
          borderTopColor: '#00f2fe',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Syncing HR Portal...</p>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflowY: 'auto'
    }}>
      <div className="animate-fade-in" style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        width: '100%',
        maxWidth: '1200px',
        gap: '60px',
        alignItems: 'center',
        padding: '20px'
      }}>
        {/* Left column info/branding */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-light)',
              marginBottom: '20px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38ef7d' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Enterprise Suite v2.4</span>
            </div>
            <h1 style={{ fontSize: '3.5rem', lineHeight: '1.1', marginBottom: '16px' }}>
              Human Resource<br />Management System
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '500px' }}>
              Every workday, perfectly aligned. Streamline onboarding, profiles, check-ins, and leaves in a unified interface.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', background: 'var(--grad-primary)',
                display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: '#070913', fontWeight: 800, fontSize: '1.25rem'
              }}>
                ✓
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '2px' }}>Role-Based Access Control</h4>
                <p style={{ fontSize: '0.9rem' }}>Dedicated profiles and permissions for HR Officers and Employees.</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', background: 'var(--grad-secondary)',
                display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '1.25rem'
              }}>
                🕒
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '2px' }}>Attendance & Leaves Tracker</h4>
                <p style={{ fontSize: '0.9rem' }}>One-click check-in/out and calendar leaf planning with automated workflows.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column form */}
        <div className={`glass-panel ${isLogin ? 'primary-glow' : 'secondary-glow'}`} style={{
          padding: '40px 32px',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-glow)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 800 }}>
            {isLogin ? 'Sign In' : 'Register Account'}
          </h2>
          <p style={{ marginBottom: '30px', fontSize: '0.95rem' }}>
            {isLogin ? 'Enter credentials to access your portal' : 'Submit details to request employee setup'}
          </p>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', background: 'rgba(255, 88, 88, 0.1)',
              border: '1px solid rgba(255, 88, 88, 0.2)', color: 'var(--color-warning)', fontSize: '0.9rem', marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px 16px', borderRadius: '10px', background: 'rgba(56, 239, 125, 0.1)',
              border: '1px solid rgba(56, 239, 125, 0.2)', color: 'var(--color-success)', fontSize: '0.9rem', marginBottom: '20px'
            }}>
              {success}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="glass-input-group">
                <label className="glass-label">Corporate Email</label>
                <input
                  type="email"
                  className="glass-input"
                  required
                  placeholder="name@hrms.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="glass-input-group" style={{ marginBottom: '24px' }}>
                <label className="glass-label">Password</label>
                <input
                  type="password"
                  className="glass-input"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', marginBottom: '20px' }}
              >
                {submitting ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="glass-input-group" style={{ gridColumn: 'span 2' }}>
                <label className="glass-label">Full Name</label>
                <input
                  type="text"
                  className="glass-input"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-label">Employee ID</label>
                <input
                  type="text"
                  className="glass-input"
                  required
                  placeholder="EMP-003"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-label">Role</label>
                <select
                  className="glass-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">HR / Admin</option>
                </select>
              </div>

              <div className="glass-input-group" style={{ gridColumn: 'span 2' }}>
                <label className="glass-label">Corporate Email</label>
                <input
                  type="email"
                  className="glass-input"
                  required
                  placeholder="name@hrms.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-label">Phone</label>
                <input
                  type="tel"
                  className="glass-input"
                  placeholder="+1 (555) 0123"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-label">Password</label>
                <input
                  type="password"
                  className="glass-input"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="glass-input-group" style={{ gridColumn: 'span 2', marginBottom: '24px' }}>
                <label className="glass-label">Home Address</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="123 Main St, City, Country"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-secondary"
                style={{ width: '100%', gridColumn: 'span 2', padding: '14px', marginBottom: '20px' }}
              >
                {submitting ? 'Registering...' : 'Register Employee'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {isLogin ? "New to the company?" : "Already have an account?"}
            </span>{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              style={{
                background: 'none', border: 'none', color: 'var(--color-primary)',
                fontFamily: 'var(--font-display)', fontWeight: 700, cursor: 'pointer', outline: 'none'
              }}
            >
              {isLogin ? 'Register Here' : 'Login Here'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Small inline responsive media queries */}
      <style jsx>{`
        @media (max-width: 992px) {
          div.animate-fade-in {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
      `}</style>
    </main>
  );
}
