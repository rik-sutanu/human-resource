'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function Attendance() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');

  const [todayRecord, setTodayRecord] = useState(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const fetchData = useCallback(async (currentUser) => {
    try {
      // 1. Fetch attendance
      const attRes = await fetch('/api/attendance');
      if (attRes.ok) {
        const attData = await attRes.json();
        setAttendance(attData);

        // Find today's record for this employee
        const todayDate = new Date().toLocaleDateString('en-CA');
        const todayRec = attData.find(
          r => r.employeeId === currentUser.employeeId && r.date === todayDate
        );
        setTodayRecord(todayRec || null);
      }

      // 2. Fetch employees list (if admin)
      if (currentUser.role === 'admin') {
        const empRes = await fetch('/api/employees');
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(empData);
        }
      }
    } catch (err) {
      console.error('Error fetching attendance logs:', err);
    }
  }, []);

  useEffect(() => {
    async function loadAttendancePage() {
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
        console.error('Load attendance page error:', err);
        router.push('/');
      }
    }
    loadAttendancePage();
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

  const calculateDuration = (inTime, outTime) => {
    if (!inTime) return '0 hrs';
    const start = new Date(inTime);
    const end = outTime ? new Date(outTime) : new Date();
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  const getEmployeeName = (empId) => {
    if (empId === user?.employeeId) return user.name;
    const emp = employees.find(e => e.employeeId === empId);
    return emp ? emp.name : empId;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Loading Attendance Logs...</p>
      </div>
    );
  }

  // Filter attendance records based on selection
  const filteredRecords = attendance.filter(record => {
    if (user.role !== 'admin') {
      return record.employeeId === user.employeeId;
    }
    if (selectedEmployeeId === 'all') {
      return true;
    }
    return record.employeeId === selectedEmployeeId;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="app-container">
      <Sidebar user={user} />

      <main className="main-content animate-fade-in">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1>Attendance Tracking</h1>
            <p>Monitor shift timings, daily check-ins, and view working hours reports.</p>
          </div>
        </header>

        {user.role === 'employee' && (
          <div className="glass-panel" style={{ padding: '30px', marginBottom: '40px' }}>
            <h2>Daily Shift Control</h2>
            <p style={{ margin: '8px 0 20px', fontSize: '0.95rem' }}>Log your attendance status for today.</p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'center' }}>
              <div style={{
                padding: '20px 30px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-light)', flex: 1, textAlign: 'center', minWidth: '150px'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Check-In Time</span>
                <strong style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>
                  {todayRecord ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </strong>
              </div>

              <div style={{
                padding: '20px 30px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-light)', flex: 1, textAlign: 'center', minWidth: '150px'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Check-Out Time</span>
                <strong style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>
                  {todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </strong>
              </div>

              <div style={{
                padding: '20px 30px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border-light)', flex: 1, textAlign: 'center', minWidth: '150px'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Active Duration</span>
                <strong style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                  {todayRecord ? calculateDuration(todayRecord.checkIn, todayRecord.checkOut) : '0 hrs'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '30px' }}>
              <button
                disabled={checkLoading || todayRecord !== null}
                onClick={() => handleCheckAction('check-in')}
                className="btn btn-primary"
                style={{ flex: 1, padding: '14px' }}
              >
                Log Shift Check-In
              </button>
              
              <button
                disabled={checkLoading || !todayRecord || todayRecord.checkOut !== null}
                onClick={() => handleCheckAction('check-out')}
                className="btn btn-outline"
                style={{ flex: 1, padding: '14px' }}
              >
                Log Shift Check-Out
              </button>
            </div>
          </div>
        )}

        {/* Filter for Admin */}
        {user.role === 'admin' && (
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Filter Employee logs:</span>
            <select
              className="glass-select"
              style={{ width: '250px' }}
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              <option value="all">Show All Employees</option>
              {employees.map(emp => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Shift Logs Table */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h2>Historical Shift Log</h2>
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  {user.role === 'admin' && <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Employee Name</th>}
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Date</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Check In</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Check Out</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Working Hours</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={user.role === 'admin' ? 6 : 5} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No shift records logged.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(record => (
                    <tr key={record.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      {user.role === 'admin' && (
                        <td style={{ padding: '16px 10px', fontWeight: 600 }}>{getEmployeeName(record.employeeId)}</td>
                      )}
                      <td style={{ padding: '16px 10px', fontWeight: 700 }}>{record.date}</td>
                      <td style={{ padding: '16px 10px' }}>
                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </td>
                      <td style={{ padding: '16px 10px' }}>
                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </td>
                      <td style={{ padding: '16px 10px' }}>
                        {record.checkIn ? calculateDuration(record.checkIn, record.checkOut) : '0 hrs'}
                      </td>
                      <td style={{ padding: '16px 10px' }}>
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: record.status === 'Present' 
                            ? 'rgba(56, 239, 125, 0.1)' 
                            : record.status === 'Leave' 
                              ? 'rgba(0, 242, 254, 0.1)' 
                              : 'rgba(255, 88, 88, 0.1)',
                          color: record.status === 'Present' 
                            ? 'var(--color-success)' 
                            : record.status === 'Leave' 
                              ? 'var(--color-primary)' 
                              : 'var(--color-warning)'
                        }}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
