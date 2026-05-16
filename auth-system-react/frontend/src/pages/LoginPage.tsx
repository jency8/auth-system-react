import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

const LockIcon = () => (
  <svg className="w-7 h-7" style={{ color: "#00f5ff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
  </svg>
);

const EmailIcon = () => (
  <svg className="absolute left-3 top-3.5 w-4 h-4 text-obsidian-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
  </svg>
);

const SpinIcon = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

const LoginPage: React.FC = () => {
  const { login, setPage } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) setError(result.message || "Login failed.");
  };

  return (
    <div className="page-container min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
               style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(191,90,242,0.15) 100%)", border: "1px solid rgba(0,245,255,0.2)", boxShadow: "0 0 30px rgba(0,245,255,0.1)" }}>
            <LockIcon />
          </div>
          <h1 className="font-display font-800 text-2xl text-white text-glow-cyan" style={{ fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>AuthSystem</h1>
          <p className="text-obsidian-500 text-sm mt-1 font-body">Secure access portal</p>
        </div>

        <div className="glass-card p-8">
          <div className="mb-6">
            <h2 className="font-display font-700 text-xl text-white" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>Welcome back</h2>
            <p className="text-obsidian-400 text-sm mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="alert-error mb-5">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="login-email" className="label-text">Email</label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <EmailIcon />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="login-password" className="label-text">Password</label>
              <PasswordInput
                id="login-password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex items-center justify-center gap-2">
              {loading ? <><SpinIcon /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-obsidian-700/50 text-center">
            <p className="text-obsidian-500 text-sm">
              No account?{" "}
              <button onClick={() => setPage("register")} className="hover:text-white transition-colors ml-1" style={{ color: "#00f5ff" }}>
                Create one →
              </button>
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          <span className="tag-pill">JWT Access Token · 15m</span>
          <span className="tag-pill">Refresh Token · 7d</span>
          <span className="tag-pill">HttpOnly Cookie</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
