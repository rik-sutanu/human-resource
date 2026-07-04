'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard states
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  
  // Checking in/out status for employee
  const [todayRecord, setTodayRecord] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  // Admin leave approval states
  const [adminComments, setAdminComments] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const fetchData = useCallback(async (currentUser) => {
    try {
      // 1. Fetch attendance (both roles can query this, returns personal or all depending on backend validation)
      const attRes = await fetch('/api/attendance');
      if (attRes.ok) {
        const attData = await attRes.json();
        setAttendance(attData);
        
        // Find today's check-in/out for current employee
        const todayDate = new Date().toLocaleDateString('en-CA');
        const todayRec = attData.find(
          r => r.employeeId === currentUser.employeeId && r.date === todayDate
        );
        setTodayRecord(todayRec || null);
      }

      // 2. Fetch leaves
      const leavesRes = await fetch('/api/leaves');
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeaves(leavesData);
      }

      // 3. Fetch employees (only if admin)
      if (currentUser.role === 'admin') {
        const empRes = await fetch('/api/employees');
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(empData);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    async function initDashboard() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        
        if (!data.user) {
          router.push('/');
        } else {
          setUser(data.user);
          await fetchData(data.user);
          setLoading(false);
        }
      } catch (err) {
        console.error('Init dashboard error:', err);
        router.push('/');
      }
    }
    initDashboard();
  }, [router, fetchData]);

  const handleCheckAction = async (action) => {
    setCheckLoading(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        await fetchData(user);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update attendance');
      }
    } catch (err) {
      console.error('Attendance submit error:', err);
    } finally {
      setCheckLoading(false);
    }
  };

  const handleLeaveApproval = async (leaveId, status) => {
    setActionLoading(prev => ({ ...prev, [leaveId]: true }));
    try {
      const comment = adminComments[leaveId] || '';
      const res = await fetch('/api/leaves', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leaveId, status, adminComment: comment })
      });
      
      if (res.ok) {
        // Clear comment
        setAdminComments(prev => {
          const copy = { ...prev };
          delete copy[leaveId];
          return copy;
        });
        await fetchData(user);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update leave');
      }
    } catch (err) {
      console.error('Leave action error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Loading Portal Workspace...</p>
      </div>
    );
  }

  // Derived Admin stats
  const totalEmployees = employees.length;
  const todayDateStr = new Date().toLocaleDateString('en-CA');
  const presentToday = attendance.filter(r => r.date === todayDateStr && r.status === 'Present').length;
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;

  return (
    <div className="app-container">
      <Sidebar user={user} />

      <main className="main-content animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1>Dashboard</h1>
            <p style={{ fontSize: '1.05rem' }}>Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong>. Here is your overview for today.</p>
          </div>
          <div className="glass-panel" style={{ padding: '10px 20px', fontSize: '0.9rem', fontWeight: 600 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {user.role === 'admin' ? (
          /* ======================================================== */
          /* ==================== ADMIN DASHBOARD =================== */
          /* ======================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              <div className="glass-card primary-glow" style={{ position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>Total Headcount</h3>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{totalEmployees}</span>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Registered company accounts</p>
              </div>

              <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', borderLeft: '3px solid var(--color-success)' }}>
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>Present Today</h3>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-success)' }}>{presentToday}</span>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Employees checked-in today</p>
              </div>

              <div className="glass-card secondary-glow" style={{ position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px' }}>Pending Approvals</h3>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-secondary)' }}>{pendingLeaves}</span>
                <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Leave requests awaiting review</p>
              </div>
            </div>

            {/* Main content columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
              {/* Employee Directory */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>Employee Directory</h2>
                  <Link href="/" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    + Onboard Employee
                  </Link>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                        <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Employee ID</th>
                        <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Name</th>
                        <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Title & Dept</th>
                        <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                        <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(emp => (
                        <tr key={emp.employeeId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '16px 10px', fontWeight: 700, fontSize: '0.9rem' }}>{emp.employeeId}</td>
                          <td style={{ padding: '16px 10px', fontWeight: 600 }}>{emp.name}</td>
                          <td style={{ padding: '16px 10px' }}>
                            <div style={{ fontSize: '0.9rem' }}>{emp.jobDetails?.title || 'Staff'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{emp.jobDetails?.department || 'Operations'}</div>
                          </td>
                          <td style={{ padding: '16px 10px' }}>
                            <span style={{
                              padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                              background: emp.jobDetails?.status === 'Active' ? 'rgba(56, 239, 125, 0.1)' : 'rgba(255, 88, 88, 0.1)',
                              color: emp.jobDetails?.status === 'Active' ? 'var(--color-success)' : 'var(--color-warning)'
                            }}>
                              {emp.jobDetails?.status || 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 10px', textAlign: 'right' }}>
                            <button
                              onClick={() => router.push(`/profile/${emp.employeeId}`)}
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h2>Pending Approvals</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                  {leaves.filter(l => l.status === 'Pending').length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
                      <p>All leaves caught up!</p>
                    </div>
                  ) : (
                    leaves.filter(l => l.status === 'Pending').map(l => (
                      <div key={l.id} className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontWeight: 700 }}>{l.employeeName}</span>
                          <span style={{
                            fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600,
                            background: 'rgba(0, 242, 254, 0.1)', color: 'var(--color-primary)'
                          }}>
                            {l.type} Leave
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <strong>Dates:</strong> {l.startDate} to {l.endDate}
                        </p>
                        {l.remarks && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
                            "{l.remarks}"
                          </p>
                        )}
                        
                        <div className="glass-input-group" style={{ marginBottom: '12px' }}>
                          <input
                            type="text"
                            placeholder="Add administrative comment..."
                            className="glass-input"
                            style={{ fontSize: '0.8rem', padding: '8px' }}
                            value={adminComments[l.id] || ''}
                            onChange={(e) => setAdminComments(prev => ({ ...prev, [l.id]: e.target.value }))}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            disabled={actionLoading[l.id]}
                            onClick={() => handleLeaveApproval(l.id, 'Approved')}
                            className="btn btn-success"
                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                          >
                            Approve
                          </button>
                          <button
                            disabled={actionLoading[l.id]}
                            onClick={() => handleLeaveApproval(l.id, 'Rejected')}
                            className="btn btn-warning"
                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* =================== EMPLOYEE DASHBOARD ================= */
          /* ======================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
              {/* Check-In / Check-Out Utility */}
              <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h2>Shift Attendance</h2>
                  <p style={{ marginTop: '6px', fontSize: '0.95rem' }}>Track your work hours. Your check-ins are logged relative to standard shifts.</p>
                  
                  <div style={{ display: 'flex', gap: '30px', margin: '40px 0', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Check In</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                        {todayRecord ? formatTime(todayRecord.checkIn) : '--:--'}
                      </span>
                    </div>
                    <div style={{ height: '50px', width: '1px', background: 'var(--border-light)' }} />
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Check Out</span>
                      <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                        {todayRecord?.checkOut ? formatTime(todayRecord.checkOut) : '--:--'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    disabled={checkLoading || todayRecord !== null}
                    onClick={() => handleCheckAction('check-in')}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '14px' }}
                  >
                    Check In
                  </button>
                  <button
                    disabled={checkLoading || !todayRecord || todayRecord.checkOut !== null}
                    onClick={() => handleCheckAction('check-out')}
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '14px' }}
                  >
                    Check Out
                  </button>
                </div>
              </div>

              {/* Profile Overview Card */}
              <div className="glass-card primary-glow" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem' }}>{user.name}</h3>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem' }}>{user.jobDetails?.title || 'Staff'}</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Employee ID</span>
                    <span style={{ fontWeight: 700 }}>{user.employeeId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Department</span>
                    <span>{user.jobDetails?.department || 'Operations'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Corporate Email</span>
                    <span>{user.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/profile')}
                  className="btn btn-secondary"
                  style={{ marginTop: 'auto', padding: '12px' }}
                >
                  View Full Profile
                </button>
              </div>
            </div>

            {/* Quick Access Actions */}
            <div>
              <h2 style={{ marginBottom: '20px' }}>Quick Access</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <button onClick={() => router.push('/attendance')} className="glass-card" style={{ cursor: 'pointer', textAlign: 'left', border: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>📅</span>
                  <h4 style={{ fontSize: '1.1rem' }}>Shift Logs</h4>
                  <p style={{ fontSize: '0.85rem' }}>View complete historical logs of your check-in timings.</p>
                </button>

                <button onClick={() => router.push('/leave')} className="glass-card" style={{ cursor: 'pointer', textAlign: 'left', border: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>🏖️</span>
                  <h4 style={{ fontSize: '1.1rem' }}>Time Off</h4>
                  <p style={{ fontSize: '0.85rem' }}>Submit leave requests and monitor approvals in real-time.</p>
                </button>

                <button onClick={() => router.push('/payroll')} className="glass-card" style={{ cursor: 'pointer', textAlign: 'left', border: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '2rem' }}>💵</span>
                  <h4 style={{ fontSize: '1.1rem' }}>Pay Slips</h4>
                  <p style={{ fontSize: '0.85rem' }}>Review current salary structure and downloadable pay structures.</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Dynamic Link and Head imports for Next.js */}
      <style jsx>{`
        th, td {
          border-bottom: 1px solid var(--border-light);
        }
      `}</style>
    </div>
  );
}

// Simple absolute link mapping (used inside Dashboard components)
function Link({ href, children, ...props }) {
  return (
    <a href={href} {...props} style={{ textDecoration: 'none', ...props.style }}>
      {children}
    </a>
  );
}
