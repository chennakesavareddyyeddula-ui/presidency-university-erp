// =============================================================
// TopBar.tsx — ERP Portal top navigation bar (authenticated)
// Shows profile picture, name, notifications, date/time
// =============================================================

import React, { useState, useEffect } from 'react';
import { Bell, LogOut, ChevronDown, GraduationCap, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onMenuClick?: () => void;
}

export const TopBar: React.FC<Props> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const dateStr = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const roleLabel = user?.role === 'student'
    ? `${user.roll_number || 'Student'} | ${user.department || 'CSE'}`
    : `${user?.role === 'admin' ? 'Administrator' : 'Faculty'} | Presidency University`;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-sm">
      {/* Left: Mobile menu toggle + Page context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        {/* Date + time */}
        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-slate-800">{timeStr}</div>
          <div className="text-[11px] text-slate-400">{dateStr}</div>
        </div>
      </div>

      {/* Center: University name (mobile) */}
      <div className="flex lg:hidden items-center gap-2">
        <GraduationCap className="w-4 h-4 text-blue-700" />
        <span className="font-bold text-slate-800 text-sm">PU ERP Portal</span>
      </div>

      {/* Right: Notifications + User profile */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-xl bg-blue-700 flex items-center justify-center font-bold text-white text-sm overflow-hidden">
              {user?.profile_pic ? (
                <img src={user.profile_pic} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-bold text-slate-800 leading-tight">{user?.full_name}</div>
              <div className="text-[11px] text-slate-400 leading-tight truncate max-w-[140px]">{roleLabel}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-40 animate-slide-up overflow-hidden">
                {/* Profile summary */}
                <div className="px-4 py-3 bg-blue-50 border-b border-slate-100">
                  <div className="font-bold text-slate-900 text-sm">{user?.full_name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{user?.email}</div>
                  {user?.roll_number && (
                    <div className="text-xs text-blue-700 font-semibold mt-1">
                      Roll No: {user.roll_number}
                    </div>
                  )}
                  <div className="mt-1.5 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold capitalize">
                    {user?.role}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button
                    onClick={() => { logout(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
