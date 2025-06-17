import React, { useState } from "react";

export default function Addemployee() {
  const [form, setForm] = useState({
    employeeName: "",
    designation: "",
    salary: "",
    overtimeSalary: "",
  });
  const [message, setMessage] = useState("");
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${backendUrl}/addemployee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Employee saved!");
        setForm({
          employeeName: "",
          designation: "",
          salary: "",
          overtimeSalary: "",
        });
        // Refresh the container after 1 second
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage(data.message || "Failed to add employee.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <img
        src="/pc2.png"
        alt=""
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.15,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          background: "rgba(206, 71, 71, 0.25)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          padding: "40px 32px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <img
          src="/mslogo.png"
          alt="Logo"
          style={{ width: 100, height: 100, marginBottom: 16 }}
        />
        <h2
          style={{
            marginBottom: 24,
            color: "#222",
            letterSpacing: 1,
            fontSize: 24,
          }}
        >
          Add Employee
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18, textAlign: "left" }}>
            <label style={{ fontWeight: 500, color: "#333" }}>
              Employee Name:
            </label>
            <input
              name="employeeName"
              placeholder="Employee Name"
              value={form.employeeName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 18, textAlign: "left" }}>
            <label style={{ fontWeight: 500, color: "#333" }}>Designation:</label>
            <select
              name="designation"
              value={form.designation}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Select</option>
              <option value="operator">Operator</option>
              <option value="helper">Helper</option>
              <option value="washer">Washer</option>
            </select>
          </div>
          <div style={{ marginBottom: 18, textAlign: "left" }}>
            <label style={{ fontWeight: 500, color: "#333" }}>Salary:</label>
            <input
              name="salary"
              placeholder="Salary"
              type="number"
              value={form.salary}
              onChange={handleChange}
              required
              min="0"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 24, textAlign: "left" }}>
            <label style={{ fontWeight: 500, color: "#333" }}>
              Overtime Salary:
            </label>
            <input
              name="overtimeSalary"
              placeholder="Overtime Salary"
              type="number"
              value={form.overtimeSalary}
              onChange={handleChange}
              required
              min="0"
              style={inputStyle}
            />
          </div>
          <button type="submit" style={btnStyle}>
            Add Employee
          </button>
        </form>
        {message && (
          <div
            style={{
              marginTop: 16,
              color: "#008754",
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  margin: "12px 0",
  padding: "10px",
  fontSize: 16,
  borderRadius: 6,
  border: "1px solid #ccc",
};

const btnStyle = {
  background: "#008754",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "12px 0",
  width: "100%",
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
};