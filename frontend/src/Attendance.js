import React, { useEffect, useState } from "react";

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  const fetchEmployees = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${backendUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data);
        // Initialize attendance state
        const initial = {};
        data.forEach(emp => {
          initial[emp._id] = {
            status: "present",
            overtime: false,
            overtimeHours: "",
          };
        });
        setAttendance(initial);
      }
    } catch {
      setMessage("Failed to fetch employees.");
    }
  };

  const handleStatusChange = (id, status) => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
  };

  const handleOvertimeChange = (id, checked) => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], overtime: checked, overtimeHours: checked ? prev[id].overtimeHours : "" }
    }));
  };

  const handleOvertimeHoursChange = (id, hours) => {
    setAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], overtimeHours: hours }
    }));
  };

  const isSunday = new Date(date).getDay() === 0;

  const handleHoliday = () => {
    // Go to next date
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    setDate(nextDate.toISOString().slice(0, 10));
    setMessage("Marked as holiday. Please select attendance for next date.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${backendUrl}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date, attendance }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Attendance saved!");
      } else {
        setMessage(data.message || "Failed to save attendance.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${backendUrl}/attendance/excel?month=${date.slice(0, 7)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance_${date.slice(0, 7)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        setMessage("Failed to download report.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #008754 0%, #43cea2 100%)",
      padding: "40px 0"
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto", background: "#fff", borderRadius: 12, padding: 32 }}>
        <h2 style={{ color: "#008754" }}>Attendance</h2>
        <div style={{ marginBottom: 24 }}>
          <label>
            <b>Select Date: </b>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ marginLeft: 8, padding: 4, fontSize: 16 }}
            />
          </label>
          <button
            style={{
              marginLeft: 24,
              background: "#d2042d",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 16px",
              cursor: "pointer"
            }}
            onClick={handleDownload}
          >
            Download Monthly Report
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#008754", color: "#fff" }}>
                <th style={thStyle}>Employee Name</th>
                {!isSunday && (
                  <>
                    <th style={thStyle}>Present</th>
                    <th style={thStyle}>Absent</th>
                  </>
                )}
                <th style={thStyle}>Overtime</th>
                <th style={thStyle}>Overtime Hours</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp._id}>
                  <td style={tdStyle}>{emp.employeeName}</td>
                  {!isSunday && (
                    <>
                      <td style={tdStyle}>
                        <input
                          type="radio"
                          name={`status-${emp._id}`}
                          checked={attendance[emp._id]?.status === "present"}
                          onChange={() => handleStatusChange(emp._id, "present")}
                        />
                      </td>
                      <td style={tdStyle}>
                        <input
                          type="radio"
                          name={`status-${emp._id}`}
                          checked={attendance[emp._id]?.status === "absent"}
                          onChange={() => handleStatusChange(emp._id, "absent")}
                        />
                      </td>
                    </>
                  )}
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={attendance[emp._id]?.overtime || false}
                      onChange={e => handleOvertimeChange(emp._id, e.target.checked)}
                    />
                  </td>
                  <td style={tdStyle}>
                    {attendance[emp._id]?.overtime && (
                      <input
                        type="number"
                        min="1"
                        max="24"
                        value={attendance[emp._id]?.overtimeHours || ""}
                        onChange={e => handleOvertimeHoursChange(emp._id, e.target.value)}
                        style={{ width: 60 }}
                        placeholder="Hours"
                        required
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isSunday && (
            <div style={{ margin: "16px 0", color: "#d2042d", fontWeight: 600 }}>
              Sunday: Only overtime can be marked.
            </div>
          )}
          <div style={{ marginTop: 24 }}>
            {isSunday && (
              <button
                type="button"
                style={{
                  background: "#d2042d",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 24px",
                  margin: "16px 0",
                  cursor: "pointer"
                }}
                onClick={handleHoliday}
              >
                Mark as Holiday
              </button>
            )}
            <button
              type="submit"
              style={{
                background: "#008754",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 24px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Save Attendance
            </button>
          </div>
        </form>
        {message && <div style={{ marginTop: 20, color: "#008754", fontWeight: 600 }}>{message}</div>}
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            style={{
              background: "#d2042d",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 24px",
              margin: "16px 0",
              cursor: "pointer"
            }}
            onClick={handleHoliday}
          >
            Mark as Holiday
          </button>
        </div>
      </div>
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