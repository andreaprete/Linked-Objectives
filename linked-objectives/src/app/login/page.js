"use client";

import React, { useState } from 'react';
import '@/app/styles/Login.css'; // Make sure this path is correct
import Logo from '@/app/components/Logo';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login Attempt:', formData);

    // 🔐 BACKEND INTEGRATION HOOK
    // fetch("/api/login", {...})
  };

  return (
    <div className="page-container">
      <div className="auth-box">
        <Logo />
        <h2>supported by SICK AG</h2>
        <h3>Log In</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <a href="#" className="forgot">Forgot your password?</a>
          <button type="submit" className="btn">Log In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
