// =============================================================
// Sidebar.tsx — ERP Portal Sidebar Navigation
// University-style sidebar with all menu items
// =============================================================

import React, { useState } from 'react';
import {
  LayoutDashboard, User, Calendar, BookOpen, ClipboardCheck, FileText,
  MessageSquare, GraduationCap, Video, BarChart3, FolderOpen, CreditCard,
  Target, Star, Clock, Bus, Library, Briefcase, Building, Download,
  Settings, HelpCircle, ChevronLeft, ChevronRight, LogOut, Camera, Users,
  Award, Radio,
} from 'lucide-react';
import { useAuth, type StudentView, type FacultyView } from '../context/AuthContext';

// ---------------------------------------------------------------
// MENU STRUCTURE
// ---------------------------------------------------------------

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const STUDENT_MENU: MenuItem[] = [
  { id: 'dashboard',      label: 'Dashboard',               icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'profile',        label: 'My Profile',              icon: <User className="w-4 h-4" /> },
  { id: 'timetable',      label: 'Timetable',               icon: <Calendar className="w-4 h-4" /> },
  { id: 'attendance',     label: 'Attendance',              icon: <ClipboardCheck className="w-4 h-4" /> },
  { id: 'marks',          label: 'Assessments & Marks',     icon: <Award className="w-4 h-4" /> },
  { id: 'results',        label: 'Results',                 icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'fee',            label: 'My Fee',                  icon: <CreditCard className="w-4 h-4" /> },
  { id: 'library',        label: 'Library',                 icon: <Library className="w-4 h-4" /> },
  { id: 'placements',     label: 'Placements',              icon: <Briefcase className="w-4 h-4" /> },
  { id: 'internships',    label: 'Internships',             icon: <Building className="w-4 h-4" /> },
  { id: 'downloads',      label: 'Downloads',               icon: <Download className="w-4 h-4" /> },
  { id: 'settings',       label: 'Settings',                icon: <Settings className="w-4 h-4" /> },
  { id: 'support',        label: 'Support',                 icon: <HelpCircle className="w-4 h-4" /> },
];

const FACULTY_MENU: MenuItem[] = [
  { id: 'dashboard',   label: 'Dashboard',          icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'attendance',  label: 'Manage Attendance',  icon: <Radio className="w-4 h-4" /> },
  { id: 'roster',      label: 'Class Roster',       icon: <Users className="w-4 h-4" /> },
  { id: 'marks',       label: 'Enter Marks',        icon: <Award className="w-4 h-4" /> },
  { id: 'timetable',   label: 'My Timetable',       icon: <Calendar className="w-4 h-4" /> },
  { id: 'reports',     label: 'Reports & Export',   icon: <FileText className="w-4 h-4" /> },
  { id: 'profile',     label: 'My Profile',         icon: <User className="w-4 h-4" /> },
  { id: 'settings',    label: 'Settings',           icon: <Settings className="w-4 h-4" /> },
];

// ---------------------------------------------------------------
// SIDEBAR COMPONENT
// ---------------------------------------------------------------

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout, studentView, facultyView, setStudentView, setFacultyView } = useAuth();

  const isStudent = user?.role === 'student';
  const isFaculty = user?.role === 'faculty';

  const menu = isStudent ? STUDENT_MENU : FACULTY_MENU;
  const activeView = isStudent ? studentView : facultyView;
  const setView = isStudent
    ? (id: string) => setStudentView(id as StudentView)
    : (id: string) => setFacultyView(id as FacultyView);

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full z-30 flex flex-col sidebar-bg text-white
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* University Logo / Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-blue-600/40 min-h-[64px]">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-extrabold text-white text-sm leading-tight truncate">
              Presidency University
            </div>
            <div className="text-blue-300 text-[10px] font-semibold uppercase tracking-wider">
              ERP Portal
            </div>
          </div>
        )}
        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={`ml-auto text-blue-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all ${collapsed ? '' : ''}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User mini-profile */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-blue-600/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
              {user?.profile_pic ? (
                <img src={user.profile_pic} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-white font-semibold text-sm truncate">{user?.full_name}</div>
              <div className="text-blue-300 text-xs truncate capitalize">{user?.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {!collapsed && (
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider px-2 py-2">
            Navigation
          </p>
        )}

        {menu.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 text-left
                ${isActive
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-blue-600/40">
        <button
          onClick={logout}
          title={collapsed ? 'Logout' : undefined}
          className={`
            w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium
            text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
