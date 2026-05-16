import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { TokenManager } from "../utils/tokenManager";
import apiClient from "../utils/apiClient";

interface Session {
  createdAt: string;
  expiresAt: string;
  userAgent: string;
  ip: string;
}

const SpinIcon = () => (
  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

const DashboardPage: React.FC = () => {
  const { user, accessToken, logout, logoutAll } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tokenExp, setTokenExp] = useState("");
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadSessions = useCallback(async () => {
    const res = await apiClient.get<{ success: boolean; data: { sessions: Session[]; count: number } }>("/auth/sessions");
    if (res.ok) setSessions(res.data.data.sessions);
  }, []);

  useEffect(() => {
    loadSessions();
    const token = TokenManager.getAccessToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setTokenExp(new Date(payload.exp * 1000).toLocaleTimeString());
      } catch {}
    }
  }, [loadSessions]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  const handleLogoutAll = async () => {
    await logoutAll();
  };

  const copyToken = () => {
    const token = TokenManager.getAccessToken();
    if (!token) return;
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const avatar = user?.name?.[0]?.toUpperCase() ?? "?";
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div className="page-container min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(191,90,242,0.15) 100%)", border: "1px solid rgba(0,245,255,0.2)" }}>
              <svg className="w-5 h-5" style={{ color: "#00f5ff" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div>
              <h1 className="font-display font-800 text-white text-lg" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800 }}>Dashboard</h1>
              <p className="text-obsidian-500 text-xs">Authenticated session</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLogoutAll}
              className="btn-ghost text-sm py-2 px-4"
              style={{ width: "auto", borderColor: "rgba(255,45,120,0.3)", color: "rgba(255,45,120,0.8)" }}
            >
              Logout All Devices
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-ghost text-sm py-2 px-4 flex items-center gap-2"
              style={{ width: "auto" }}
            >
              {loggingOut ? <><SpinIcon /> Logging out...</> : "Sign Out"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* User Profile Card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: "#00f5ff" }} />
              <h2 className="font-display font-700 text-white text-sm uppercase tracking-widest" style={{ fontFamily: "'Syne',sans-serif" }}>User Profile</h2>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-800 flex-shrink-0"
                   style={{ background: "linear-gradient(135deg, rgba(0,245,255,0.15), rgba(191,90,242,0.15))", border: "1px solid rgba(0,245,255,0.2)", fontFamily: "'Syne',sans-serif", fontWeight: 800, color: "#00f5ff" }}>
                {avatar}
              </div>
              <div>
                <p className="font-display font-700 text-white text-lg" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>{user?.name}</p>
                <p className="text-obsidian-400 text-sm font-mono">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-obsidian-700/30">
                <span className="text-obsidian-500 text-xs uppercase tracking-widest">Role</span>
                <span className="tag-pill text-xs">{user?.role?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-obsidian-700/30">
                <span className="text-obsidian-500 text-xs uppercase tracking-widest">User ID</span>
                <span className="font-mono text-xs text-obsidian-400 truncate max-w-32">{user?.id}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-obsidian-500 text-xs uppercase tracking-widest">Joined</span>
                <span className="text-xs text-obsidian-400">{joinedDate}</span>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full" style={{ background: "#bf5af2" }} />
                <h2 className="font-display font-700 text-white text-sm uppercase tracking-widest" style={{ fontFamily: "'Syne',sans-serif" }}>Active Sessions</h2>
              </div>
              <span className="tag-pill" style={{ color: "#bf5af2", background: "rgba(191,90,242,0.1)", borderColor: "rgba(191,90,242,0.2)" }}>
                {sessions.length} active
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessions.length === 0 ? (
                <p className="text-obsidian-600 text-xs">Loading sessions...</p>
              ) : sessions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-obsidian-700/30" style={{ background: "rgba(22,22,43,0.5)" }}>
                  <div className="w-2 h-2 rounded-full mt-1.5 animate-pulse" style={{ background: "#00f5ff" }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-obsidian-400 font-mono truncate">{s.userAgent || "Unknown device"}</div>
                    <div className="text-xs text-obsidian-500 mt-0.5">IP: {s.ip || "N/A"} · Expires: {new Date(s.expiresAt).toLocaleDateString()}</div>
                  </div>
                  <span className="text-xs tag-pill">Session {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* JWT Token */}
          <div className="glass-card p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full" style={{ background: "#39ff14" }} />
                <h2 className="font-display font-700 text-white text-sm uppercase tracking-widest" style={{ fontFamily: "'Syne',sans-serif" }}>JWT Access Token</h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "#39ff14" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Expires: <span className="font-mono">{tokenExp}</span>
                </div>
                <button onClick={copyToken} className="p-1.5 rounded-lg hover:bg-obsidian-700/50 transition-colors text-obsidian-400 hover:text-obsidian-200">
                  {copied
                    ? <svg className="w-4 h-4" style={{ color: "#39ff14" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  }
                </button>
              </div>
            </div>
            <div className="token-display">{accessToken || "Loading..."}</div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.1)" }}>
                <p className="text-obsidian-500 text-xs uppercase tracking-widest mb-1">Access</p>
                <p className="font-mono text-xs" style={{ color: "#00f5ff" }}>15 minutes</p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: "rgba(191,90,242,0.05)", border: "1px solid rgba(191,90,242,0.1)" }}>
                <p className="text-obsidian-500 text-xs uppercase tracking-widest mb-1">Refresh</p>
                <p className="font-mono text-xs" style={{ color: "#bf5af2" }}>7 days</p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ background: "rgba(57,255,20,0.05)", border: "1px solid rgba(57,255,20,0.1)" }}>
                <p className="text-obsidian-500 text-xs uppercase tracking-widest mb-1">Storage</p>
                <p className="font-mono text-xs" style={{ color: "#39ff14" }}>HttpOnly</p>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="glass-card p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: "#ff2d78" }} />
              <h2 className="font-display font-700 text-white text-sm uppercase tracking-widest" style={{ fontFamily: "'Syne',sans-serif" }}>Security Features</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { color: "#00f5ff", bg: "rgba(0,245,255,0.04)", border: "rgba(0,245,255,0.08)", title: "Token Rotation", sub: "On every refresh", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/> },
                { color: "#bf5af2", bg: "rgba(191,90,242,0.04)", border: "rgba(191,90,242,0.08)", title: "Brute Force", sub: "5 attempts limit", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/> },
                { color: "#39ff14", bg: "rgba(57,255,20,0.04)", border: "rgba(57,255,20,0.08)", title: "Rate Limiting", sub: "10 req / 15 min", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/> },
                { color: "#ff2d78", bg: "rgba(255,45,120,0.04)", border: "rgba(255,45,120,0.08)", title: "Reuse Detection", sub: "All sessions revoked", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/> },
              ].map((feat, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: feat.bg, border: `1px solid ${feat.border}` }}>
                  <div className="w-6 h-6 mb-2">
                    <svg fill="none" stroke={feat.color} viewBox="0 0 24 24">{feat.icon}</svg>
                  </div>
                  <p className="text-white text-xs font-display font-600" style={{ fontFamily: "'Syne',sans-serif" }}>{feat.title}</p>
                  <p className="text-obsidian-500 text-xs mt-0.5">{feat.sub}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
