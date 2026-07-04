'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Editable fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  
  // Document upload state
  const [docName, setDocName] = useState('');
  
  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        
        if (!data.user) {
          router.push('/');
        } else {
          setUser(data.user);
          setPhone(data.user.phone || '');
          setAddress(data.user.address || '');
          setProfilePicture(data.user.profilePicture || '');
          setLoading(false);
        }
      } catch (err) {
        console.error('Load profile error:', err);
        router.push('/');
      }
    }
    loadProfile();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.employeeId,
          phone,
          address,
          profilePicture
        })
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setMessage('Profile updated successfully!');
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docName.trim()) return;

    try {
      const updatedDocs = [
        ...(user.documents || []),
        {
          name: docName,
          uploadDate: new Date().toISOString().split('T')[0],
          url: '#'
        }
      ];

      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.employeeId,
          documents: updatedDocs
        })
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setDocName('');
        setMessage('Document logged successfully!');
      } else {
        setError(data.error || 'Failed to add document');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to add document.');
    }
  };

  const calculateNetSalary = (sal) => {
    if (!sal) return 0;
    return (sal.basic || 0) + (sal.hra || 0) + (sal.lta || 0) + (sal.allowances || 0) - (sal.deductions || 0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar user={user} />

      <main className="main-content animate-fade-in">
        <header style={{ marginBottom: '40px' }}>
          <h1>My Profile</h1>
          <p>Manage your contact details, view job parameters, and review your salary metrics.</p>
        </header>

        {message && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px', background: 'rgba(56, 239, 125, 0.1)',
            border: '1px solid rgba(56, 239, 125, 0.2)', color: 'var(--color-success)', fontSize: '0.9rem', marginBottom: '20px'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: '10px', background: 'rgba(255, 88, 88, 0.1)',
            border: '1px solid rgba(255, 88, 88, 0.2)', color: 'var(--color-warning)', fontSize: '0.9rem', marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Contact Details Form */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h2>Personal Information</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div className="glass-input-group">
                <label className="glass-label">Full Name</label>
                <input
                  type="text"
                  className="glass-input"
                  disabled
                  value={user.name}
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-label">Employee ID</label>
                <input
                  type="text"
                  className="glass-input"
                  disabled
                  value={user.employeeId}
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-label">Corporate Email</label>
                <input
                  type="text"
                  className="glass-input"
                  disabled
                  value={user.email}
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              <div className="glass-input-group">
                <label className="glass-label">Contact Number</label>
                <input
                  type="tel"
                  className="glass-input"
                  required
                  placeholder="+1 (555) 0123"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="glass-input-group" style={{ marginBottom: '24px' }}>
                <label className="glass-label">Home Address</label>
                <input
                  type="text"
                  className="glass-input"
                  required
                  placeholder="Address, City, Country"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {submitting ? 'Updating...' : 'Save Contact Details'}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Job and Salary details */}
            <div className="glass-card primary-glow" style={{ padding: '30px' }}>
              <h2>Job Assignment</h2>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Corporate Role</span>
                  <span style={{ fontWeight: 700 }}>{user.jobDetails?.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Department</span>
                  <span>{user.jobDetails?.department}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Joining Date</span>
                  <span>{user.jobDetails?.joiningDate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Employment Status</span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>{user.jobDetails?.status}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800 }}>
                  <span style={{ color: 'var(--text-primary)' }}>Monthly Net Salary</span>
                  <span style={{ color: 'var(--color-primary)' }}>${calculateNetSalary(user.salaryStructure).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Documents Log */}
            <div className="glass-panel" style={{ padding: '30px' }}>
              <h2>Corporate Documents</h2>
              
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!user.documents || user.documents.length === 0 ? (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No documents uploaded.</p>
                ) : (
                  user.documents.map((doc, idx) => (
                    <div key={idx} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)'
                    }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{doc.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{doc.uploadDate}</span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddDocument} style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <input
                  type="text"
                  placeholder="Document Name (e.g. Degree Certificate)"
                  className="glass-input"
                  style={{ flex: 1, fontSize: '0.85rem', padding: '10px' }}
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
                <button type="submit" className="btn btn-outline" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                  Log File
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
