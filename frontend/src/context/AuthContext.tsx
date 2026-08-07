// =============================================================
// AuthContext.tsx — Presidency University ERP Portal
// Global authentication state + toast notification system
// =============================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../services/api';
import { api } from '../services/api';

// ---------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// Navigation views available in the ERP
export type StudentView =
  | 'dashboard'
  | 'profile'
  | 'attendance'
  | 'timetable'
  | 'marks'
  | 'results'
  | 'fee'
  | 'library'
  | 'placements'
  | 'internships'
  | 'downloads'
  | 'settings'
  | 'support';

export type FacultyView =
  | 'dashboard'
  | 'attendance'
  | 'marks'
  | 'roster'
  | 'timetable'
  | 'reports'
  | 'profile'
  | 'settings';

export type AdminView = 'dashboard' | 'students' | 'faculty' | 'attendance' | 'settings';

interface AuthContextType {
  // Auth state
  user: User | null;
  token: string | null;
  loading: boolean;
  // Navigation
  studentView: StudentView;
  facultyView: FacultyView;
  adminView: AdminView;
  setStudentView: (v: StudentView) => void;
  setFacultyView: (v: FacultyView) => void;
  setAdminView: (v: AdminView) => void;
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

// ---------------------------------------------------------------
// CONTEXT
// ---------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------
// PROVIDER
// ---------------------------------------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Navigation state
  const [studentView, setStudentView] = useState<StudentView>('dashboard');
  const [facultyView, setFacultyView] = useState<FacultyView>('dashboard');
  const [adminView, setAdminView] = useState<AdminView>('dashboard');

  // On mount: verify stored token and restore session
  useEffect(() => {
    const restoreSession = async () => {
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me);
        } catch {
          // Token expired or invalid — clear it
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []); // only run on mount

  /** Store auth credentials and update state */
  const setAuth = useCallback((newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('auth_token', newToken);
    // Reset navigation to dashboard on new login
    setStudentView('dashboard');
    setFacultyView('dashboard');
  }, []);

  /** Clear session and return to landing page */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    showToast('You have been logged out successfully.', 'info');
  }, []);

  /** Show a toast notification for 4.5 seconds */
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4500);
  }, []);

  /** Remove a toast by ID */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        studentView,
        facultyView,
        adminView,
        setStudentView,
        setFacultyView,
        setAdminView,
        setAuth,
        logout,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------------
// HOOK
// ---------------------------------------------------------------

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
