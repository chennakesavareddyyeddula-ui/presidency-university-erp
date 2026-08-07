// =============================================================
// LoginModal.tsx — Presidency University ERP Portal
// Sign-In modal with email + password
// =============================================================

import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, GraduationCap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { setAuth, showToast } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Email is required'); return; }
    if (!password)     { setError('Password is required'); return; }

    setLoading(true);
    try {
      const result = await api.login({ email: email.trim(), password });
      setAuth(result.user, result.access_token);
      showToast(`Welcome back, ${result.user.full_name}! 👋`, 'success');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick demo fill buttons
  const fillDemo = (type: 'student' | 'faculty' | 'admin') => {
    const demos = {
      student: { email: 'student@presidency.edu', password: 'student123' },
      faculty: { email: 'jinesh@presidency.edu', password: 'faculty123' },
      admin:   { email: 'admin@presidency.edu',   password: 'admin123' },
    };
    setEmail(demos[type].email);
    setPassword(demos[type].password);
    setError('');
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="university-banner p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Sign In</h2>
              <p className="text-blue-200 text-xs mt-0.5">Presidency University ERP Portal</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Quick demo buttons */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['student', 'faculty', 'admin'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => fillDemo(type)}
                  className="py-1.5 px-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-blue-300 transition-all capitalize"
                >
                  {type === 'student' ? '🎓 Student' : type === 'faculty' ? '👨‍🏫 Faculty' : '🔐 Admin'}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={`form-input pl-10 ${error && !email ? 'border-red-400' : ''}`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className={`form-input pl-10 pr-10 ${error ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <X className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  Sign In to ERP Portal
                </>
              )}
            </button>

            {/* Switch to register */}
            <p className="text-center text-sm text-slate-500">
              New student or faculty?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-700 font-semibold hover:underline"
              >
                Register here
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
