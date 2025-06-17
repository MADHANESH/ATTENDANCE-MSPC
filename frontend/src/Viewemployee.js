import React, { useEffect, useState } from "react";

export default function ViewEmployee() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  const fetchEmployees = async () => {
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${backendUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data);
      } else {
        setError(data.message || "Failed to fetch employees.");
      }
    } catch {
      setError("Server error.");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`${backendUrl}/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEmployees(employees.filter(emp => emp._id !== id));
      } else {
        alert("Failed to delete employee.");
      }
    } catch {
      alert("Server error.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #008754 0%, #43cea2 100%)",
        padding: "40px 0"
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ color: "#DC2525", marginBottom: 32 }}>Employee List</h2>
        {error && <div style={{ color: "#d2042d" }}>{error}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          {employees.map(emp => (
            <div
              key={emp._id}
              style={{
                background: "rgba(5, 201, 235, 0.94)",
                boxShadow: "0 8px 32px 0 rgba(63, 75, 237, 0.92)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.18)",
                padding: 24,
                minWidth: 260,
                maxWidth: 300,
                marginBottom: 16,
                position: "relative",
                color: "#222"
              }}
            >
              <button
                onClick={() => handleDelete(emp._id)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 22,
                  color: "#d2042d"
                }}
                title="Delete"
              >
                &#128465;
              </button>
              <div><b>Name:</b> {emp.employeeName}</div>
              <div><b>Designation:</b> {emp.designation}</div>
              <div><b>Salary:</b> {emp.salary}</div>
              <div><b>Overtime Salary:</b> {emp.overtimeSalary}</div>
            </div>
          ))}
        </div>
        {employees.length === 0 && !error && <div>No employees found.</div>}
      </div>
    </div>
  );
}