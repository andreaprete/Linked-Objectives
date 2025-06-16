"use client";

import React, { useState } from 'react';
import '@/app/styles/LoginRegister.css'; // Make sure path is correct
import Logo from '@/app/components/Logo';

const Register = () => {
  const [formData, setFormData] = useState({
    fullname: '',
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
    console.log('Register Attempt:', formData);

    // 🔐 BACKEND INTEGRATION HOOK
    // fetch("/api/register", {...})
  };

  return (
    <div className="page-container">
      <div className="auth-box">
        <Logo />
        <h2>supported by SICK AG</h2>
        <h3>Sign Up</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            id="fullname"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
            required
          />
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
          <button type="submit" className="btn">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
