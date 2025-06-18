    "use client";

import React, { useState } from 'react';
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';

import '@/app/styles/LoginRegister.css';
import Logo from '@/app/components/Logo';

const Login = () => {
  const router = useRouter();

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: false,
      email: formData.email,
      password: formData.password,
    });

    if (res.ok) {
      const graphRes = await fetch(`/api/getUsername?email=${formData.email}`);
      const json = await graphRes.json();

      if (json.username) {
        router.push(`/homepage/${json.username}`);
      } else {
        router.push("/unauthorized");
      }
    } else {
      alert("❌ Login failed: Check your credentials");
    }
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
