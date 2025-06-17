import React, { useEffect, useState } from "react";

export default function SetEmployeeSalary() {
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  const fetchEmployees = async () => {
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${backendUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data);
      } else {
        setMessage(data.message || "Failed to fetch employees.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  const handleChange = (id, field, value) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp._id === id ? { ...emp, [field]: value } : emp
      )
    );
  };

  const handleSave = async (id) => {
    setMessage("");
    const token = localStorage.getItem("token");
    const emp = employees.find(e => e._id === id);
    try {
      const res = await fetch(`${backendUrl}/employees/${id}/salary`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          salary: emp.salary,
          overtimeSalary: emp.overtimeSalary,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Salary updated!");
      } else {
        setMessage(data.message || "Failed to update salary.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", background: "#fff", borderRadius: 8, padding: 24 }}>
      <h2>Set Employee Salary</h2>
      {message && <div style={{ color: "#008754", marginBottom: 16 }}>{message}</div>}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
        <thead>
          <tr style={{ background: "#008754", color: "#fff" }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Salary</th>
            <th style={thStyle}>Overtime Salary</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp._id}>
              <td style={tdStyle}>{emp.employeeName}</td>
              <td style={tdStyle}>
                <input
                  type="number"
                  value={emp.salary}
                  onChange={e => handleChange(emp._id, "salary", e.target.value)}
                  style={{ width: 100 }}
                />
              </td>
              <td style={tdStyle}>
                <input
                  type="number"
                  value={emp.overtimeSalary}
                  onChange={e => handleChange(emp._id, "overtimeSalary", e.target.value)}
                  style={{ width: 100 }}
                />
              </td>
              <td style={tdStyle}>
                <button
                  style={{
                    background: "#008754",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 16px",
                    cursor: "pointer"
                  }}
                  onClick={() => handleSave(emp._id)}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {employees.length === 0 && !message && <div>No employees found.</div>}
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