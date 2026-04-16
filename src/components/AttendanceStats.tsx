import React from 'react';
import { storageService } from '../services/storageService';
import { cn } from '../utils/cn';

export default function AttendanceStats() {
  const routine = storageService.getRoutine();
  const extraClasses = storageService.getExtraClasses();
  const allLogs = storageService.getAllAttendance();

  // Map logs to subjects
  const subjectStats: Record<string, { present: number; total: number }> = {};

  // Process routine logs
  allLogs.forEach(log => {
    if (log.status !== 'present' && log.status !== 'absent') return;

    let subjectName = '';
    if (log.routineId) {
      const entry = routine.find(r => r.id === log.routineId);
      if (entry) subjectName = entry.subject;
    } else if (log.extraClassId) {
      const entry = extraClasses.find(e => e.id === log.extraClassId);
      if (entry) subjectName = entry.subject;
    }

    if (subjectName) {
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { present: 0, total: 0 };
      }
      subjectStats[subjectName].total++;
      if (log.status === 'present') {
        subjectStats[subjectName].present++;
      }
    }
  });

  const relevantLogs = allLogs.filter(l => l.status === 'present' || l.status === 'absent');
  const presentCount = relevantLogs.filter(l => l.status === 'present').length;
  const totalRelevant = relevantLogs.length;
  
  const overallPercentage = totalRelevant > 0 ? Math.round((presentCount / totalRelevant) * 100) : 0;

  const sortedSubjects = Object.entries(subjectStats).sort((a, b) => a[0].localeCompare(b[0]));

  // Circular progress calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallPercentage / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[2.5rem] card-shadow flex flex-col items-center justify-center relative overflow-hidden">
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Background Circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-zinc-50"
            />
            {/* Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className={cn(
                "transition-all duration-1000 ease-out",
                overallPercentage >= 75 ? "text-emerald-500" :
                overallPercentage >= 50 ? "text-amber-500" : "text-rose-500"
              )}
            />
          </svg>
          
          <div className="relative z-10 text-center">
            <span className="text-5xl font-black text-zinc-900 tracking-tighter">{overallPercentage}%</span>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <h3 className="text-lg font-bold text-zinc-900">Attendance Overview</h3>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest mt-1">Academic Performance</p>
        </div>

        <div className="grid grid-cols-2 w-full gap-4 mt-8">
          <div className="bg-zinc-50 p-4 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Present</p>
            <p className="text-xl font-black text-zinc-900">{presentCount}</p>
          </div>
          <div className="bg-zinc-50 p-4 rounded-2xl text-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-xl font-black text-zinc-900">{totalRelevant}</p>
          </div>
        </div>
      </div>

      {sortedSubjects.length > 0 && (
        <div className="bg-white p-6 rounded-[2rem] card-shadow">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6">Subject Breakdown</h4>
          <div className="space-y-4">
            {sortedSubjects.map(([subject, stats]) => {
              const perc = Math.round((stats.present / stats.total) * 100);
              return (
                <div key={subject} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-700 truncate max-w-[150px]">{subject}</span>
                      <span className="text-[10px] font-bold text-zinc-400">{stats.present} / {stats.total} classes</span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-black",
                      perc >= 75 ? "text-emerald-600" :
                      perc >= 50 ? "text-amber-600" : "text-rose-600"
                    )}>
                      {perc}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-50 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500 rounded-full",
                        perc >= 75 ? "bg-emerald-500" :
                        perc >= 50 ? "bg-amber-500" : "bg-rose-500"
                      )}
                      style={{ width: `${perc}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
