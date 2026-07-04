'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function Leave() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // Leave Form State
  const [type, setType] = useState('Paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Admin approval states
  const [adminComments, setAdminComments] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const leavesRes = await fetch('/api/leaves');
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeaves(leavesData);
      }

      const attRes = await fetch('/api/attendance');
      if (attRes.ok) {
        const attData = await attRes.json();
        setAttendance(attData);
      }
    } catch (err) {
      console.error('Error fetching leave details:', err);
    }
  }, []);

  useEffect(() => {
    async function loadLeavePage() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        if (!data.user) {
          router.push('/');
        } else {
          setUser(data.user);
          await fetchData();
          setLoading(false);
        }
      } catch (err) {
        console.error('Load leave page error:', err);
        router.push('/');
      }
    }
    loadLeavePage();
  }, [router, fetchData]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, startDate, endDate, remarks })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Leave request submitted successfully!');
        setType('Paid');
        setStartDate('');
        setEndDate('');
        setRemarks('');
        await fetchData();
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Failed to request leave.');
      console.error(err);
    } finally {
      setSubmitting(false);
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
        setAdminComments(prev => {
          const copy = { ...prev };
          delete copy[leaveId];
          return copy;
        });
        await fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update leave');
      }
    } catch (err) {
      console.error('Leave status update error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [leaveId]: false }));
    }
  };

  // Calendar render logic for current month
  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const numDays = lastDay.getDate();
    const startOffset = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)

    const calendarCells = [];

    // Empty cells before start of month
    for (let i = 0; i < startOffset; i++) {
      calendarCells.push(<div key={`empty-${i}`} className="calendar-day-empty" />);
    }

    // Actual day cells
    for (let day = 1; day <= numDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Look up attendance logs for this day
      const dayRecord = attendance.find(r => r.employeeId === user.employeeId && r.date === dateStr);
      let statusColor = 'transparent';
      let statusLabel = '';

      if (dayRecord) {
        if (dayRecord.status === 'Present') {
          statusColor = 'var(--color-success)';
          statusLabel = 'Present';
        } else if (dayRecord.status === 'Leave') {
          statusColor = 'var(--color-primary)';
          statusLabel = 'Leave';
        } else if (dayRecord.status === 'Absent') {
          statusColor = 'var(--color-warning)';
          statusLabel = 'Absent';
        }
      }

      calendarCells.push(
        <div key={`day-${day}`} className="calendar-day">
          <span className="day-number">{day}</span>
          {statusLabel && (
            <span 
              className="status-dot" 
              style={{ backgroundColor: statusColor }}
              title={statusLabel}
            />
          )}
        </div>
      );
    }

    return (
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '10px', textAlign: 'center' }}>
          {monthNames[month]} {year}
        </h3>
        
        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '10px' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <span key={d} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{d}</span>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {calendarCells}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }} />
            <span>Present</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />
            <span>Leave</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-warning)' }} />
            <span>Absent</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Loading Time-Off Center...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar user={user} />

      <main className="main-content animate-fade-in">
        <header style={{ marginBottom: '40px' }}>
          <h1>Leave & Time-Off</h1>
          <p>Plan time-offs, apply for leaves, and track supervisor approval responses.</p>
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

        {user.role === 'employee' ? (
          /* ================= EMPLOYEE VIEW ================= */
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '30px' }}>
            {/* Left: Apply Form and History */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h2>Request Time Off</h2>
                
                <form onSubmit={handleApplyLeave} style={{ marginTop: '20px' }}>
                  <div className="glass-input-group">
                    <label className="glass-label">Leave Type</label>
                    <select className="glass-select" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="Paid">Paid Time-Off (PTO)</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="glass-input-group">
                      <label className="glass-label">Start Date</label>
                      <input 
                        type="date" 
                        required 
                        className="glass-input" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                      />
                    </div>
                    <div className="glass-input-group">
                      <label className="glass-label">End Date</label>
                      <input 
                        type="date" 
                        required 
                        className="glass-input" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="glass-input-group" style={{ marginBottom: '24px' }}>
                    <label className="glass-label">Remarks / Reason</label>
                    <input 
                      type="text" 
                      placeholder="Add brief details about the request..." 
                      className="glass-input" 
                      value={remarks} 
                      onChange={(e) => setRemarks(e.target.value)} 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                  >
                    {submitting ? 'Submitting request...' : 'Request Time Off'}
                  </button>
                </form>
              </div>

              {/* History */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h2>My Requests</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                  {leaves.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No requests submitted yet.</p>
                  ) : (
                    leaves.map(l => (
                      <div key={l.id} className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 600 }}>{l.type} Leave</span>
                          <span style={{
                            padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                            background: l.status === 'Approved' ? 'rgba(56, 239, 125, 0.1)' : l.status === 'Pending' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 88, 88, 0.1)',
                            color: l.status === 'Approved' ? 'var(--color-success)' : l.status === 'Pending' ? 'var(--color-primary)' : 'var(--color-warning)'
                          }}>
                            {l.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          {l.startDate} to {l.endDate}
                        </p>
                        {l.remarks && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '6px' }}>
                            "{l.remarks}"
                          </p>
                        )}
                        {l.adminComment && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '6px', marginTop: '6px' }}>
                            <strong>HR comment:</strong> {l.adminComment}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right: Monthly Attendance Grid */}
            <div className="glass-panel" style={{ padding: '30px', alignSelf: 'start' }}>
              <h2>Monthly Planner</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '6px 0 20px' }}>
                Your attendance markers overlaid on the monthly calendar.
              </p>
              {renderCalendar()}
            </div>
          </div>
        ) : (
          /* ================= ADMIN VIEW ================= */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="glass-panel" style={{ padding: '30px' }}>
              <h2>Leave Administration Review</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                {leaves.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', padding: '30px 0', textAlign: 'center' }}>No employee leave requests submitted.</p>
                ) : (
                  leaves.map(l => (
                    <div key={l.id} className="glass-card" style={{
                      display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr', gap: '20px', alignItems: 'center',
                      background: 'rgba(255,255,255,0.01)', borderLeft: `4px solid ${
                        l.status === 'Approved' ? 'var(--color-success)' : l.status === 'Rejected' ? 'var(--color-warning)' : 'var(--color-primary)'
                      }`
                    }}>
                      <div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{l.employeeName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {l.employeeId}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Type: <strong style={{ color: 'var(--text-primary)' }}>{l.type} Leave</strong> | Dates: <strong>{l.startDate} to {l.endDate}</strong>
                        </p>
                        {l.remarks && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '6px' }}>
                            "{l.remarks}"
                          </p>
                        )}
                      </div>

                      {/* Admin comment input / Display */}
                      <div>
                        {l.status === 'Pending' ? (
                          <div className="glass-input-group" style={{ marginBottom: 0 }}>
                            <input
                              type="text"
                              placeholder="Add HR comment..."
                              className="glass-input"
                              style={{ fontSize: '0.85rem', padding: '10px' }}
                              value={adminComments[l.id] || ''}
                              onChange={(e) => setAdminComments(prev => ({ ...prev, [l.id]: e.target.value }))}
                            />
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <strong>HR comment:</strong> {l.adminComment || 'No remarks added'}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        {l.status === 'Pending' ? (
                          <>
                            <button
                              disabled={actionLoading[l.id]}
                              onClick={() => handleLeaveApproval(l.id, 'Approved')}
                              className="btn btn-success"
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Approve
                            </button>
                            <button
                              disabled={actionLoading[l.id]}
                              onClick={() => handleLeaveApproval(l.id, 'Rejected')}
                              className="btn btn-warning"
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span style={{
                            padding: '6px 16px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 700,
                            background: l.status === 'Approved' ? 'rgba(56, 239, 125, 0.1)' : 'rgba(255, 88, 88, 0.1)',
                            color: l.status === 'Approved' ? 'var(--color-success)' : 'var(--color-warning)'
                          }}>
                            {l.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .calendar-day {
          height: 60px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          padding: 8px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: flex-end;
          transition: background 0.2s;
        }
        .calendar-day:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .calendar-day-empty {
          height: 60px;
        }
        .day-number {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          align-self: flex-start;
          box-shadow: 0 0 8px currentColor;
        }
      `}</style>
    </div>
  );
}
