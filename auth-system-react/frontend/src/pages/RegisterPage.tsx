import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

const RegisterIcon = () => (
  <svg className="w-7 h-7" style={{ color: "#bf5af2" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
  </svg>
);

const UserIcon = () => (
  <svg className="absolute left-3 top-3.5 w-4 h-4 text-obsidian-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
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

function getStrength(val: string) {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  return score;
}

const STRENGTH_COLORS = ["#ff2d78", "#ff9500", "#39ff14", "#00f5ff"];
const STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong"];

const RegisterPage: React.FC = () => {
  const { register, setPage } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [alertError, setAlertError] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);

  const handlePasswordInput = (val: string) => {
    setStrength(val.length ? getStrength(val) : 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setAlertError("");
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (!result.ok) {
      if (result.errors) {
        const errs: Record<string, string> = {};
        result.errors.forEach(err => { errs[err.field] = err.message; });
        setFieldErrors(errs);
      } else {
        setAlertError(result.message || "Registration failed.");
      }
    }
  };

  const strengthColor = strength > 0 ? STRENGTH_COLORS[strength - 1] : "";
  const strengthLabel = password.length && strength > 0 ? STRENGTH_LABELS[strength - 1] : "";

  return (
    <div className="page-container min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
               style={{ background: "linear-gradient(135deg, rgba(191,90,242,0.15) 0%, rgba(0,245,255,0.15) 100%)", border: "1px solid rgba(191,90,242,0.2)", boxShadow: "0 0 30px rgba(191,90,242,0.1)" }}>
            <RegisterIcon />
          </div>
          <h1 className="font-display font-800 text-2xl text-white" style={{ fontWeight: 800, fontFamily: "'Syne',sans-serif" }}>AuthSystem</h1>
          <p className="text-obsidian-500 text-sm mt-1">Create your account</p>
        </div>

        <div className="glass-card p-8">
          <div className="mb-6">
            <h2 className="font-display font-700 text-xl text-white" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>Get started</h2>
            <p className="text-obsidian-400 text-sm mt-1">Set up your secure account</p>
          </div>

          {alertError && (
            <div className="alert-error mb-5">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <span>{alertError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="reg-name" className="label-text">Full Name</label>
              <div className="relative">
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  className={`input-field pl-10${fieldErrors.name ? " border-red-500/60 ring-1 ring-red-500/30" : ""}`}
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <UserIcon />
              </div>
              {fieldErrors.name && <p className="error-msg">{fieldErrors.name}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="reg-email" className="label-text">Email</label>
              <div className="relative">
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  className={`input-field pl-10${fieldErrors.email ? " border-red-500/60 ring-1 ring-red-500/30" : ""}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <EmailIcon />
              </div>
              {fieldErrors.email && <p className="error-msg">{fieldErrors.email}</p>}
            </div>

            <div className="mb-2">
              <label htmlFor="reg-password" className="label-text">Password</label>
              <PasswordInput
                id="reg-password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                placeholder="Min. 8 chars"
                onInput={handlePasswordInput}
              />
              <div className="flex gap-1 mt-2">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="strength-bar flex-1"
                    style={{ background: i < strength ? strengthColor : "rgba(255,255,255,0.08)" }}
                  />
                ))}
              </div>
              {strengthLabel && (
                <p className="text-xs mt-1" style={{ color: strengthColor }}>{strengthLabel}</p>
              )}
              {fieldErrors.password && <p className="error-msg">{fieldErrors.password}</p>}
            </div>

            <p className="text-obsidian-600 text-xs mb-6">Must include uppercase, lowercase, and a number</p>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #bf5af2 0%, #9b4ed4 100%)", boxShadow: "0 0 20px rgba(191,90,242,0.3)", color: "white" }}
            >
              {loading ? <><SpinIcon /> Creating account...</> : "Create Account"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-obsidian-700/50 text-center">
            <p className="text-obsidian-500 text-sm">
              Already have an account?{" "}
              <button onClick={() => setPage("login")} className="hover:text-white transition-colors ml-1" style={{ color: "#bf5af2" }}>
                Sign in →
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
