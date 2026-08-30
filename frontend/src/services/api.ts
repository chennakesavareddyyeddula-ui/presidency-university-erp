// =============================================================
// api.ts — Presidency University ERP Portal
// Central API service layer. All HTTP calls to FastAPI backend.
// =============================================================

const API_BASE = '/api';

// ---------------------------------------------------------------
// TYPE DEFINITIONS
// ---------------------------------------------------------------

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  phone_number?: string;
  roll_number?: string;
  department?: string;
  year?: number;
  section?: string;
  profile_pic?: string;
  is_approved?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty';
  phone_number: string;
  roll_number?: string;
  department?: string;
  year?: number;
  section?: string;
  profile_pic?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ClassPeriod {
  id: number;
  subject_code: string;
  subject_name: string;
  faculty_name?: string;
  section: string;
  room: string;
  day_of_week?: string;
  start_time: string;
  end_time: string;
  batch?: string;
  is_open?: boolean;
  marked?: boolean;
  status_text?: string;
  checked_in_count?: number;
}

export interface AttendanceSummary {
  attendance_percentage: number;
  days_present: number;
  days_absent: number;
  total_classes: number;
}

export interface SubjectWiseAttendance {
  subject_code: string;
  subject_name: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface CalendarEntry {
  date: string;
  status: 'present' | 'absent' | 'no_class' | 'holiday';
  subjects?: string[];
}

export interface Mark {
  id: number;
  subject_name: string;
  assignment_marks: number;
  quiz_marks: number;
  internal_marks: number;
  lab_marks: number;
  mid_marks: number;
  semester_marks: number;
  project_marks: number;
}

export interface StudentDashboard {
  student: User;
  today_periods: ClassPeriod[];
  summary: AttendanceSummary;
  recent_marks: Mark[];
  announcements: string[];
}

export interface FacultyDashboard {
  faculty: User;
  today_classes: ClassPeriod[];
  total_students: number;
  today_attendance_count: number;
}

export interface LiveRosterItem {
  attendance_id: number;
  student_id: number;
  student_name: string;
  roll_number: string;
  timestamp: string;
  status: string;
  verify_score: string;
}

export interface RosterStudent {
  id: number;
  full_name: string;
  email: string;
  roll_number?: string;
  phone_number?: string;
  total_attended: number;
}

export interface VerificationResponse {
  verified: boolean;
  similarity: number;
  reason?: string;
  attendance_id?: number;
  subject_name?: string;
  date?: string;
  status?: string;
}

// ---------------------------------------------------------------
// API SERVICE CLASS
// ---------------------------------------------------------------

class ApiService {
  /** Get JWT token from localStorage */
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /** Build auth headers */
  private authHeaders(): HeadersInit {
    const token = this.getToken();
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  /** Generic request wrapper with error handling */
  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...this.authHeaders(),
        ...options.headers,
      },
    });

    let data: any;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const message =
        typeof data === 'object'
          ? data?.detail || data?.message || data?.reason || JSON.stringify(data)
          : data || `HTTP ${res.status}`;
      throw new Error(message);
    }

    return data as T;
  }

  // ==============================================================
  // AUTH ENDPOINTS
  // ==============================================================

  /** Register new student or faculty */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /** Login with email + password */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /** Get current authenticated user profile */
  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // ==============================================================
  // STUDENT ENDPOINTS
  // ==============================================================

  /** Fetch full student dashboard data */
  async getStudentDashboard(): Promise<StudentDashboard> {
    return this.request<StudentDashboard>('/student/dashboard');
  }

  /** Get attendance calendar entries (last N days) */
  async getAttendanceCalendar(): Promise<CalendarEntry[]> {
    return this.request<CalendarEntry[]>('/student/attendance/calendar');
  }

  /** Get per-subject attendance breakdown */
  async getSubjectWiseAttendance(): Promise<SubjectWiseAttendance[]> {
    return this.request<SubjectWiseAttendance[]>('/student/attendance/subject-wise');
  }

  /** Get weekly timetable for the student */
  async getStudentTimetable(): Promise<ClassPeriod[]> {
    return this.request<ClassPeriod[]>('/student/timetable');
  }

  /** Get all marks for the student */
  async getStudentMarks(): Promise<Mark[]> {
    return this.request<Mark[]>('/student/marks');
  }

  /** Mark attendance via biometric face verification pipeline */
  async markAttendance(
    periodId: number,
    capturedImageBase64: string,
    blinkCount: number,
    headMovementCount: number = 1
  ): Promise<VerificationResponse> {
    return this.request<VerificationResponse>('/student/mark-attendance', {
      method: 'POST',
      body: JSON.stringify({
        period_id: periodId,
        captured_image_base64: capturedImageBase64,
        blink_count: blinkCount,
        head_movement_count: headMovementCount,
        device_info: navigator.userAgent,
      }),
    });
  }

  /** Download student attendance report */
  async downloadStudentReport(format: 'pdf' | 'csv'): Promise<void> {
    const res = await fetch(`${API_BASE}/student/report/download?format=${format}`, {
      headers: { Authorization: `Bearer ${this.getToken()}` } as HeadersInit,
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ==============================================================
  // FACULTY ENDPOINTS
  // ==============================================================

  /** Fetch full faculty dashboard */
  async getFacultyDashboard(): Promise<FacultyDashboard> {
    return this.request<FacultyDashboard>('/faculty/dashboard');
  }

  /** Open or close an attendance session for a period */
  async toggleSession(periodId: number, openState: boolean): Promise<any> {
    return this.request<any>('/faculty/session/toggle', {
      method: 'POST',
      body: JSON.stringify({ period_id: periodId, open_state: openState }),
    });
  }

  /** Get live attendance roster for a period */
  async getLiveRoster(periodId: number): Promise<{ live_roster: LiveRosterItem[]; checked_in_count: number }> {
    return this.request<any>(`/faculty/session/live-roster?period_id=${periodId}`);
  }

  /** Get all students for faculty roster */
  async getClassRoster(): Promise<RosterStudent[]> {
    return this.request<RosterStudent[]>('/faculty/roster');
  }

  /** Save/update student marks */
  async saveMarks(payload: {
    student_id: number;
    subject_name: string;
    assignment_marks?: number;
    quiz_marks?: number;
    internal_marks?: number;
    lab_marks?: number;
    mid_marks?: number;
    semester_marks?: number;
    project_marks?: number;
  }): Promise<any> {
    return this.request<any>('/faculty/marks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /** Process faculty classroom photo for AI face recognition */
  async processClassroomAttendance(periodId: number, classroomImageBase64: string): Promise<any> {
    return this.request<any>('/faculty/classroom-attendance', {
      method: 'POST',
      body: JSON.stringify({
        period_id: periodId,
        classroom_image_base64: classroomImageBase64,
      }),
    });
  }

  /** Download faculty attendance report */
  async downloadFacultyReport(format: 'pdf' | 'csv', periodId?: number): Promise<void> {
    let url = `${API_BASE}/faculty/report/download?format=${format}`;
    if (periodId) url += `&period_id=${periodId}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.getToken()}` } as HeadersInit,
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = `class_report.${format}`;
    a.click();
    URL.revokeObjectURL(objUrl);
  }

  // ==============================================================
  // ADMIN ENDPOINTS
  // ==============================================================

  /** Get all students (admin only) */
  async getAdminStudents(): Promise<User[]> {
    return this.request<User[]>('/admin/students');
  }

  /** Get all faculty (admin only) */
  async getAdminFaculty(): Promise<User[]> {
    return this.request<User[]>('/admin/faculty');
  }

  /** Get all attendance records (admin only) */
  async getAdminAttendance(): Promise<any[]> {
    return this.request<any[]>('/admin/attendance');
  }

  /** Approve a student registration */
  async approveStudent(userId: number): Promise<any> {
    return this.request<any>(`/admin/approve/${userId}`, { method: 'POST' });
  }
}

// Singleton instance
export const api = new ApiService();
