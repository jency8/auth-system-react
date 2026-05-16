import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

const BackgroundOrbs = () => (
  <>
    <div className="orb orb-1" />
    <div className="orb orb-2" />
    <div className="orb orb-3" />
    <div className="dot-grid fixed inset-0 pointer-events-none opacity-30" style={{ zIndex: -1 }} />
  </>
);

const AppContent: React.FC = () => {
  const { page, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 mx-auto mb-3" style={{ color: "#00f5ff" }} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-obsidian-500 text-sm font-mono">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BackgroundOrbs />
      {page === "login" && <LoginPage />}
      {page === "register" && <RegisterPage />}
      {page === "dashboard" && <DashboardPage />}
    </>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
