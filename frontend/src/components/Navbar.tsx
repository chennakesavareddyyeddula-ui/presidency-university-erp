// =============================================================
// Navbar.tsx — Public-facing top navigation bar
// Shown on Landing Page only (authenticated users see Sidebar)
// =============================================================

import React, { useState } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';

interface Props {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenLogin, onOpenRegister }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold text-slate-900 text-sm leading-tight">
              Presidency University
            </div>
            <div className="text-blue-700 text-xs font-semibold">ERP Portal | Attendance</div>
          </div>
          <div className="sm:hidden font-bold text-slate-900 text-sm">PU ERP Portal</div>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onOpenLogin}
            className="px-5 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={onOpenRegister}
            className="btn-primary px-5 py-2"
          >
            Registration
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              onClick={() => { onOpenLogin(); setMobileOpen(false); }}
              className="btn-secondary py-2.5 text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => { onOpenRegister(); setMobileOpen(false); }}
              className="btn-primary py-2.5 text-sm"
            >
              Registration
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
