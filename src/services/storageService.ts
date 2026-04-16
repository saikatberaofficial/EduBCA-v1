import { RoutineEntry, AttendanceLog, AttendanceStatus, UserProfile, AppConfig, ExtraClass } from '../types';

const ROUTINE_KEY = 'student_routine_data';
const ATTENDANCE_KEY = 'student_attendance_logs';
const PROFILE_KEY = 'student_profile';
const CONFIG_KEY = 'student_app_config';
const EXTRA_CLASS_KEY = 'student_extra_classes';

export const storageService = {
  // Profile Methods
  getProfile: (): UserProfile => {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : { name: '', major: '', college: '' };
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  // Config Methods
  getConfig: (): AppConfig => {
    const data = localStorage.getItem(CONFIG_KEY);
    return data ? JSON.parse(data) : { 
      subjects: [], 
      teachers: []
    };
  },

  saveConfig: (config: AppConfig) => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  },

  updateSubjectName: (oldName: string, newName: string) => {
    const config = storageService.getConfig();
    const routine = storageService.getRoutine();
    const extraClasses = storageService.getExtraClasses();

    // Update config
    const updatedSubjects = config.subjects.map(s => s === oldName ? newName : s);
    storageService.saveConfig({ ...config, subjects: updatedSubjects });

    // Update routine
    const updatedRoutine = routine.map(r => r.subject === oldName ? { ...r, subject: newName } : r);
    storageService.saveRoutine(updatedRoutine);

    // Update extra classes
    const updatedExtraClasses = extraClasses.map(e => e.subject === oldName ? { ...e, subject: newName } : e);
    storageService.saveExtraClasses(updatedExtraClasses);
  },

  updateTeacherName: (oldName: string, newName: string) => {
    const config = storageService.getConfig();
    const routine = storageService.getRoutine();
    const extraClasses = storageService.getExtraClasses();

    // Update config
    const updatedTeachers = config.teachers.map(t => t === oldName ? newName : t);
    storageService.saveConfig({ ...config, teachers: updatedTeachers });

    // Update routine
    const updatedRoutine = routine.map(r => r.teacherName === oldName ? { ...r, teacherName: newName } : r);
    storageService.saveRoutine(updatedRoutine);

    // Update extra classes
    const updatedExtraClasses = extraClasses.map(e => e.teacherName === oldName ? { ...e, teacherName: newName } : e);
    storageService.saveExtraClasses(updatedExtraClasses);
  },

  // Routine Methods
  getRoutine: (): RoutineEntry[] => {
    const data = localStorage.getItem(ROUTINE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveRoutine: (routine: RoutineEntry[]) => {
    localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
  },

  addRoutineEntry: (entry: Omit<RoutineEntry, 'id'>): RoutineEntry => {
    const routine = storageService.getRoutine();
    const newEntry = { ...entry, id: Date.now() };
    storageService.saveRoutine([...routine, newEntry]);
    return newEntry;
  },

  deleteRoutineEntry: (id: number) => {
    const routine = storageService.getRoutine();
    storageService.saveRoutine(routine.filter(r => r.id !== id));
    
    // Also cleanup attendance for this routine ID
    const logs = storageService.getAllAttendance();
    storageService.saveAllAttendance(logs.filter(l => l.routineId !== id));
  },

  // Extra Class Methods
  getExtraClasses: (): ExtraClass[] => {
    const data = localStorage.getItem(EXTRA_CLASS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveExtraClasses: (classes: ExtraClass[]) => {
    localStorage.setItem(EXTRA_CLASS_KEY, JSON.stringify(classes));
  },

  addExtraClass: (entry: Omit<ExtraClass, 'id'>): ExtraClass => {
    const classes = storageService.getExtraClasses();
    const newEntry = { ...entry, id: Date.now() };
    storageService.saveExtraClasses([...classes, newEntry]);
    return newEntry;
  },

  deleteExtraClass: (id: number) => {
    const classes = storageService.getExtraClasses();
    storageService.saveExtraClasses(classes.filter(c => c.id !== id));
    
    // Also cleanup attendance for this extra class ID
    const logs = storageService.getAllAttendance();
    storageService.saveAllAttendance(logs.filter(l => l.extraClassId !== id));
  },

  getExtraClassesByDate: (date: string): ExtraClass[] => {
    const classes = storageService.getExtraClasses();
    return classes.filter(c => c.date === date);
  },

  // Attendance Methods
  getAllAttendance: (): AttendanceLog[] => {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAllAttendance: (logs: AttendanceLog[]) => {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(logs));
  },

  getAttendanceByDate: (date: string): AttendanceLog[] => {
    const logs = storageService.getAllAttendance();
    return logs.filter(l => l.date === date);
  },

  updateAttendance: (date: string, classId: number, status: AttendanceStatus, isExtra: boolean = false, note?: string) => {
    const logs = storageService.getAllAttendance();
    const index = logs.findIndex(l => 
      l.date === date && 
      (isExtra ? l.extraClassId === classId : l.routineId === classId)
    );
    
    const newLog: AttendanceLog = { 
      id: Date.now(), 
      date, 
      status, 
      note,
      ...(isExtra ? { extraClassId: classId } : { routineId: classId })
    };
    
    if (index > -1) {
      logs[index] = newLog;
    } else {
      logs.push(newLog);
    }
    
    storageService.saveAllAttendance(logs);
  },

  setDayOff: (date: string, routineIds: number[], extraClassIds: number[] = []) => {
    const logs = storageService.getAllAttendance();
    
    // Remove existing logs for these IDs on this date
    const filteredLogs = logs.filter(l => !(
      l.date === date && 
      (routineIds.includes(l.routineId || -1) || extraClassIds.includes(l.extraClassId || -1))
    ));
    
    // Add new Day Off logs
    const newRoutineLogs: AttendanceLog[] = routineIds.map(id => ({
      id: Date.now() + id,
      date,
      routineId: id,
      status: 'day_off'
    }));

    const newExtraLogs: AttendanceLog[] = extraClassIds.map(id => ({
      id: Date.now() + id + 1, // Ensure unique ID
      date,
      extraClassId: id,
      status: 'day_off'
    }));
    
    storageService.saveAllAttendance([...filteredLogs, ...newRoutineLogs, ...newExtraLogs]);
  },

  resetDay: (date: string, routineIds: number[], extraClassIds: number[] = []) => {
    const logs = storageService.getAllAttendance();
    const filteredLogs = logs.filter(l => !(
      l.date === date && 
      (routineIds.includes(l.routineId || -1) || extraClassIds.includes(l.extraClassId || -1))
    ));
    storageService.saveAllAttendance(filteredLogs);
  },

  getAttendanceStatsForSubject: (subjectName: string) => {
    const routine = storageService.getRoutine();
    const extraClasses = storageService.getExtraClasses();
    const logs = storageService.getAllAttendance();
    
    const relevantLogs = logs.filter(l => {
      if (l.status !== 'present' && l.status !== 'absent') return false;
      
      if (l.routineId) {
        const entry = routine.find(r => r.id === l.routineId);
        return entry?.subject === subjectName;
      } else if (l.extraClassId) {
        const entry = extraClasses.find(e => e.id === l.extraClassId);
        return entry?.subject === subjectName;
      }
      return false;
    });

    const presentCount = relevantLogs.filter(l => l.status === 'present').length;
    const total = relevantLogs.length;
    
    return {
      percentage: total > 0 ? Math.round((presentCount / total) * 100) : 0,
      present: presentCount,
      total
    };
  },

  getOverallAttendanceStats: () => {
    const logs = storageService.getAllAttendance();
    const relevantLogs = logs.filter(l => l.status === 'present' || l.status === 'absent');
    
    const presentCount = relevantLogs.filter(l => l.status === 'present').length;
    const total = relevantLogs.length;
    
    return {
      percentage: total > 0 ? Math.round((presentCount / total) * 100) : 0,
      present: presentCount,
      total
    };
  },

  getAttendanceForExport: () => {
    const logs = storageService.getAllAttendance();
    const routine = storageService.getRoutine();
    const extraClasses = storageService.getExtraClasses();

    return logs.map(log => {
      let subject = 'Unknown';
      let teacher = 'N/A';
      let type = 'Routine';

      if (log.routineId) {
        const entry = routine.find(r => r.id === log.routineId);
        if (entry) {
          subject = entry.subject;
          teacher = entry.teacherName || 'N/A';
        }
      } else if (log.extraClassId) {
        const entry = extraClasses.find(e => e.id === log.extraClassId);
        if (entry) {
          subject = entry.subject;
          teacher = entry.teacherName || 'N/A';
          type = 'Extra Class';
        }
      }

      return {
        Date: log.date,
        Subject: subject,
        Teacher: teacher,
        Type: type,
        Status: log.status.replace('_', ' ').toUpperCase(),
        Note: log.note || ''
      };
    }).sort((a, b) => b.Date.localeCompare(a.Date));
  },

  resetAllData: () => {
    localStorage.removeItem(ROUTINE_KEY);
    localStorage.removeItem(ATTENDANCE_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(CONFIG_KEY);
    localStorage.removeItem(EXTRA_CLASS_KEY);
    window.location.reload();
  }
};
