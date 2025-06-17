import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Reuse the same styles

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${backendUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLogin && onLogin(data.token);
        navigate('/dashboard'); // Redirect to dashboard after login
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Server error');
    }
  };

  return (
    <div className="register-bg">
      <div className="register-glass">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="register-btn">Login</button>
          {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}