import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Clock, Calendar, RefreshCw, AlertCircle, User, BookOpen } from 'lucide-react';
import { RoutineEntry, AppConfig } from '../types';
import { storageService } from '../services/storageService';
import { formatTo12Hour, isDaytime } from '../utils/formatTime';
import TimePicker from './TimePicker';
import CustomDropdown from './CustomDropdown';
import ConfirmationModal from './ConfirmationModal';
import { cn } from '../utils/cn';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RoutineBuilder() {
  const [routine, setRoutine] = useState<RoutineEntry[]>([]);
  const [config, setConfig] = useState<AppConfig>({ subjects: [], teachers: [] });
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [newEntry, setNewEntry] = useState({
    dayOfWeek: selectedDay,
    subject: '',
    teacherName: '',
    startTime: '09:00',
    endTime: '10:00'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number;
    subject: string;
    day: string;
  }>({
    isOpen: false,
    id: -1,
    subject: '',
    day: ''
  });

  useEffect(() => {
    fetchRoutine();
    setConfig(storageService.getConfig());
  }, []);

  useEffect(() => {
    setNewEntry(prev => ({ ...prev, dayOfWeek: selectedDay }));
  }, [selectedDay]);

  const fetchRoutine = () => {
    const data = storageService.getRoutine();
    setRoutine(data);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.subject) return;

    if (!isDaytime(newEntry.startTime) || !isDaytime(newEntry.endTime)) {
      setTimeError('Classes must be scheduled during daytime (6 AM - 9 PM).');
      return;
    }

    setTimeError(null);
    setIsSaving(true);
    setTimeout(() => {
      storageService.addRoutineEntry(newEntry);
      setNewEntry({ ...newEntry, subject: '', teacherName: '' });
      fetchRoutine();
      setIsSaving(false);
    }, 300);
  };

  const confirmDelete = (id: number, subject: string, day: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      subject,
      day
    });
  };

  const handleDelete = () => {
    storageService.deleteRoutineEntry(deleteModal.id);
    fetchRoutine();
  };

  const dayClasses = routine.filter(r => r.dayOfWeek === selectedDay);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-zinc-900">Academic Schedule</h1>
        <p className="text-zinc-500">Design your recurring weekly routine.</p>
      </header>

      {/* Day Selector */}
      <div className="bg-white p-1.5 sm:p-2 rounded-3xl card-shadow">
        <div className="flex items-center justify-between gap-1">
          {DAYS.map((day, i) => (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={cn(
                "flex-1 py-3 sm:py-4 rounded-2xl font-black text-[9px] sm:text-xs uppercase tracking-tighter sm:tracking-widest transition-all",
                selectedDay === i 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-zinc-400 hover:bg-zinc-50"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Add Class Form */}
      <form onSubmit={handleAdd} className="bg-white p-8 rounded-[2.5rem] card-shadow space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary">
            <Plus size={20} />
          </div>
          <h3 className="font-bold text-zinc-900">Add New Class for {FULL_DAYS[selectedDay]}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Subject</label>
              {config.subjects.length > 0 ? (
                <CustomDropdown
                  options={config.subjects}
                  value={newEntry.subject}
                  onChange={(val) => setNewEntry({ ...newEntry, subject: val })}
                  placeholder="Select Subject"
                  icon={BookOpen}
                  itemIcon={BookOpen}
                />
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={newEntry.subject}
                  onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-zinc-900 font-medium"
                />
              )}
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Teacher</label>
              {config.teachers.length > 0 ? (
                <CustomDropdown
                  options={config.teachers}
                  value={newEntry.teacherName}
                  onChange={(val) => setNewEntry({ ...newEntry, teacherName: val })}
                  placeholder="Select Teacher"
                  icon={User}
                  itemIcon={User}
                />
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Dr. Smith"
                  value={newEntry.teacherName}
                  onChange={(e) => setNewEntry({ ...newEntry, teacherName: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-zinc-900 font-medium"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TimePicker
              label="Start Time"
              value={newEntry.startTime}
              onChange={(val) => setNewEntry({ ...newEntry, startTime: val })}
            />
            <TimePicker
              label="End Time"
              value={newEntry.endTime}
              onChange={(val) => setNewEntry({ ...newEntry, endTime: val })}
            />
          </div>
        </div>

        {timeError && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
            <AlertCircle size={20} />
            {timeError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Plus size={20} />}
          {isSaving ? 'Adding Class...' : 'Add to Schedule'}
        </button>
      </form>

      {/* Routine List */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{FULL_DAYS[selectedDay]} Schedule</h2>
        
        {dayClasses.length === 0 ? (
          <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2rem] p-12 text-center">
            <p className="text-zinc-400 font-bold">No classes scheduled for this day.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {dayClasses.map((entry) => (
              <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white rounded-[2rem] card-shadow group gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 shrink-0">
                    <Clock size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-zinc-900 text-lg truncate">
                      {entry.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Clock size={14} className="text-primary" />
                        {formatTo12Hour(entry.startTime)} - {formatTo12Hour(entry.endTime)}
                      </span>
                      {entry.teacherName && (
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <User size={14} className="text-primary" />
                          {entry.teacherName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => confirmDelete(entry.id, entry.subject, FULL_DAYS[selectedDay])}
                  className="p-3 text-zinc-300 hover:text-rose-500 transition-colors sm:opacity-0 group-hover:opacity-100 self-end sm:self-center"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        title="Delete Routine Entry"
        message={`Are you sure you want to delete ${deleteModal.subject} on ${deleteModal.day}? This will also remove all attendance history for this specific routine slot.`}
      />
    </div>
  );
}
