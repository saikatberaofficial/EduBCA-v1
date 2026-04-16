export type AttendanceStatus = 'present' | 'absent' | 'class_off' | 'day_off' | 'pending';

export interface RoutineEntry {
  id: number;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  subject: string;
  teacherName?: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface UserProfile {
  name: string;
  studentId?: string;
  major: string;
  college: string;
  avatar?: string; // Base64 image
}

export interface AppConfig {
  subjects: string[];
  teachers: string[];
}

export interface AttendanceLog {
  id: number;
  date: string; // YYYY-MM-DD
  routineId?: number;
  extraClassId?: number;
  status: AttendanceStatus;
  note?: string;
}

export interface ExtraClass {
  id: number;
  date: string; // YYYY-MM-DD
  subject: string;
  teacherName?: string;
  startTime: string;
  endTime: string;
}

export interface DailyClass extends RoutineEntry {
  attendance?: AttendanceLog;
  isExtra?: boolean;
  stats?: {
    percentage: number;
    present: number;
    total: number;
  };
}
