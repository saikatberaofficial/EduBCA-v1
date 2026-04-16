import React from 'react';
import { Check, X, Slash, Coffee, MessageSquare, Trash2, Clock, User } from 'lucide-react';
import { DailyClass, AttendanceStatus } from '../types';
import { cn } from '../utils/cn';
import { formatTo12Hour } from '../utils/formatTime';

interface Props {
  cls: DailyClass;
  onStatusChange: (status: AttendanceStatus) => void | Promise<void>;
  onDelete?: () => void;
}

export default function AttendanceCard({ cls, onStatusChange, onDelete }: Props) {
  const status = cls.attendance?.status || 'pending';

  const buttons = [
    { id: 'present', label: 'Present', icon: Check, activeClass: 'bg-emerald-500 text-white shadow-lg shadow-emerald-100', inactiveClass: 'bg-zinc-50 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-500' },
    { id: 'absent', label: 'Absent', icon: X, activeClass: 'bg-rose-500 text-white shadow-lg shadow-rose-100', inactiveClass: 'bg-zinc-50 text-zinc-400 hover:bg-rose-50 hover:text-rose-500' },
    { id: 'class_off', label: 'Off', icon: Slash, activeClass: 'bg-amber-500 text-white shadow-lg shadow-amber-100', inactiveClass: 'bg-zinc-50 text-zinc-400 hover:bg-amber-50 hover:text-amber-500' },
  ];

  return (
    <div className={cn(
      "p-6 bg-white rounded-[2rem] card-shadow transition-all duration-300 relative overflow-hidden group",
      status === 'day_off' ? "opacity-50 grayscale" : "hover:scale-[1.01]"
    )}>
      {/* Background Accent */}
      <div className={cn(
        "absolute top-0 left-0 w-1.5 h-full transition-colors duration-500",
        status === 'present' ? "bg-emerald-500" :
        status === 'absent' ? "bg-rose-500" :
        status === 'class_off' ? "bg-amber-500" :
        status === 'day_off' ? "bg-zinc-300" : "bg-zinc-100"
      )} />

      <div className="flex flex-col space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-900 text-xl tracking-tight">
                {cls.subject}
              </h3>
              {cls.isExtra && (
                <span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-white rounded-full font-black uppercase tracking-tighter">
                  Extra
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                {formatTo12Hour(cls.startTime)} - {formatTo12Hour(cls.endTime)}
              </div>
              {cls.teacherName && (
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-primary" />
                  {cls.teacherName}
                </div>
              )}
            </div>
          </div>

          {cls.stats && (
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm card-shadow",
              cls.stats.percentage >= 75 ? "bg-emerald-50 text-emerald-600" :
              cls.stats.percentage >= 50 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
            )}>
              {cls.stats.percentage}%
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {status === 'day_off' ? (
            <div className="flex-1 py-3 bg-zinc-100 text-zinc-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
              <Coffee size={18} />
              Day Off
            </div>
          ) : (
            <>
              {buttons.map((btn) => {
                const Icon = btn.icon;
                const isActive = status === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => onStatusChange(btn.id as AttendanceStatus)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95",
                      isActive ? btn.activeClass : btn.inactiveClass
                    )}
                  >
                    <Icon size={18} />
                    {btn.label}
                  </button>
                );
              })}
              {cls.isExtra && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="w-12 h-12 flex items-center justify-center text-zinc-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </>
          )}
        </div>

        {cls.attendance?.note && (
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-3 items-start">
            <MessageSquare size={16} className="text-zinc-400 mt-0.5 shrink-0" />
            <p className="text-sm text-zinc-600 font-medium italic">"{cls.attendance.note}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
