'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AdminEmployeeProfile({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const employeeIdParam = unwrappedParams.id;

  const [adminUser, setAdminUser] = useState(null);
  const [targetEmployee, setTargetEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Fields (Target Employee)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  
  // Job Details
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [status, setStatus] = useState('Active');

  // Salary Structure
  const [basic, setBasic] = useState(0);
  const [hra, setHra] = useState(0);
  const [lta, setLta] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [deductions, setDeductions] = useState(0);

  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Verify admin session
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();
        
        if (!sessionData.user || sessionData.user.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setAdminUser(sessionData.user);

        // 2. Fetch all employees to find target
        const empRes = await fetch('/api/employees');
        if (empRes.ok) {
          const empData = await empRes.json();
          const target = empData.find(e => e.employeeId === employeeIdParam);
          
          if (!target) {
            setError('Employee record not found');
            setLoading(false);
            return;
          }

          setTargetEmployee(target);
          setName(target.name || '');
          setPhone(target.phone || '');
          setAddress(target.address || '');
          setProfilePicture(target.profilePicture || '');

          setTitle(target.jobDetails?.title || '');
          setDepartment(target.jobDetails?.department || '');
          setJoiningDate(target.jobDetails?.joiningDate || '');
          setStatus(target.jobDetails?.status || 'Active');

          setBasic(target.salaryStructure?.basic || 0);
          setHra(target.salaryStructure?.hra || 0);
          setLta(target.salaryStructure?.lta || 0);
          setAllowances(target.salaryStructure?.allowances || 0);
          setDeductions(target.salaryStructure?.deductions || 0);
        } else {
          setError('Failed to fetch employee directories');
        }
      } catch (err) {
        console.error('Admin profile view load error:', err);
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, employeeIdParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        employeeId: employeeIdParam,
        name,
        phone,
        address,
        profilePicture,
        jobDetails: {
          title,
          department,
          joiningDate,
          status
        },
        salaryStructure: {
          basic: Number(basic),
          hra: Number(hra),
          lta: Number(lta),
          allowances: Number(allowances),
          deductions: Number(deductions)
        }
      };

      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setTargetEmployee(data.user);
        setMessage('Employee details updated successfully!');
      } else {
        setError(data.error || 'Failed to update employee details');
      }
    } catch (err) {
      setError('An error occurred while saving.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateNetSalary = () => {
    return Number(basic) + Number(hra) + Number(lta) + Number(allowances) - Number(deductions);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Fetching employee record...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar user={adminUser} />

      <main className="main-content animate-fade-in">
        <header style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
          <button 
            onClick={() => router.push('/dashboard')}
            className="btn btn-outline"
            style={{ padding: '8px 12px' }}
          >
            ← Back
          </button>
          <div>
            <h1>Manage Employee Profile</h1>
            <p>Modify organizational values, salary allocations, and contract status for <strong style={{ color: 'var(--text-primary)' }}>{name}</strong>.</p>
          </div>
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

        {targetEmployee && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            {/* Left Column: Personal and Job Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h2>Personal & Contact Details</h2>
                
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="glass-input-group">
                    <label className="glass-label">Employee ID</label>
                    <input type="text" className="glass-input" disabled value={employeeIdParam} style={{ opacity: 0.7 }} />
                  </div>

                  <div className="glass-input-group">
                    <label className="glass-label">Full Name</label>
                    <input type="text" className="glass-input" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="glass-input-group">
                    <label className="glass-label">Contact Number</label>
                    <input type="tel" className="glass-input" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>

                  <div className="glass-input-group">
                    <label className="glass-label">Home Address</label>
                    <input type="text" className="glass-input" required value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '30px' }}>
                <h2>Organizational Job Details</h2>
                
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="glass-input-group">
                    <label className="glass-label">Job Title</label>
                    <input type="text" className="glass-input" required value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>

                  <div className="glass-input-group">
                    <label className="glass-label">Department</label>
                    <input type="text" className="glass-input" required value={department} onChange={(e) => setDepartment(e.target.value)} />
                  </div>

                  <div className="glass-input-group">
                    <label className="glass-label">Joining Date</label>
                    <input type="date" className="glass-input" required value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} />
                  </div>

                  <div className="glass-input-group">
                    <label className="glass-label">Employment Status</label>
                    <select className="glass-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Active">Active</option>
                      <option value="Terminated">Terminated</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Salary Settings and Submit */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h2>Salary & Payroll Breakdown</h2>
                
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="glass-input-group">
                    <label className="glass-label">Basic Pay ($)</label>
                    <input type="number" className="glass-input" required value={basic} onChange={(e) => setBasic(e.target.value)} />
                  </div>

                  <div className="glass-input-group">
                    <label className="glass-label">HRA ($)</label>
                    <input type="number" className="glass-input" required value={hra} onChange={(e) => setHra(e.target.value)} />
                  </div>

                  <div className="glass-input-group">
                    <label className="glass-label">LTA ($)</label>
                    <input type="number" className="glass-input" required value={lta} onChange={(e) => setLta(e.target.value)} />
                  </div>

                  <div className="glass-input-group">
                    <label className="glass-label">Allowances ($)</label>
                    <input type="number" className="glass-input" required value={allowances} onChange={(e) => setAllowances(e.target.value)} />
                  </div>

                  <div className="glass-input-group" style={{ gridColumn: 'span 2' }}>
                    <label className="glass-label">Deductions / Taxes ($)</label>
                    <input type="number" className="glass-input" required value={deductions} onChange={(e) => setDeductions(e.target.value)} />
                  </div>
                </div>

                <div style={{
                  borderTop: '1px solid var(--border-light)', marginTop: '24px', paddingTop: '20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Computed Net Monthly Take-Home</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>
                      ${calculateNetSalary().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '16px' }}
                >
                  {submitting ? 'Saving record details...' : 'Apply & Save Settings'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="btn btn-outline"
                  style={{ width: '100%', padding: '14px' }}
                >
                  Cancel edits
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
