// src/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
const RAL6024 = '#008754';


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [slip, setSlip] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.error('Failed to fetch user');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
           
        <div>
            <img
            src="/mslogo.png"
            alt="MS Powder Coating Logo"
            style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'contain' }}
          />
          <h2 style={{ color: '#d2042d', marginBottom: 30 }}>M S POWDER COATING</h2>
        
          <button
      style={styles.sidebarBtn}
      onClick={() => navigate('/addemployee')}
    >Add Employee
    </button>
      <button style={styles.sidebarBtn}onClick={() => navigate('/viewemployee')}>View Employees</button>
          <button style={styles.sidebarBtn}onClick={() => navigate('/attendance')}>Attendance</button>
          <button style={styles.sidebarBtn}onClick={() => navigate('/salaryslip')}>Salary Slip</button>
          <button style={styles.sidebarBtn}onClick={() => navigate('/setsalary')}>Set Employee Salary</button>
          
        </div>

        {user && (
          <div style={{ marginTop: 32, fontSize: 15, color: '#fff' }}>
            <div><strong>{user.name}</strong></div>
            <div>{user.email}</div>
          </div>
        )}
      </div>

      {/* Main content area */} 
      <div style={{ flex: 1 }}>
        <div style={styles.navbar}>Dashboard</div>
        <div style={{ padding: 32 }}>
          <h3>Welcome, {user?.name || 'User'}!</h3>
          {/* Your main dashboard content goes here */}
          {slip && (
  <div style={{ border: "1px solid #008754", borderRadius: 8, padding: 24, marginTop: 24 }}>
    <h3 style={{ color: "#008754" }}>Salary Slip</h3>
    <div><b>Name:</b> {slip.name}</div>
    <div><b>Designation:</b> {slip.designation}</div>
    <div><b>Total Monthly Salary (from DB):</b> ₹{slip.salary}</div>
    <div><b>Overtime Salary (per hour):</b> ₹{slip.overtimeSalary}</div>
    {/* ...rest of the table and summary... */}
    <div style={{ marginTop: 16 }}>
      <b>Salary after Absents:</b> ₹{slip.salaryAfterAbsents}<br />
      <b>Overtime Pay:</b> ₹{slip.overtimePay}<br />
      <b style={{ fontSize: 18, color: "#d2042d" }}>Total Pay: ₹{slip.totalPay}</b>
    </div>
    <button
      style={{
        marginTop: 24,
        background: "#008754",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        padding: "10px 24px",
        fontWeight: 600,
        cursor: "pointer"
      }}
      onClick={handlePrint}
    >
      Print Pay Slip
    </button>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

const styles = {
  navbar: {
    height: 60,
    background: RAL6024,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 32,
    fontSize: 22,
    fontWeight: 500,
    letterSpacing: 1,
  },
 sidebar: {
    width: 250,
    background: '#008754', // RAL 6024
    color: '#fff',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
},
  sidebarBtn: {
    display: 'block',
    width: '100%',
    padding: '12px 0',
    margin: '8px 0',
    background: '#fff',
    color: RAL6024,
    border: `1px solid ${RAL6024}`,
    borderRadius: 6,
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
  },
};

export default Dashboard;
