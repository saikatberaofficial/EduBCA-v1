import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Coffee, Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Undo2, Plus, CalendarDays } from 'lucide-react';
import { DailyClass, AttendanceStatus, AttendanceLog, RoutineEntry } from '../types';
import AttendanceCard from './AttendanceCard';
import AbsentNoteModal from './AbsentNoteModal';
import AttendanceStats from './AttendanceStats';
import ExtraClassModal from './ExtraClassModal';
import ConfirmationModal from './ConfirmationModal';
import { storageService } from '../services/storageService';
import { cn } from '../utils/cn';

export default function DailyDashboard() {
  const [date, setDate] = useState(new Date());
  const [classes, setClasses] = useState<DailyClass[]>([]);
  const [profile, setProfile] = useState(storageService.getProfile());
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isExtraSelected, setIsExtraSelected] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'delete_extra' | 'reset_day' | 'day_off';
    id?: number;
    subject?: string;
  }>({
    isOpen: false,
    type: 'reset_day'
  });

  const dateStr = format(date, 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
    setProfile(storageService.getProfile());
  }, [dateStr]);

  const fetchData = () => {
    setIsLoading(true);
    setError(null);
    try {
      const routine = storageService.getRoutine();
      const attendance = storageService.getAttendanceByDate(dateStr);
      const dayOfWeek = date.getDay();
      const routineClasses = routine
        .filter(r => r.dayOfWeek === dayOfWeek)
        .map(r => ({
          ...r,
          attendance: attendance.find(a => a.routineId === r.id),
          stats: storageService.getAttendanceStatsForSubject(r.subject),
          isExtra: false
        }));

      const extraClasses = storageService.getExtraClassesByDate(dateStr)
        .map(c => ({
          ...c,
          dayOfWeek,
          attendance: attendance.find(a => a.extraClassId === c.id),
          stats: storageService.getAttendanceStatsForSubject(c.subject),
          isExtra: true
        }));

      // Sort by start time
      const allTodayClasses = [...routineClasses, ...extraClasses].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      );

      setClasses(allTodayClasses);
    } catch (err) {
      console.error('Storage error:', err);
      setError('Could not load your routine from local storage.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (classId: number, status: AttendanceStatus, isExtra: boolean, note?: string) => {
    if (status === 'absent' && !note) {
      setSelectedClassId(classId);
      setIsExtraSelected(isExtra);
      setIsNoteModalOpen(true);
      return;
    }

    storageService.updateAttendance(dateStr, classId, status, isExtra, note);
    fetchData();
  };

  const handleDayOff = () => {
    const routineIds = classes.filter(c => !c.isExtra).map(c => c.id);
    const extraClassIds = classes.filter(c => c.isExtra).map(c => c.id);
    storageService.setDayOff(dateStr, routineIds, extraClassIds);
    fetchData();
  };

  const handleResetDay = () => {
    const routineIds = classes.filter(c => !c.isExtra).map(c => c.id);
    const extraClassIds = classes.filter(c => c.isExtra).map(c => c.id);
    storageService.resetDay(dateStr, routineIds, extraClassIds);
    fetchData();
  };

  const handleDeleteExtra = () => {
    if (confirmModal.id) {
      storageService.deleteExtraClass(confirmModal.id);
      fetchData();
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + days);
    setDate(newDate);
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const isDayOff = classes.length > 0 && classes.every(c => c.attendance?.status === 'day_off');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            {profile.name ? `Hi, ${profile.name.split(' ')[0]}!` : 'Daily Dashboard'}
          </h1>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-zinc-500 mt-1">
            <CalendarDays size={16} className="text-primary" />
            <span className="font-bold text-sm tracking-tight">
              {format(date, 'EEEE, MMMM do')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center bg-white rounded-2xl p-1 card-shadow">
            <button onClick={() => changeDate(-1)} className="p-2.5 hover:bg-zinc-50 rounded-xl transition-colors text-zinc-400">
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setDate(new Date())}
              className="px-3 sm:px-4 py-2 text-[10px] font-black text-zinc-900 uppercase tracking-widest hover:bg-zinc-50 rounded-xl transition-colors"
            >
              Today
            </button>
            <button onClick={() => changeDate(1)} className="p-2.5 hover:bg-zinc-50 rounded-xl transition-colors text-zinc-400">
              <ChevronRight size={20} />
            </button>
          </div>
          <button
            onClick={() => setIsExtraModalOpen(true)}
            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-400 card-shadow hover:text-primary transition-colors shrink-0"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-3 text-rose-600">
          <AlertCircle size={20} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Upcoming Classes</h2>
          <div className="flex items-center gap-3">
            {classes.some(c => c.attendance) && (
              <button
                onClick={() => setConfirmModal({ isOpen: true, type: 'reset_day' })}
                className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                <RefreshCw size={12} />
                Reset Day
              </button>
            )}
            <button
              onClick={() => {
                if (isDayOff || classes.length === 0) return;
                setConfirmModal({ isOpen: true, type: 'day_off' });
              }}
              disabled={isDayOff || classes.length === 0}
              className={cn(
                "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-opacity",
                isDayOff || classes.length === 0 ? "text-zinc-300" : "text-primary hover:opacity-70"
              )}
            >
              <Coffee size={12} />
              {isDayOff ? 'Day Off Active' : 'Mark Day Off'}
            </button>
          </div>
        </div>

        {isLoading && !classes.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <RefreshCw size={40} className="animate-spin mb-4" />
            <p className="font-bold">Syncing Routine...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] card-shadow p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-200">
              <CalendarIcon size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-900">No classes today</h3>
              <p className="text-zinc-500 text-sm">Enjoy your academic break!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {classes.map((cls) => (
              <div key={cls.isExtra ? `extra-${cls.id}` : `routine-${cls.id}`}>
                <AttendanceCard
                  cls={cls}
                  onStatusChange={(status: AttendanceStatus) => handleStatusChange(cls.id, status, !!cls.isExtra)}
                  onDelete={cls.isExtra ? () => setConfirmModal({ 
                    isOpen: true, 
                    type: 'delete_extra', 
                    id: cls.id, 
                    subject: cls.subject 
                  }) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <AttendanceStats />

      <ExtraClassModal
        isOpen={isExtraModalOpen}
        onClose={() => setIsExtraModalOpen(false)}
        onAdd={fetchData}
        date={dateStr}
      />

      <AbsentNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        subject={selectedClass?.subject || ''}
        onSubmit={(note) => {
          if (selectedClassId) {
            handleStatusChange(selectedClassId, 'absent', isExtraSelected, note);
          }
          setIsNoteModalOpen(false);
        }}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (confirmModal.type === 'delete_extra') handleDeleteExtra();
          if (confirmModal.type === 'reset_day') handleResetDay();
          if (confirmModal.type === 'day_off') handleDayOff();
        }}
        title={
          confirmModal.type === 'delete_extra' ? 'Delete Extra Class' :
          confirmModal.type === 'reset_day' ? 'Reset Attendance' : 'Mark Day Off'
        }
        message={
          confirmModal.type === 'delete_extra' ? `Are you sure you want to delete the extra class "${confirmModal.subject}"?` :
          confirmModal.type === 'reset_day' ? 'Are you sure you want to reset all attendance marks for today?' :
          'This will mark all classes today as "Day Off". Are you sure?'
        }
        confirmText={
          confirmModal.type === 'delete_extra' ? 'Delete' :
          confirmModal.type === 'reset_day' ? 'Reset' : 'Confirm Day Off'
        }
        variant={confirmModal.type === 'delete_extra' ? 'danger' : 'warning'}
      />
    </div>
  );
}
