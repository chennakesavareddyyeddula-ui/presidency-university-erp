// =============================================================
// App.tsx — Presidency University ERP Portal
// Root component: routing between Landing, Student, Faculty ERP
// =============================================================

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { StudentDashboard } from './components/StudentDashboard';
import { FacultyDashboard } from './components/FacultyDashboard';
import { ToastContainer } from './components/Toast';

// ---------------------------------------------------------------
// LOADING SCREEN
// ---------------------------------------------------------------
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-800">Presidency University</h2>
        <p className="text-sm text-slate-400 mt-0.5">Loading ERP Portal...</p>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------
// ERP SHELL — Wraps authenticated dashboard pages with sidebar
// ---------------------------------------------------------------
const ERPShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* ---- Sidebar (desktop: fixed left) ---- */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      {/* ---- Mobile sidebar overlay ---- */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ---- Main content area ---- */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* Top bar */}
        <TopBar onMenuClick={() => setMobileSidebarOpen((o) => !o)} />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-3 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Presidency University ERP Portal · All Rights Reserved
          </p>
        </footer>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// APP CONTENT — Decides which page to show
// ---------------------------------------------------------------
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  // Show loading spinner while restoring session
  if (loading) return <LoadingScreen />;

  // NOT logged in → public landing page
  if (!user) {
    return (
      <>
        <Navbar
          onOpenLogin={() => setLoginOpen(true)}
          onOpenRegister={() => setRegisterOpen(true)}
        />

        <LandingPage
          onOpenLogin={() => setLoginOpen(true)}
          onOpenRegister={() => setRegisterOpen(true)}
        />

        {/* Modals */}
        <LoginModal
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
          onSwitchToRegister={() => { setLoginOpen(false); setRegisterOpen(true); }}
        />
        <RegisterModal
          isOpen={registerOpen}
          onClose={() => setRegisterOpen(false)}
          onSwitchToLogin={() => { setRegisterOpen(false); setLoginOpen(true); }}
        />

        <ToastContainer />
      </>
    );
  }

  // STUDENT → Student ERP Portal
  if (user.role === 'student') {
    return (
      <ERPShell>
        <StudentDashboard />
        <ToastContainer />
      </ERPShell>
    );
  }

  // FACULTY → Faculty ERP Portal
  if (user.role === 'faculty') {
    return (
      <ERPShell>
        <FacultyDashboard />
        <ToastContainer />
      </ERPShell>
    );
  }

  // ADMIN → basic admin notice (can expand later)
  return (
    <ERPShell>
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Panel</h1>
        <p className="text-slate-500">Welcome, {user.full_name}. Admin dashboard is coming soon.</p>
      </div>
      <ToastContainer />
    </ERPShell>
  );
};

// ---------------------------------------------------------------
// ROOT APP
// ---------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
