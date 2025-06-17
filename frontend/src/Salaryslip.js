import React, { useEffect, useState } from "react";
import './App.css'; // or './Salaryslip.css'

export default function SalarySlip() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [slip, setSlip] = useState(null);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [holidays, setHolidays] = useState([]);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${backendUrl}/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setEmployees(data);
  };

  const fetchAttendance = async (empId) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${backendUrl}/attendance/employee/${empId}?month=${month}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setAttendance(data);
    else setAttendance([]);
  };

  const fetchHolidays = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${backendUrl}/holidays?month=${month}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setHolidays(data);
  };

  useEffect(() => {
    fetchHolidays();
  }, [month]);

  const getAllDatesInMonth = (month) => {
    const [year, m] = month.split('-').map(Number);
    const days = new Date(year, m, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(year, m - 1, i + 1);
      return d.toISOString().slice(0, 10);
    });
  };

  const handleGenerate = () => {
    const emp = employees.find(e => e._id === selected);
    if (!emp) return;
    const totalDays = 30;
    const presentDays = attendance.filter(a => a.status === "present").length;
    const allDates = getAllDatesInMonth(month);
    const sundays = allDates.filter(date => new Date(date).getDay() === 0);
    const nonWorkingDays = new Set([...sundays, ...holidays]);
    const workingDays = allDates.filter(date => !nonWorkingDays.has(date));
    const absentDays = attendance.filter(
      a => a.status === "absent" && workingDays.includes(a.date)
    ).length;
    const overtimeHours = attendance.reduce((sum, a) => sum + (a.overtime ? a.overtimeHours : 0), 0);
    const perDaySalary = emp.salary / totalDays;
    const salaryAfterAbsents = emp.salary - (absentDays * perDaySalary);
    const overtimePay = overtimeHours * emp.overtimeSalary;
    const totalPay = Math.round(salaryAfterAbsents + overtimePay);

    setSlip({
      name: emp.employeeName,
      designation: emp.designation,
      salary: emp.salary,
      overtimeSalary: emp.overtimeSalary,
      presentDays,
      absentDays,
      overtimeHours,
      perDaySalary: perDaySalary.toFixed(2),
      salaryAfterAbsents: salaryAfterAbsents.toFixed(2),
      overtimePay: overtimePay.toFixed(2),
      totalPay,
    });
  };

  const handlePrint = () => window.print();

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", background: "#fff", borderRadius: 8, padding: 24 }}>
      <h2>Generate Salary Slip</h2>
      <div style={{ marginBottom: 16 }}>
        <label>
          Select Month:{" "}
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            style={{ marginRight: 16 }}
          />
        </label>
        <label>
          Select Employee:{" "}
          <select
            value={selected}
            onChange={e => {
              setSelected(e.target.value);
              if (e.target.value) fetchAttendance(e.target.value);
              setSlip(null);
            }}
          >
            <option value="">--Select--</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.employeeName}
              </option>
            ))}
          </select>
        </label>
        <button
          style={{
            marginLeft: 16,
            background: "#008754",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "6px 16px",
            cursor: "pointer"
          }}
          onClick={handleGenerate}
          disabled={!selected}
        >
          Generate
        </button>
      </div>
      {slip && (
        <div
          id="salary-slip"
          style={{
            position: "relative",
            maxWidth: 500,
            margin: "16px auto",
            background: "#fff",
            borderRadius: 8,
            padding: 24,
            backgroundImage: "url('/mslogo.png')", // Replace with your logo path
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "200px 200px", // Adjust size as needed
            opacity: 1
          }}
        >
          {/* Top right logo */}
          <img
            src="/mslogo.png" // replace with your logo path
            alt="Logo"
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              width: 80,
              height: "auto",
              objectFit: "contain"
            }}
          />
          <h3 style={{ color: "#008754" }}>Salary Slip</h3>
          <div><b>Name:</b> {slip.name}</div>
          <div><b>Designation:</b> {slip.designation}</div>
          <div><b>Monthly Salary:</b> ₹{slip.salary}</div>
          <div><b>Overtime Salary (per hour):</b> ₹{slip.overtimeSalary}</div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
            <thead>
              <tr style={{ background: "#008754", color: "#fff" }}>
                <th style={thStyle}>Total Days</th>
                <th style={thStyle}>Present</th>
                <th style={thStyle}>Absent</th>
                <th style={thStyle}>Overtime Hours</th>
                <th style={thStyle}>Per Day Salary</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>30</td>
                <td style={tdStyle}>{slip.presentDays}</td>
                <td style={tdStyle}>{slip.absentDays}</td>
                <td style={tdStyle}>{slip.overtimeHours}</td>
                <td style={tdStyle}>₹{slip.perDaySalary}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 16 }}>
            <b>Salary after Absents:</b> ₹{slip.salaryAfterAbsents}<br />
            <b>Overtime Pay:</b> ₹{slip.overtimePay}<br />
            <b style={{ fontSize: 18, color: "#d2042d" }}>Total Pay: ₹{slip.totalPay}</b>
          </div>
          {/* Bottom right seal and sign */}
          <div style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end"
          }}>
            <div style={{
              width: 120,
              borderBottom: "2px solid #888",
              marginBottom: 4
            }} />
            <div style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 16
            }}>
              <span style={{ fontWeight: "bold", fontSize: 18, color: "#008754" }}>Seal</span>
              <span style={{ fontWeight: "bold", fontSize: 18, color: "#d2042d" }}>Sign</span>
            </div>
          </div>
        </div>
      )}
      <button onClick={handlePrint}>Print Pay Slip</button>
    </div>
  );
}

const thStyle = {
  padding: "10px",
  border: "1px solid #ddd",
};

const tdStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  textAlign: "center",
};