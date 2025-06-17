import React, { useState } from "react";
import "./Register.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL;
console.log('Backend URL:', backendUrl); // Add this line for debugging

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registration successful!");
        setForm({ name: "", email: "", password: "", confirmPassword: "" });
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (err) {
      setMessage("Server error.");
    }
  };

  async function registerUser(data) {
    const res = await fetch(`${backendUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  return (
    <div className="register-bg">
      <div className="register-glass">
        <h2>Create Account</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="register-btn">
            Register
          </button>
        </form>
        {message && <div className="register-message">{message}</div>}
      </div>
    </div>
  );
}