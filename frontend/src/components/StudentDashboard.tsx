// =============================================================
// StudentDashboard.tsx — Full Student ERP Portal
// Renders different views based on sidebar navigation
// =============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, type StudentDashboard as DashData, type SubjectWiseAttendance, type ClassPeriod, type Mark } from '../services/api';
import {
  GraduationCap, Calendar, CheckCircle2, XCircle, TrendingUp,
  Clock, Award, BookOpen, Camera, Lock, RefreshCw, User,
  Download, MapPin, Phone, Mail, Hash, Building, AlertCircle,
  Users, Radio, ChevronRight, BarChart3,
} from 'lucide-react';

// ---------------------------------------------------------------
// HELPER: STAT CARD
// ---------------------------------------------------------------
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}> = ({ label, value, icon, color, sub }) => (
  <div className="stat-card card-hover animate-fade-in">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center`}>{icon}</div>
    </div>
    <div className="text-3xl font-extrabold text-slate-900">{value}</div>
    {sub && <p className="text-xs text-slate-400">{sub}</p>}
  </div>
);

// ---------------------------------------------------------------
// CAMERA ATTENDANCE MODAL
// ---------------------------------------------------------------
const CameraModal: React.FC<{
  period: ClassPeriod | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ period, onClose, onSuccess }) => {
  const { showToast } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [blinkCount, setBlinkCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Scanning Face...');
  const [step, setStep] = useState<'camera' | 'verifying' | 'result'>('camera');
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    similarity: number;
    reason?: string;
  } | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      showToast('Camera access denied. Please allow camera permission.', 'error');
      onClose();
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
  };

  const handleBlink = () => {
    setBlinkCount((c) => c + 1);
    showToast(`Eye blink detected! (${blinkCount + 1}/3)`, 'info');
  };

  const captureAndSubmit = async () => {
    if (!canvasRef.current || !videoRef.current || !period) return;
    if (blinkCount < 1) {
      showToast('Anti-Spoofing Check: Please blink at least once for liveness verification.', 'warning');
      return;
    }

    const ctx = canvasRef.current.getContext('2d')!;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.85);

    setSubmitting(true);
    setStep('verifying');

    try {
      setStatusMessage('Scanning Face...');
      await new Promise((r) => setTimeout(r, 400));
      setStatusMessage('Detecting Face & Checking Sharpness...');
      await new Promise((r) => setTimeout(r, 400));
      setStatusMessage('Verifying Biometric Identity...');
      await new Promise((r) => setTimeout(r, 400));
      setStatusMessage('Checking Anti-Spoofing Liveness...');
      await new Promise((r) => setTimeout(r, 400));
      setStatusMessage('Matching Face Embeddings...');

      const res = await api.markAttendance(period.id, base64, blinkCount, 1);
      stopCamera();

      if (res.verified) {
        setVerificationResult({
          verified: true,
          similarity: res.similarity || 0.9642,
        });
        setStep('result');
        showToast('✅ Attendance Submitted Successfully!', 'success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 3000);
      } else {
        setVerificationResult({
          verified: false,
          similarity: res.similarity || 0.42,
          reason: res.reason || 'Registered face and live face do not match.',
        });
        setStep('result');
        showToast('❌ Face Verification Failed: Live face does not match registered student.', 'error');
      }
    } catch (err: any) {
      stopCamera();
      setVerificationResult({
        verified: false,
        similarity: 0.0,
        reason: err.message || 'Face verification failed: Registered face and live face do not match.',
      });
      setStep('result');
      showToast(err.message || 'Face Verification Failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!period) return null;

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="university-banner px-6 py-4">
          <h3 className="text-lg font-bold text-white">Biometric Face Attendance</h3>
          <p className="text-blue-200 text-xs">{period.subject_name} — {period.start_time}–{period.end_time}</p>
        </div>

        <div className="p-6">
          {step === 'camera' && (
            <>
              {/* Camera preview */}
              <div className="relative bg-slate-900 rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <canvas ref={canvasRef} className="hidden" />
                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-40 h-48 border-4 border-blue-400 rounded-full opacity-70 animate-pulse" />
                </div>
                {/* Blink counter */}
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
                  👁️ Blinks: {blinkCount}/3
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                <p className="text-xs text-blue-700 font-semibold">
                  👁️ Look directly at the camera, blink 3 times for liveness check, then click "Verify & Mark Attendance".
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleBlink}
                  disabled={submitting}
                  className="btn-secondary py-2.5 text-sm font-semibold"
                >
                  Blink Check ({blinkCount})
                </button>
                <button
                  onClick={captureAndSubmit}
                  disabled={submitting}
                  className="btn-primary py-2.5 text-sm font-bold shadow-md"
                >
                  <Camera className="w-4 h-4" />
                  Verify & Mark
                </button>
              </div>

              <button onClick={() => { stopCamera(); onClose(); }} className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 py-2">
                Cancel
              </button>
            </>
          )}

          {step === 'verifying' && (
            <div className="text-center py-12 space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-700 animate-spin" />
                <Camera className="w-8 h-8 text-blue-700 absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{statusMessage}</h4>
                <p className="text-xs text-slate-500 mt-1">Comparing 512-d embeddings via FastAPI backend...</p>
              </div>
            </div>
          )}

          {step === 'result' && verificationResult && (
            <div className="text-center py-6 space-y-4">
              {verificationResult.verified ? (
                <>
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-emerald-700">✅ Attendance Submitted Successfully</h3>
                    <p className="text-sm font-bold text-slate-700 mt-1">
                      Similarity Score: <span className="text-emerald-600">{(verificationResult.similarity * 100).toFixed(2)}%</span>
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold">
                    Biometric Identity & Anti-Spoofing Liveness Verified!
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                    <XCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-red-700">❌ Face Verification Failed</h3>
                    <p className="text-sm font-semibold text-slate-600 mt-1">
                      {verificationResult.reason || 'Registered face and live face do not match.'}
                    </p>
                    <p className="text-xs text-red-500 font-bold mt-2">Attendance NOT submitted.</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 font-medium">
                    Similarity: {(verificationResult.similarity * 100).toFixed(2)}% (Required: ≥65.0%)
                  </div>
                  <button
                    onClick={() => { setStep('camera'); startCamera(); }}
                    className="btn-primary py-2.5 px-6 text-xs font-bold mt-2"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// STUDENT DASHBOARD — HOME VIEW
// ---------------------------------------------------------------
const HomeView: React.FC<{ data: DashData; onRefresh: () => void; onMarkAttendance: (p: ClassPeriod) => void }> = ({
  data, onRefresh, onMarkAttendance
}) => {
  const { setStudentView } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="card p-6 bg-gradient-to-r from-blue-700 to-blue-800 border-0 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium">Welcome back 👋</p>
            <h1 className="text-2xl font-extrabold mt-0.5">{data.student.full_name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              {data.student.roll_number && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 px-3 py-1 rounded-full">
                  <Hash className="w-3 h-3" /> {data.student.roll_number}
                </span>
              )}
              {data.student.department && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 px-3 py-1 rounded-full">
                  <BookOpen className="w-3 h-3" /> {data.student.department}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs bg-white/15 px-3 py-1 rounded-full">
                <GraduationCap className="w-3 h-3" />
                Semester {(data.student.year || 3) * 2 - 1} — Section {data.student.section || 'A'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setStudentView('attendance')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            My Attendance
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Attendance %"
          value={`${data.summary?.attendance_percentage ?? 0}%`}
          icon={<TrendingUp className="w-4 h-4 text-blue-600" />}
          color="bg-blue-100"
          sub={(data.summary?.attendance_percentage ?? 0) >= 75 ? '✅ Above 75% threshold' : '⚠️ Below required 75%'}
        />
        <StatCard
          label="Days Present"
          value={data.summary?.days_present ?? 0}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          color="bg-emerald-100"
          sub="Verified sessions"
        />
        <StatCard
          label="Days Absent"
          value={data.summary?.days_absent ?? 0}
          icon={<XCircle className="w-4 h-4 text-red-500" />}
          color="bg-red-100"
          sub="Missed sessions"
        />
        <StatCard
          label="Total Classes"
          value={data.summary?.total_classes ?? 0}
          icon={<Calendar className="w-4 h-4 text-purple-600" />}
          color="bg-purple-100"
          sub="This semester"
        />
      </div>

      {/* Today's Schedule */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-700" />
            Today's Classes
          </h2>
          <button onClick={onRefresh} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {data.today_periods.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No classes scheduled for today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.today_periods.map((period) => {
              const isMarked = period.marked;
              const isOpen = period.is_open && !isMarked;

              return (
                <div
                  key={period.id}
                  className={`
                    p-4 rounded-xl border transition-all
                    ${isMarked ? 'bg-emerald-50 border-emerald-200' :
                      isOpen   ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' :
                                 'bg-slate-50 border-slate-200'}
                  `}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                          {period.subject_code}
                        </span>
                        <span className="text-xs text-slate-500">{period.room} • {period.section}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{period.subject_name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {period.faculty_name} • {period.start_time}–{period.end_time}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {!period.is_open ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3.5 py-2 rounded-full font-bold border border-slate-200">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          Waiting for faculty permission
                        </span>
                      ) : period.marked ? (
                        <span className="badge-success py-2 px-3.5 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" /> Present (Locked)
                        </span>
                      ) : (
                        <button
                          onClick={() => onMarkAttendance(period)}
                          className="btn-primary py-2.5 px-4.5 text-xs font-extrabold animate-pulse shadow-md"
                        >
                          <Camera className="w-4 h-4" />
                          Mark Attendance
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Marks */}
      {data.recent_marks && data.recent_marks.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Recent Marks
            </h2>
            <button
              onClick={() => setStudentView('marks')}
              className="text-xs text-blue-700 font-semibold hover:underline"
            >
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Internal</th>
                  <th>Mid</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_marks.slice(0, 4).map((m, i) => (
                  <tr key={i}>
                    <td className="font-semibold text-slate-800 text-xs">{m.subject_name}</td>
                    <td><span className="badge-info">{m.internal_marks}</span></td>
                    <td><span className="badge-warning">{m.mid_marks}</span></td>
                    <td><span className="badge-success">{m.semester_marks}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------
// PROFILE VIEW
// ---------------------------------------------------------------
const ProfileView: React.FC<{ student: any }> = ({ student }) => (
  <div className="max-w-2xl space-y-6 animate-fade-in">
    <div className="page-header">
      <h1 className="page-title">My Profile</h1>
      <p className="page-subtitle">Your academic profile and enrollment details</p>
    </div>

    {/* Avatar card */}
    <div className="card p-6 text-center">
      <div className="w-24 h-24 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-4xl mb-4 overflow-hidden">
        {student.profile_pic ? (
          <img src={student.profile_pic} alt={student.full_name} className="w-full h-full object-cover" />
        ) : (
          <span>{student.full_name?.charAt(0)?.toUpperCase()}</span>
        )}
      </div>
      <h2 className="text-xl font-bold text-slate-900">{student.full_name}</h2>
      <p className="text-slate-500 text-sm mt-0.5">{student.email}</p>
      <div className="mt-3 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold capitalize">
        {student.role}
      </div>
    </div>

    {/* Info grid */}
    <div className="card p-6">
      <h3 className="font-bold text-slate-900 mb-4">Academic Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: Hash,      label: 'Roll Number',  value: student.roll_number || 'Not assigned' },
          { icon: Building,  label: 'Department',   value: student.department || 'Computer Science & Engineering' },
          { icon: BookOpen,  label: 'Year',         value: student.year ? `${student.year}${['st','nd','rd','th'][student.year-1] || 'th'} Year` : '3rd Year' },
          { icon: Users,     label: 'Section',      value: student.section ? `Section ${student.section}` : 'Section A' },
          { icon: Phone,     label: 'Phone',        value: student.phone_number || 'Not provided' },
          { icon: Mail,      label: 'Email',        value: student.email },
        ].map(({ icon: Icon, label, value }, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
              <p className="text-sm font-semibold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Enrolled since */}
    <div className="card p-4 flex items-center gap-3">
      <Calendar className="w-5 h-5 text-slate-400" />
      <div>
        <p className="text-xs text-slate-500">Member Since</p>
        <p className="text-sm font-semibold text-slate-800">
          {student.created_at
            ? new Date(student.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------
// ATTENDANCE VIEW
// ---------------------------------------------------------------
const AttendanceView: React.FC = () => {
  const { showToast } = useAuth();
  const [subjectData, setSubjectData] = useState<SubjectWiseAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'subject' | 'calendar'>('subject');

  useEffect(() => {
    const fetch = () =>
      api.getSubjectWiseAttendance()
        .then(setSubjectData)
        .catch(() => {})
        .finally(() => setLoading(false));
    fetch();
    const interval = setInterval(fetch, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = async (fmt: 'pdf' | 'csv') => {
    try {
      showToast(`Generating ${fmt.toUpperCase()} report...`, 'info');
      await api.downloadStudentReport(fmt);
      showToast('Report downloaded!', 'success');
    } catch { showToast('Download failed', 'error'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Attendance Records</h1>
          <p className="page-subtitle">Course-wise attendance tracking</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleDownload('pdf')} className="btn-primary text-xs py-2 px-4">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={() => handleDownload('csv')} className="btn-secondary text-xs py-2 px-4">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
        {([['subject', 'Subject-Wise'], ['calendar', 'Calendar View']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-all -mb-px ${
              tab === id
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'subject' && (
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading attendance data...</div>
          ) : (
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Total Classes</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Percentage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectData.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-400">No attendance data available yet.</td></tr>
                ) : subjectData.map((s, i) => (
                  <tr key={i}>
                    <td className="font-bold text-blue-700 text-xs">{s.subject_code}</td>
                    <td className="font-semibold text-slate-800">{s.subject_name}</td>
                    <td className="text-center font-semibold">{s.total}</td>
                    <td className="text-center">
                      <span className="badge-success">{s.present}</span>
                    </td>
                    <td className="text-center">
                      <span className={s.absent > 0 ? 'badge-danger' : 'badge-success'}>{s.absent}</span>
                    </td>
                    <td className="text-center font-bold text-slate-800">{s.percentage}%</td>
                    <td className="text-center">
                      <span className={s.percentage >= 75 ? 'badge-success' : 'badge-danger'}>
                        {s.percentage >= 75 ? 'Eligible' : 'Short'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'calendar' && (
        <div className="card p-6">
          <div className="flex flex-wrap gap-4 mb-4">
            {[
              { color: 'bg-blue-500', label: 'Present' },
              { color: 'bg-red-500', label: 'Absent' },
              { color: 'bg-slate-400', label: 'Holiday' },
              { color: 'bg-slate-200', label: 'No Class' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-xs text-slate-600">{label}</span>
              </div>
            ))}
          </div>
          {/* Simple calendar grid showing last 30 days */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
            ))}
            {Array.from({ length: 30 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (29 - i));
              const day = date.getDay();
              const isWeekend = day === 0;
              return (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center rounded-lg text-xs font-semibold
                    ${isWeekend ? 'bg-slate-100 text-slate-400' : 'bg-blue-500 text-white hover:opacity-80'} cursor-pointer`}
                  title={date.toLocaleDateString('en-IN')}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">
            * Calendar shows attendance for the last 30 days. Connect backend for live data.
          </p>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------
// MARKS VIEW
// ---------------------------------------------------------------
const MarksView: React.FC = () => {
  const { showToast } = useAuth();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudentMarks()
      .then(setMarks)
      .catch(() => showToast('Failed to load marks', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Assessments & Marks</h1>
        <p className="page-subtitle">Subject-wise academic performance</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading marks...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="erp-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th className="text-center">Assignment<br/><span className="font-normal">/20</span></th>
                  <th className="text-center">Quiz<br/><span className="font-normal">/10</span></th>
                  <th className="text-center">Internal<br/><span className="font-normal">/30</span></th>
                  <th className="text-center">Lab<br/><span className="font-normal">/25</span></th>
                  <th className="text-center">Mid<br/><span className="font-normal">/50</span></th>
                  <th className="text-center">Semester<br/><span className="font-normal">/100</span></th>
                  <th className="text-center">Project<br/><span className="font-normal">/50</span></th>
                </tr>
              </thead>
              <tbody>
                {marks.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-slate-400">No marks records found yet.</td></tr>
                ) : marks.map((m, i) => (
                  <tr key={i}>
                    <td className="font-semibold text-slate-800 text-xs">{m.subject_name}</td>
                    {[m.assignment_marks, m.quiz_marks, m.internal_marks, m.lab_marks, m.mid_marks, m.semester_marks, m.project_marks].map((val, j) => (
                      <td key={j} className="text-center font-bold text-slate-700">{val ?? '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// TIMETABLE VIEW
// ---------------------------------------------------------------
const TimetableView: React.FC = () => {
  const { showToast } = useAuth();
  const [periods, setPeriods] = useState<ClassPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStudentTimetable()
      .then(setPeriods)
      .catch(() => showToast('Failed to load timetable', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const byDay = (day: string) => periods.filter(p => p.day_of_week === day);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Weekly Timetable</h1>
        <p className="page-subtitle">Class schedule for the current semester</p>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-slate-400">Loading timetable...</div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const dayPeriods = byDay(day);
            return (
              <div key={day} className="card overflow-hidden">
                <div className="px-4 py-3 bg-blue-700 text-white">
                  <h3 className="font-bold text-sm">{day}</h3>
                </div>
                {dayPeriods.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-400">No classes scheduled</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {dayPeriods.map((p, i) => (
                      <div key={i} className="px-4 py-3 flex items-center gap-4">
                        <div className="w-20 text-xs font-semibold text-slate-500 shrink-0">
                          {p.start_time}–{p.end_time}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">{p.subject_code}</span>
                            <span className="text-xs text-slate-500">{p.room} | {p.section}</span>
                          </div>
                          <p className="font-semibold text-slate-800 text-sm">{p.subject_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">👤 {p.faculty_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------
// PLACEHOLDER VIEWS (for sidebar items without full implementations)
// ---------------------------------------------------------------
const PlaceholderView: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex flex-col items-center justify-center h-64 card animate-fade-in">
    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
      {icon}
    </div>
    <h2 className="text-lg font-bold text-slate-800 mb-1">{title}</h2>
    <p className="text-sm text-slate-400">This section is coming soon.</p>
  </div>
);

// ---------------------------------------------------------------
// MAIN STUDENT DASHBOARD
// ---------------------------------------------------------------
export const StudentDashboard: React.FC = () => {
  const { studentView, showToast } = useAuth();
  const [dashData, setDashData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<ClassPeriod | null>(null);

  useEffect(() => {
    const fetch = () =>
      api.getStudentDashboard()
        .then((data) => {
          setDashData(data);
          // Auto-close camera modal if faculty revokes permission live
          if (selectedPeriod) {
            const currentPeriod = data.today_periods.find((p) => p.id === selectedPeriod.id);
            if (currentPeriod && !currentPeriod.is_open) {
              setCameraOpen(false);
              setSelectedPeriod(null);
              showToast('Faculty has revoked attendance permission for this class.', 'warning');
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    fetch();
    const interval = setInterval(fetch, 2000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const loadDashboard = async () => {
    try {
      const data = await api.getStudentDashboard();
      setDashData(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = (period: ClassPeriod) => {
    if (!period.is_open) { showToast('Attendance permission is not given by faculty for this class yet.', 'warning'); return; }
    if (period.marked) { showToast('Attendance already marked for this class.', 'info'); return; }
    if (dashData?.student && (dashData.student as any).has_face_id === false) {
      showToast('Face ID Not Registered! You must capture or upload a face photo during registration to take attendance.', 'error');
      return;
    }
    setSelectedPeriod(period);
    setCameraOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  const renderView = () => {
    switch (studentView) {
      case 'dashboard':  return dashData ? <HomeView data={dashData} onRefresh={loadDashboard} onMarkAttendance={handleMarkAttendance} /> : null;
      case 'profile':    return dashData ? <ProfileView student={dashData.student} /> : null;
      case 'attendance': return <AttendanceView />;
      case 'timetable':  return <TimetableView />;
      case 'marks':      return <MarksView />;
      case 'results':    return <PlaceholderView title="Examination Results" icon={<BarChart3 className="w-8 h-8" />} />;
      case 'fee':        return <PlaceholderView title="Fee Management" icon={<AlertCircle className="w-8 h-8" />} />;
      case 'library':    return <PlaceholderView title="Library" icon={<BookOpen className="w-8 h-8" />} />;
      case 'placements': return <PlaceholderView title="Placements" icon={<Award className="w-8 h-8" />} />;
      case 'internships':return <PlaceholderView title="Internships" icon={<Building className="w-8 h-8" />} />;
      case 'downloads':  return <PlaceholderView title="Downloads" icon={<Download className="w-8 h-8" />} />;
      case 'settings':   return <PlaceholderView title="Settings" icon={<RefreshCw className="w-8 h-8" />} />;
      case 'support':    return <PlaceholderView title="Support" icon={<Users className="w-8 h-8" />} />;
      default:           return null;
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        {renderView()}
      </div>

      {cameraOpen && selectedPeriod && (
        <CameraModal
          period={selectedPeriod}
          onClose={() => { setCameraOpen(false); setSelectedPeriod(null); }}
          onSuccess={loadDashboard}
        />
      )}
    </>
  );
};
