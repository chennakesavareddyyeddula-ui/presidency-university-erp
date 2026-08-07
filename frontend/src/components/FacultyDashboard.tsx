// =============================================================
// FacultyDashboard.tsx — Presidency University ERP Portal
// Faculty portal: attendance control, classroom photo AI, marks entry, roster
// =============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, type FacultyDashboard as FacData, type LiveRosterItem, type RosterStudent } from '../services/api';
import {
  Radio, ToggleLeft, ToggleRight, Users, Award, Download,
  CheckCircle2, Clock, Search, User, Hash, Phone, Mail,
  RefreshCw, BookOpen, Calendar, BarChart3, ChevronDown,
  Camera, Upload, Sparkles, AlertCircle, X,
} from 'lucide-react';

// ---------------------------------------------------------------
// FACULTY HOME VIEW
// ---------------------------------------------------------------
const FacultyHomeView: React.FC<{
  data: FacData;
  onRefresh: () => void;
  onToggleSession: (periodId: number, currentState: boolean) => void;
}> = ({ data, onRefresh, onToggleSession }) => {
  const { setFacultyView } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="card p-6 bg-gradient-to-r from-blue-800 to-blue-900 border-0 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm">Faculty Portal</p>
            <h1 className="text-2xl font-extrabold mt-0.5">Dr. {data.faculty.full_name}</h1>
            <p className="text-blue-200 text-sm mt-1">{data.faculty.email}</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-white/15 rounded-xl">
              <div className="text-2xl font-black">{data.total_students}</div>
              <div className="text-blue-200 text-xs">Students</div>
            </div>
            <div className="text-center px-4 py-2 bg-white/15 rounded-xl">
              <div className="text-2xl font-black">{data.today_attendance_count}</div>
              <div className="text-blue-200 text-xs">Present Today</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
              Student Attendance Permission Controls
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click <span className="font-bold text-emerald-700">"ALLOW STUDENTS TO MARK ATTENDANCE"</span> below for a subject to enable photo verification on student portal.
            </p>
          </div>
          <button onClick={onRefresh} className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {data.today_classes.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No classes assigned.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.today_classes.map((cls) => (
              <div
                key={cls.id}
                className={`p-5 rounded-2xl border-2 transition-all ${
                  cls.is_open ? 'bg-emerald-50/70 border-emerald-400 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black px-2.5 py-0.5 bg-blue-700 text-white rounded-md">
                        {cls.subject_code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{cls.room} • {cls.section}</span>
                      {cls.is_open ? (
                        <span className="badge-success px-2.5 py-0.5 animate-pulse">PERMISSION GIVEN</span>
                      ) : (
                        <span className="badge-warning px-2.5 py-0.5">PERMISSION LOCKED</span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-base">{cls.subject_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {cls.faculty_name || 'Faculty'} • {cls.start_time}–{cls.end_time} •
                      <span className="font-bold text-emerald-700"> {cls.checked_in_count || 0} Students Present</span>
                    </p>
                  </div>

                  <button
                    onClick={() => onToggleSession(cls.id, cls.is_open || false)}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm transition-all shadow-md ${
                      cls.is_open
                        ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-300 animate-pulse'
                    }`}
                  >
                    {cls.is_open ? (
                      <><ToggleRight className="w-5 h-5" /> REVOKE ATTENDANCE PERMISSION</>
                    ) : (
                      <><Radio className="w-5 h-5" /> ALLOW STUDENTS TO MARK ATTENDANCE</>
                    )}
                  </button>
                </div>

                {cls.is_open && (
                  <div className="mt-3 flex items-center justify-between bg-emerald-100 px-4 py-2.5 rounded-xl text-emerald-900 text-xs font-semibold">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Permission ACTIVE! Students can now mark attendance using Selfie Photo + Blink detection.
                    </span>
                    <button
                      onClick={() => setFacultyView('attendance')}
                      className="font-bold text-blue-700 hover:underline shrink-0 ml-2"
                    >
                      AI Classroom Photo →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Camera, label: 'AI Classroom Attendance', view: 'attendance' as const, color: 'bg-indigo-100 text-indigo-700' },
          { icon: Users, label: 'Class Roster', view: 'roster' as const, color: 'bg-blue-100 text-blue-700' },
          { icon: Award, label: 'Enter Marks', view: 'marks' as const, color: 'bg-purple-100 text-purple-700' },
        ].map(({ icon: Icon, label, view, color }) => (
          <button
            key={view}
            onClick={() => setFacultyView(view)}
            className="card p-5 text-center card-hover"
          >
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-700">{label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// ATTENDANCE MANAGEMENT VIEW (Faculty)
// ---------------------------------------------------------------
const AttendanceManageView: React.FC<{
  data: FacData;
  onToggleSession: (periodId: number, currentState: boolean) => void;
}> = ({ data, onToggleSession }) => {
  const { showToast } = useAuth();
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(
    data.today_classes[0]?.id ?? null
  );
  const [liveRoster, setLiveRoster] = useState<LiveRosterItem[]>([]);

  // Classroom photo capture/upload state
  const [classroomImage, setClassroomImage] = useState<string>('');
  const [processingAI, setProcessingAI] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Poll live roster every 3 seconds
  useEffect(() => {
    if (!selectedPeriodId) return;
    const fetch = () =>
      api.getLiveRoster(selectedPeriodId)
        .then((res) => setLiveRoster(res.live_roster))
        .catch(() => {});
    fetch();
    const interval = setInterval(fetch, 3000);
    return () => clearInterval(interval);
  }, [selectedPeriodId]);

  // Handle classroom image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setClassroomImage(reader.result as string);
      showToast('Classroom photo loaded! Click "Process AI Attendance".', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Live camera start/capture
  const startCamera = async () => {
    try {
      setShowCamera(true);
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      showToast('Unable to access camera.', 'error');
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
    setClassroomImage(base64);
    stopCamera();
    showToast('Classroom photo captured!', 'success');
  };

  // Process AI classroom photo
  const handleProcessAI = async () => {
    if (!selectedPeriodId) {
      showToast('Please select a class period first.', 'warning');
      return;
    }
    if (!classroomImage) {
      showToast('Please upload or capture a classroom photo first.', 'warning');
      return;
    }

    setProcessingAI(true);
    try {
      const res = await api.processClassroomAttendance(selectedPeriodId, classroomImage);
      showToast(res.message || 'AI recognition complete!', 'success');
      // Refresh live roster immediately
      const r = await api.getLiveRoster(selectedPeriodId);
      setLiveRoster(r.live_roster);
    } catch (err: any) {
      showToast(err.message || 'Classroom AI recognition failed.', 'error');
    } finally {
      setProcessingAI(false);
    }
  };

  const currentClass = data.today_classes.find((c) => c.id === selectedPeriodId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Manage Attendance & AI Classroom Photo</h1>
        <p className="page-subtitle">Give student attendance permissions or process one classroom photo for auto-attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Sessions List & Classroom Photo Capture/Upload */}
        <div className="space-y-6">
          {/* Sessions List */}
          <div className="card p-5 space-y-3">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center justify-between">
              <span>Today's Sessions</span>
              <span className="text-xs text-slate-400 font-normal">Click class to select</span>
            </h2>
            {data.today_classes.map((cls) => (
              <div
                key={cls.id}
                onClick={() => setSelectedPeriodId(cls.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPeriodId === cls.id ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'bg-white hover:bg-slate-50'
                } ${cls.is_open ? 'border-emerald-300' : 'border-slate-200'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                        {cls.subject_code}
                      </span>
                      {cls.is_open ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md animate-pulse">
                          PERMISSION GIVEN
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                          CLOSED
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{cls.subject_name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{cls.start_time}–{cls.end_time} • {cls.room}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSession(cls.id, cls.is_open || false);
                    }}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      cls.is_open
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                    }`}
                  >
                    {cls.is_open ? 'Revoke Permission' : 'Give Permission'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Classroom Photo AI Section */}
          <div className="card p-5 space-y-4 border-indigo-200 bg-gradient-to-b from-indigo-50/30 to-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                AI Classroom Photo Auto-Attendance
              </h3>
              {currentClass && (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                  {currentClass.subject_code}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Capture or upload ONE classroom photo. AI detects every student face, matches registered embeddings, and automatically marks them Present.
            </p>

            {/* Photo preview / camera container */}
            {classroomImage ? (
              <div className="relative rounded-xl overflow-hidden border border-indigo-200">
                <img src={classroomImage} alt="Classroom" className="w-full h-48 object-cover" />
                <button
                  onClick={() => setClassroomImage('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg text-xs hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : showCamera ? (
              <div className="space-y-2">
                <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-2">
                  <button onClick={capturePhoto} className="btn-primary flex-1 py-2 text-xs">
                    <Camera className="w-4 h-4" /> Capture Classroom
                  </button>
                  <button onClick={stopCamera} className="btn-secondary py-2 text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={startCamera}
                  className="btn-secondary py-3 text-xs flex items-center justify-center gap-2 border-indigo-200 hover:bg-indigo-50"
                >
                  <Camera className="w-4 h-4 text-indigo-600" />
                  Capture Classroom Photo
                </button>
                <label className="btn-secondary py-3 text-xs flex items-center justify-center gap-2 border-indigo-200 hover:bg-indigo-50 cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  Upload Photo File
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}

            <button
              onClick={handleProcessAI}
              disabled={processingAI || !classroomImage}
              className="btn-primary w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md disabled:opacity-50"
            >
              {processingAI ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running AI Face Detection...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Process AI Classroom Photo & Mark Present
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Roster Panel */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              Live Check-In Feed
            </h3>
            <span className="badge-success px-3 py-1">{liveRoster.length} Present</span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Real-time feed of students marked Present (via Selfie or Classroom AI photo)
          </p>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {liveRoster.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No student check-ins recorded yet.</p>
                <p className="text-xs text-slate-400 mt-1">Give permission or upload classroom photo to begin.</p>
              </div>
            ) : (
              liveRoster.map((item) => (
                <div key={item.attendance_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl animate-slide-up">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{item.student_name}</p>
                    <p className="text-xs text-slate-500">{item.roll_number} • Time: {item.timestamp}</p>
                  </div>
                  <span className="badge-success">{item.verify_score}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// CLASS ROSTER VIEW
// ---------------------------------------------------------------
const RosterView: React.FC = () => {
  const { showToast } = useAuth();
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getClassRoster()
      .then(setRoster)
      .catch(() => showToast('Failed to load roster', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = roster.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (s.roll_number || '').toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title">Class Roster</h1>
          <p className="page-subtitle">{roster.length} enrolled students</p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, roll, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading students...</div>
        ) : (
          <table className="erp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Email</th>
                <th>Phone</th>
                <th className="text-center">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">No students found.</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id}>
                  <td className="text-slate-400 font-medium">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold text-xs shrink-0">
                        {s.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{s.full_name}</span>
                    </div>
                  </td>
                  <td className="font-mono text-xs font-bold text-blue-700">{s.roll_number || 'N/A'}</td>
                  <td className="text-slate-500 text-xs">{s.email}</td>
                  <td className="text-slate-500 text-xs">{s.phone_number || 'N/A'}</td>
                  <td className="text-center">
                    <span className="badge-info">{s.total_attended} sessions</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// MARKS ENTRY VIEW
// ---------------------------------------------------------------
const MarksEntryView: React.FC<{ roster: RosterStudent[] }> = ({ roster }) => {
  const { showToast } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student_id: roster[0]?.id ?? 0,
    subject_name: 'Theory of Computation',
    assignment_marks: 0,
    quiz_marks: 0,
    internal_marks: 0,
    lab_marks: 0,
    mid_marks: 0,
    semester_marks: 0,
    project_marks: 0,
  });

  const SUBJECTS = [
    'Theory of Computation', 'Data Analytics', 'Machine Learning Techniques',
    'Machine Learning Lab', 'Software Design and Development', 'Neural Networks and Fuzzy Logic',
    'Cryptography and Network Security', 'Foundations of Blockchain Technology',
    'Logical and Critical Thinking', 'Universal Human Values and Ethics',
    'Quantum Computing and AI', 'Internship',
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) { showToast('Please select a student', 'error'); return; }
    setSaving(true);
    try {
      await api.saveMarks(form);
      showToast('Marks saved successfully! ✅', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save marks', 'error');
    } finally {
      setSaving(false);
    }
  };

  const markFields = [
    { key: 'assignment_marks', label: 'Assignment Marks', max: 20 },
    { key: 'quiz_marks',       label: 'Quiz Marks',       max: 10 },
    { key: 'internal_marks',   label: 'Internal Marks',   max: 30 },
    { key: 'lab_marks',        label: 'Lab Marks',        max: 25 },
    { key: 'mid_marks',        label: 'Mid Exam Marks',   max: 50 },
    { key: 'semester_marks',   label: 'Semester Marks',   max: 100 },
    { key: 'project_marks',    label: 'Project Marks',    max: 50 },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Enter / Update Marks</h1>
        <p className="page-subtitle">Assignment, Quiz, Internal, Lab, Mid, Semester, Project marks</p>
      </div>

      <div className="card p-6 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Student selector */}
          <div>
            <label className="form-label">Select Student</label>
            <select
              value={form.student_id}
              onChange={(e) => setForm((f) => ({ ...f, student_id: Number(e.target.value) }))}
              className="form-select"
            >
              <option value={0} disabled>-- Choose Student --</option>
              {roster.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} {s.roll_number ? `(${s.roll_number})` : `(${s.email})`}
                </option>
              ))}
            </select>
          </div>

          {/* Subject selector */}
          <div>
            <label className="form-label">Subject</label>
            <select
              value={form.subject_name}
              onChange={(e) => setForm((f) => ({ ...f, subject_name: e.target.value }))}
              className="form-select"
            >
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Mark fields grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {markFields.map(({ key, label, max }) => (
              <div key={key}>
                <label className="form-label text-xs">
                  {label} <span className="text-slate-400 font-normal">/ {max}</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={max}
                  step={0.5}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                  className="form-input"
                />
              </div>
            ))}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            ) : (
              <><Award className="w-4 h-4" /> Save Marks</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// REPORTS VIEW
// ---------------------------------------------------------------
const ReportsView: React.FC = () => {
  const { showToast } = useAuth();

  const download = async (fmt: 'pdf' | 'csv') => {
    try {
      showToast(`Generating ${fmt.toUpperCase()} report...`, 'info');
      await api.downloadFacultyReport(fmt);
      showToast('Report downloaded!', 'success');
    } catch { showToast('Download failed', 'error'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Reports & Export</h1>
        <p className="page-subtitle">Download attendance and academic reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <button onClick={() => download('pdf')} className="card p-6 text-center card-hover">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Download className="w-6 h-6 text-red-600" />
          </div>
          <p className="font-bold text-slate-900 mb-1">PDF Report</p>
          <p className="text-xs text-slate-500">Full attendance report as PDF document</p>
        </button>
        <button onClick={() => download('csv')} className="card p-6 text-center card-hover">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Download className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="font-bold text-slate-900 mb-1">CSV Export</p>
          <p className="text-xs text-slate-500">Spreadsheet-compatible CSV data</p>
        </button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------
// FACULTY PROFILE VIEW
// ---------------------------------------------------------------
const FacultyProfileView: React.FC<{ faculty: any }> = ({ faculty }) => (
  <div className="max-w-lg space-y-6 animate-fade-in">
    <div className="page-header">
      <h1 className="page-title">My Profile</h1>
    </div>
    <div className="card p-6 text-center">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-3xl mb-4">
        {faculty.full_name?.charAt(0)?.toUpperCase()}
      </div>
      <h2 className="text-xl font-bold text-slate-900">{faculty.full_name}</h2>
      <p className="text-slate-500 text-sm">{faculty.email}</p>
      <div className="mt-3 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
        Faculty — Presidency University
      </div>
    </div>
    <div className="card p-6">
      {[
        { icon: Mail,  label: 'Email',  value: faculty.email },
        { icon: Phone, label: 'Phone',  value: faculty.phone_number || 'Not provided' },
      ].map(({ icon: Icon, label, value }, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
          <Icon className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-sm font-semibold text-slate-800">{value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------
// MAIN FACULTY DASHBOARD
// ---------------------------------------------------------------
export const FacultyDashboard: React.FC = () => {
  const { facultyView, showToast } = useAuth();
  const [data, setData] = useState<FacData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const d = await api.getFacultyDashboard();
      setData(d);
    } catch (err: any) {
      showToast(err.message || 'Failed to load faculty dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (periodId: number, currentState: boolean) => {
    try {
      await api.toggleSession(periodId, !currentState);
      showToast(
        !currentState ? '✅ Attendance permission GIVEN! Students can now mark attendance.' : 'Attendance permission revoked.',
        !currentState ? 'success' : 'info'
      );
      loadData(); // refresh
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle permission', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="skeleton h-32 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  const renderView = () => {
    switch (facultyView) {
      case 'dashboard':  return <FacultyHomeView data={data} onRefresh={loadData} onToggleSession={handleToggle} />;
      case 'attendance': return <AttendanceManageView data={data} onToggleSession={handleToggle} />;
      case 'roster':     return <RosterView />;
      case 'marks':      return <MarksEntryView roster={[]} />;
      case 'timetable':  return (
        <div className="card p-8 text-center text-slate-400 animate-fade-in">
          <Calendar className="w-8 h-8 mx-auto mb-2" />
          <p>Timetable view coming soon.</p>
        </div>
      );
      case 'reports':    return <ReportsView />;
      case 'profile':    return <FacultyProfileView faculty={data.faculty} />;
      case 'settings':   return (
        <div className="card p-8 text-center text-slate-400 animate-fade-in">
          <p>Settings coming soon.</p>
        </div>
      );
      default: return null;
    }
  };

  return <div className="animate-fade-in">{renderView()}</div>;
};
