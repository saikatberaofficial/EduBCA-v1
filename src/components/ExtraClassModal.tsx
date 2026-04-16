import React, { useState } from 'react';
import { X, Plus, Clock, BookOpen, User, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { AppConfig } from '../types';
import { isDaytime } from '../utils/formatTime';
import TimePicker from './TimePicker';
import CustomDropdown from './CustomDropdown';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  date: string;
}

export default function ExtraClassModal({ isOpen, onClose, onAdd, date }: Props) {
  const config = storageService.getConfig();
  const [subject, setSubject] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [timeError, setTimeError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !startTime || !endTime) return;

    if (!isDaytime(startTime) || !isDaytime(endTime)) {
      setTimeError('Classes must be scheduled during daytime (6 AM - 9 PM).');
      return;
    }

    setTimeError(null);
    storageService.addExtraClass({
      date,
      subject,
      teacherName,
      startTime,
      endTime
    });

    setSubject('');
    setTeacherName('');
    onAdd();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-zinc-100">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <h2 className="text-lg font-semibold text-zinc-900">Add Extra Class</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Subject</label>
            <div className="relative">
              {config.subjects.length > 0 ? (
                <CustomDropdown
                  options={config.subjects}
                  value={subject}
                  onChange={setSubject}
                  placeholder="Select Subject"
                  icon={BookOpen}
                  itemIcon={BookOpen}
                />
              ) : (
                <input
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Type subject name"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-200 text-zinc-900 placeholder-zinc-400"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 ml-1">Teacher (Optional)</label>
            <div className="relative">
              {config.teachers.length > 0 ? (
                <CustomDropdown
                  options={config.teachers}
                  value={teacherName}
                  onChange={setTeacherName}
                  placeholder="Select Teacher"
                  icon={User}
                  itemIcon={User}
                />
              ) : (
                <>
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 z-10" />
                  <input
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Type teacher name"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-200 text-zinc-900 placeholder-zinc-400"
                  />
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={setStartTime}
            />
            <TimePicker
              label="End Time"
              value={endTime}
              onChange={setEndTime}
            />
          </div>

          {timeError && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-sm font-medium">
              <AlertCircle size={16} />
              {timeError}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            <Plus size={20} />
            Add Extra Class
          </button>
        </form>
      </div>
    </div>
  );
}
