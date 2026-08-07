// =============================================================
// RegisterModal.tsx — Presidency University ERP Portal
// Registration form: Name, Email, Phone, Role, Roll No, Photo, Password
// =============================================================

import React, { useState, useRef } from 'react';
import { X, User, Mail, Phone, Lock, Hash, BookOpen, Eye, EyeOff, GraduationCap, ChevronDown, Camera, Upload, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, type RegisterPayload } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<Props> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { setAuth, showToast } = useAuth();

  const [form, setForm] = useState<RegisterPayload>({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    phone_number: '',
    roll_number: '',
    department: 'Computer Science & Engineering',
    year: 3,
    section: 'A',
    profile_pic: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterPayload | 'confirmPassword', string>>>({});

  // Camera / Photo states
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    else if (!/^\+?[0-9]{10,15}$/.test(form.phone_number.replace(/\s/g, '')))
      newErrors.phone_number = 'Enter a valid phone number';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (form.role === 'student' && !form.roll_number?.trim())
      newErrors.roll_number = 'Roll number is required for students';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await api.register(form);
      setAuth(result.user, result.access_token);
      showToast(`Welcome to Presidency University ERP, ${result.user.full_name}! 🎉`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const update = (field: keyof RegisterPayload, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      update('profile_pic', reader.result as string);
      showToast('Face photo uploaded successfully! 📸', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Live camera start/capture
  const startCamera = async () => {
    try {
      setShowCamera(true);
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      showToast('Unable to access camera. Please allow camera permissions.', 'error');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.85);
    update('profile_pic', base64);
    stopCamera();
    showToast('Face photo captured! 📸', 'success');
  };

  const departments = [
    'Computer Science & Engineering',
    'Information Science & Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical & Electronics Engineering',
    'Artificial Intelligence & Machine Learning',
    'Data Science',
  ];

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up"
        style={{ maxHeight: '95vh' }}
      >
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
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Student / Faculty Registration</h2>
              <p className="text-blue-200 text-xs mt-0.5">Presidency University ERP Portal</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(95vh - 120px)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="form-label">I am registering as</label>
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'faculty'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => update('role', r)}
                    className={`
                      py-3 px-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all
                      ${form.role === r
                        ? 'border-blue-700 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }
                    `}
                  >
                    {r === 'student' ? '🎓 Student' : '👨‍🏫 Faculty'}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile / Face Photo Capture/Upload Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="form-label text-xs uppercase tracking-wider text-slate-500">
                Face Registration Photo *
              </label>

              {form.profile_pic ? (
                <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <img src={form.profile_pic} alt="Profile" className="w-12 h-12 rounded-lg object-cover border" />
                    <div>
                      <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Face Photo Added
                      </p>
                      <p className="text-[11px] text-slate-400">Used for face recognition attendance</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => update('profile_pic', '')}
                    className="text-xs text-red-500 hover:underline px-2"
                  >
                    Remove
                  </button>
                </div>
              ) : showCamera ? (
                <div className="space-y-2">
                  <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="btn-primary flex-1 py-2 text-xs"
                    >
                      <Camera className="w-4 h-4" /> Capture Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="btn-secondary py-2 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="btn-secondary py-2.5 text-xs flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-blue-600" />
                    Take Selfie Photo
                  </button>
                  <label className="btn-secondary py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    Upload Photo File
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="form-label">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={form.full_name}
                  onChange={(e) => update('full_name', e.target.value)}
                  className={`form-input pl-10 ${errors.full_name ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </div>
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className={`form-input pl-10 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="form-label">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone_number}
                  onChange={(e) => update('phone_number', e.target.value)}
                  className={`form-input pl-10 ${errors.phone_number ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </div>
              {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
            </div>

            {/* Roll Number (student only) */}
            {form.role === 'student' && (
              <div>
                <label className="form-label">Roll Number *</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. 21CSE001"
                    value={form.roll_number}
                    onChange={(e) => update('roll_number', e.target.value)}
                    className={`form-input pl-10 ${errors.roll_number ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                </div>
                {errors.roll_number && <p className="text-xs text-red-500 mt-1">{errors.roll_number}</p>}
              </div>
            )}

            {/* Department + Year + Section (student only) */}
            {form.role === 'student' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3">
                  <label className="form-label">Department</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={form.department}
                      onChange={(e) => update('department', e.target.value)}
                      className="form-select pl-10 pr-10"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Year</label>
                  <select
                    value={form.year}
                    onChange={(e) => update('year', Number(e.target.value))}
                    className="form-select"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="form-label">Section</label>
                  <select
                    value={form.section}
                    onChange={(e) => update('section', e.target.value)}
                    className="form-select"
                  >
                    {['A', 'B', 'C', 'D'].map((s) => (
                      <option key={s} value={s}>Section {s}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="form-label">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className={`form-input pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`form-input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create My Account'
              )}
            </button>

            {/* Switch to login */}
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-700 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
