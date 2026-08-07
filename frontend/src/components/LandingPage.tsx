// =============================================================
// LandingPage.tsx — Presidency University ERP Portal
// Public marketing page with hero, features, about, contact
// =============================================================

import React from 'react';
import {
  GraduationCap,
  Camera,
  Shield,
  BarChart3,
  Clock,
  Users,
  BookOpen,
  Award,
  CheckCircle,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Building2,
  Zap,
  Lock,
  Globe,
} from 'lucide-react';

interface Props {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

// ---------------------------------------------------------------
// FEATURE CARD
// ---------------------------------------------------------------
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}> = ({ icon, title, desc, color }) => (
  <div className="card p-6 card-hover group animate-fade-in">
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

// ---------------------------------------------------------------
// STAT PILL
// ---------------------------------------------------------------
const StatPill: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl font-extrabold text-white">{value}</div>
    <div className="text-blue-200 text-sm mt-0.5">{label}</div>
  </div>
);

// ---------------------------------------------------------------
// LANDING PAGE
// ---------------------------------------------------------------
export const LandingPage: React.FC<Props> = ({ onOpenLogin, onOpenRegister }) => {
  const features = [
    {
      icon: <Camera className="w-6 h-6 text-blue-600" />,
      title: 'AI Face Recognition',
      desc: 'Faculty uploads one classroom photo and the AI system automatically identifies and marks attendance for every student.',
      color: 'bg-blue-100',
    },
    {
      icon: <Shield className="w-6 h-6 text-emerald-600" />,
      title: 'Anti-Proxy Protection',
      desc: 'Live blink detection and face embedding verification prevents proxy attendance. Attendance is locked and immutable.',
      color: 'bg-emerald-100',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
      title: 'Real-Time Dashboard',
      desc: 'Students and faculty see live attendance data, marks, timetables, and academic statistics updated instantly.',
      color: 'bg-purple-100',
    },
    {
      icon: <Clock className="w-6 h-6 text-amber-600" />,
      title: 'Time-Window Attendance',
      desc: 'Faculty sets attendance windows. Attendance can only be marked during the defined class period—no late entries.',
      color: 'bg-amber-100',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-rose-600" />,
      title: 'Academic Records',
      desc: 'Complete timetable, subject-wise marks (assignment, quiz, internal, lab, mid, semester, project) in one place.',
      color: 'bg-rose-100',
    },
    {
      icon: <Lock className="w-6 h-6 text-slate-600" />,
      title: 'Secure & Encrypted',
      desc: 'Face embeddings are AES-encrypted before database storage. JWT authentication protects every API endpoint.',
      color: 'bg-slate-100',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ====================================================
          HERO SECTION
          ==================================================== */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
          {/* University badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <GraduationCap className="w-4 h-4 text-blue-200" />
            <span className="text-blue-100 text-sm font-medium">Presidency University, Bangalore</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
            ERP Portal &<br />
            <span className="text-yellow-300">Attendance System</span>
          </h1>

          <p className="text-blue-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered face recognition attendance for students and faculty.
            Accurate, automated, and fraud-proof — built for the modern university.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl text-base"
            >
              <GraduationCap className="w-5 h-5" />
              Register Now
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 border border-white/30 text-white font-bold rounded-xl hover:bg-white/25 transition-all text-base"
            >
              Sign In to Portal
            </button>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 border-t border-white/20 pt-12">
            <StatPill value="95%+" label="Recognition Accuracy" />
            <StatPill value="12" label="Subjects Tracked" />
            <StatPill value="Real-Time" label="Attendance Updates" />
            <StatPill value="100%" label="Fraud Prevention" />
          </div>
        </div>
      </section>

      {/* ====================================================
          HOW IT WORKS
          ==================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
              How It Works
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Simple. Smart. Secure.</h2>
            <p className="text-slate-500 mt-2 max-w-xl mx-auto">
              Three steps from classroom to confirmed attendance record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: <Users className="w-7 h-7 text-blue-600" />,
                title: 'Faculty Opens Session',
                desc: 'Faculty logs in, selects the class period, and clicks "Open Attendance". Students are notified that the session is live.',
              },
              {
                step: '02',
                icon: <Camera className="w-7 h-7 text-emerald-600" />,
                title: 'Face Recognition',
                desc: 'Student clicks "Mark Attendance" → webcam opens → AI detects face → compares with enrolled embedding → attendance marked.',
              },
              {
                step: '03',
                icon: <CheckCircle className="w-7 h-7 text-purple-600" />,
                title: 'Permanently Recorded',
                desc: 'Attendance is locked immediately. Students cannot edit, delete, or re-mark. Faculty closes the session when done.',
              },
            ].map((item) => (
              <div key={item.step} className="relative card p-8 text-center">
                <div className="absolute -top-4 left-8 w-8 h-8 bg-blue-700 text-white rounded-lg flex items-center justify-center font-black text-sm">
                  {item.step}
                </div>
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          FEATURES SECTION
          ==================================================== */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
              Features
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Everything a Modern University Needs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} style={{ animationDelay: `${i * 0.07}s` }}>
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          ABOUT SECTION
          ==================================================== */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                About the Portal
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
                Built for Presidency University's Academic Excellence
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                The Presidency University ERP Portal is a comprehensive enterprise resource planning
                system specifically designed for managing academic workflows. It combines artificial
                intelligence with secure authentication to eliminate manual attendance fraud and
                streamline academic record-keeping.
              </p>

              <ul className="space-y-3">
                {[
                  'AI-powered face recognition with 95%+ accuracy',
                  'Full academic calendar and timetable management',
                  'Granular marks entry: Assignment, Quiz, Internal, Lab, Mid, Semester, Project',
                  'Role-based access: Student, Faculty, Admin',
                  'Immutable attendance records — once marked, cannot be changed',
                  'Export reports in PDF and CSV formats',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div className="university-banner rounded-2xl p-8 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-9 h-9 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Presidency University</h3>
                    <p className="text-blue-200 text-sm">Bengaluru, Karnataka — Est. 2013</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { icon: Award, label: 'NAAC Accredited Institution' },
                    { icon: Globe, label: 'Serving 10,000+ Students' },
                    { icon: Zap, label: 'AI-Powered Smart Campus' },
                    { icon: Users, label: '500+ Faculty Members' },
                  ].map(({ icon: Icon, label }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-blue-100">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          CONTACT SECTION
          ==================================================== */}
      <section id="contact" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900">Contact & Support</h2>
            <p className="text-slate-500 mt-2">Reach out to the ERP support team</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                label: 'Address',
                value: 'Presidency University, 15/16, Rajanukunte, Yelahanka, Bengaluru — 560064',
                color: 'text-blue-600',
                bg: 'bg-blue-100',
              },
              {
                icon: Phone,
                label: 'Phone',
                value: '+91 80 2977 3333',
                color: 'text-emerald-600',
                bg: 'bg-emerald-100',
              },
              {
                icon: Mail,
                label: 'Email',
                value: 'erp-support@presidency.edu',
                color: 'text-purple-600',
                bg: 'bg-purple-100',
              },
            ].map(({ icon: Icon, label, value, color, bg }, i) => (
              <div key={i} className="card p-6 text-center">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{label}</h3>
                <p className="text-sm text-slate-500">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================
          FOOTER
          ==================================================== */}
      <footer className="university-banner py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-blue-200" />
            <span className="text-white font-bold">Presidency University ERP Portal</span>
          </div>
          <p className="text-blue-300 text-xs">
            © {new Date().getFullYear()} Presidency University, Bangalore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
