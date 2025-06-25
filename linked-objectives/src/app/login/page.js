"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import "@/app/styles/LoginRegister.css";
import Logo from "@/app/components/Logo";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-box">
        <Logo />
        <h2>supported by SICK AG</h2>
        <h3>Log In</h3>
        <form onSubmit={handleSubmit}>
          {loading && <p className="loading-text">🔄 Logging in...</p>}
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <span
              className="eye-icon"
              onClick={togglePasswordVisibility}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Please wait..." : "Log In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
