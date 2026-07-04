'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function Payroll() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [showPayslip, setShowPayslip] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2026-06');

  useEffect(() => {
    async function loadPayrollPage() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();

        if (!data.user) {
          router.push('/');
        } else {
          setUser(data.user);
          
          if (data.user.role === 'admin') {
            const empRes = await fetch('/api/employees');
            if (empRes.ok) {
              const empData = await empRes.json();
              setEmployees(empData);
            }
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Load payroll page error:', err);
        router.push('/');
      }
    }
    loadPayrollPage();
  }, [router]);

  const calculateNetSalary = (sal) => {
    if (!sal) return 0;
    return (sal.basic || 0) + (sal.hra || 0) + (sal.lta || 0) + (sal.allowances || 0) - (sal.deductions || 0);
  };

  const calculateGrossSalary = (sal) => {
    if (!sal) return 0;
    return (sal.basic || 0) + (sal.hra || 0) + (sal.lta || 0) + (sal.allowances || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Loading Compensation Details...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="no-print">
        <Sidebar user={user} />
      </div>

      <main className="main-content animate-fade-in">
        <header className="no-print" style={{ marginBottom: '40px' }}>
          <h1>Compensation & Payroll</h1>
          <p>{user.role === 'admin' ? 'Monitor salary allocations, basic pays, and administrative deductions.' : 'Review your salary structure and generate corporate payslips.'}</p>
        </header>

        {user.role === 'employee' ? (
          /* ================= EMPLOYEE VIEW ================= */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
              {/* Salary Breakdown */}
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h2>Salary Structure Breakdown</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '6px 0 20px' }}>
                  All values shown represent monthly figures (USD).
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                    <span>Basic Salary</span>
                    <span style={{ fontWeight: 700 }}>${user.salaryStructure?.basic?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                    <span>House Rent Allowance (HRA)</span>
                    <span>${user.salaryStructure?.hra?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                    <span>Leave Travel Allowance (LTA)</span>
                    <span>${user.salaryStructure?.lta?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                    <span>Special Allowances</span>
                    <span>${user.salaryStructure?.allowances?.toLocaleString() || '0'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', color: 'var(--color-warning)' }}>
                    <span>Taxes & Deductions</span>
                    <span>-${user.salaryStructure?.deductions?.toLocaleString() || '0'}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontSize: '1.2rem', fontWeight: 800 }}>
                    <span>Monthly Take-Home</span>
                    <span style={{ color: 'var(--color-primary)' }}>${calculateNetSalary(user.salaryStructure).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Generate Payslip card */}
              <div className="glass-card primary-glow" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignSelf: 'start' }}>
                <h2>Generate Payslip</h2>
                <p style={{ fontSize: '0.9rem' }}>
                  Select the billing month to view or print your official salary statement.
                </p>

                <div className="glass-input-group">
                  <label className="glass-label">Select Month</label>
                  <select 
                    className="glass-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="2026-06">June 2026</option>
                    <option value="2026-05">May 2026</option>
                    <option value="2026-04">April 2026</option>
                    <option value="2026-03">March 2026</option>
                  </select>
                </div>

                <button 
                  onClick={() => setShowPayslip(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  Generate Statement
                </button>
              </div>
            </div>

            {/* Payslip Overlay Receipt (Printable) */}
            {showPayslip && (
              <div className="payslip-modal animate-fade-in" style={{ marginTop: '20px' }}>
                <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.4rem' }}>Salary Statement Preview</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handlePrint} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      🖨️ Print Statement
                    </button>
                    <button onClick={() => setShowPayslip(false)} className="btn btn-warning" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      Close Preview
                    </button>
                  </div>
                </div>

                {/* Actual statement wrapper */}
                <div className="payslip-box" style={{
                  background: '#ffffff', color: '#1a1a1a', borderRadius: '12px', padding: '40px',
                  boxShadow: '0 4px 30px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', fontFamily: 'sans-serif'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1a1a1a', paddingBottom: '20px', marginBottom: '30px' }}>
                    <div>
                      <h2 style={{ color: '#00f2fe', margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>OD-HRMS ENTERPRISE</h2>
                      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>Corporate HQ, Tech City</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>SALARY STATEMENT</h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0' }}>Month: {selectedMonth}</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px', fontSize: '0.9rem' }}>
                    <div>
                      <table style={{ width: '100%' }}>
                        <tbody>
                          <tr>
                            <td style={{ color: '#64748b', padding: '6px 0' }}>Employee Name:</td>
                            <td style={{ fontWeight: 700, textAlign: 'right' }}>{user.name}</td>
                          </tr>
                          <tr>
                            <td style={{ color: '#64748b', padding: '6px 0' }}>Employee ID:</td>
                            <td style={{ fontWeight: 700, textAlign: 'right' }}>{user.employeeId}</td>
                          </tr>
                          <tr>
                            <td style={{ color: '#64748b', padding: '6px 0' }}>Designation:</td>
                            <td style={{ textAlign: 'right' }}>{user.jobDetails?.title}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div>
                      <table style={{ width: '100%' }}>
                        <tbody>
                          <tr>
                            <td style={{ color: '#64748b', padding: '6px 0' }}>Department:</td>
                            <td style={{ textAlign: 'right' }}>{user.jobDetails?.department}</td>
                          </tr>
                          <tr>
                            <td style={{ color: '#64748b', padding: '6px 0' }}>Joining Date:</td>
                            <td style={{ textAlign: 'right' }}>{user.jobDetails?.joiningDate}</td>
                          </tr>
                          <tr>
                            <td style={{ color: '#64748b', padding: '6px 0' }}>Bank Status:</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: 'green' }}>Credited</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Earnings vs Deductions Table */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px' }}>
                    <div>
                      <h4 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', margin: '0 0 12px' }}>EARNINGS</h4>
                      <table style={{ width: '100%', fontSize: '0.85rem' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '6px 0' }}>Basic Salary</td>
                            <td style={{ textAlign: 'right' }}>${user.salaryStructure?.basic?.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 0' }}>HRA</td>
                            <td style={{ textAlign: 'right' }}>${user.salaryStructure?.hra?.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 0' }}>LTA</td>
                            <td style={{ textAlign: 'right' }}>${user.salaryStructure?.lta?.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '6px 0' }}>Special Allowances</td>
                            <td style={{ textAlign: 'right' }}>${user.salaryStructure?.allowances?.toLocaleString()}</td>
                          </tr>
                          <tr style={{ fontWeight: 700, borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px 0' }}>Gross Earnings</td>
                            <td style={{ textAlign: 'right', padding: '10px 0' }}>${calculateGrossSalary(user.salaryStructure).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h4 style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', margin: '0 0 12px' }}>DEDUCTIONS</h4>
                      <table style={{ width: '100%', fontSize: '0.85rem' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '6px 0' }}>Income Tax / PF</td>
                            <td style={{ textAlign: 'right' }}>${user.salaryStructure?.deductions?.toLocaleString()}</td>
                          </tr>
                          <tr style={{ fontWeight: 700, borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px 0' }}>Total Deductions</td>
                            <td style={{ textAlign: 'right', padding: '10px 0' }}>${user.salaryStructure?.deductions?.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Block */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Net Take-Home Pay</span>
                      <h2 style={{ margin: '4px 0 0', fontSize: '1.8rem', color: '#0f172a', fontWeight: 800 }}>
                        ${calculateNetSalary(user.salaryStructure).toLocaleString()}
                      </h2>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                      Amount Transferred Electronically
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= ADMIN VIEW ================= */
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h2>Employee Compensations Summary</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '6px 0 20px' }}>
              Lists current active employee salaries. Update structures by clicking employee parameters.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Employee</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Basic Pay</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Allowances</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Deductions</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Net Salary</th>
                    <th style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.employeeId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '16px 10px' }}>
                        <strong style={{ display: 'block' }}>{emp.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {emp.employeeId}</span>
                      </td>
                      <td style={{ padding: '16px 10px' }}>${emp.salaryStructure?.basic?.toLocaleString()}</td>
                      <td style={{ padding: '16px 10px' }}>
                        ${((emp.salaryStructure?.hra || 0) + (emp.salaryStructure?.lta || 0) + (emp.salaryStructure?.allowances || 0)).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 10px', color: 'var(--color-warning)' }}>
                        -${emp.salaryStructure?.deductions?.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 10px', fontWeight: 700, color: 'var(--color-primary)' }}>
                        ${calculateNetSalary(emp.salaryStructure).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 10px', textAlign: 'right' }}>
                        <button
                          onClick={() => router.push(`/profile/${emp.employeeId}`)}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          Modify Structure
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .main-content {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .payslip-box {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
