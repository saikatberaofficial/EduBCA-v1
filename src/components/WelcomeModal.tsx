import React, { useState, useEffect } from 'react';
import { ShieldCheck, CalendarRange, ArrowRight, BookOpen } from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('has_visited_v1');
    if (!hasVisited) {
      setIsOpen(true);
    }
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('has_visited_v1', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-zinc-100">
        <div className="p-8 md:p-12 text-center">
          <div className="w-32 h-32 bg-white rounded-[2rem] flex items-center justify-center overflow-hidden mx-auto mb-8 shadow-2xl border border-zinc-100 p-2">
            <img 
              src="/logo.png" 
              alt="EduBCA Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          
          <h2 className="text-3xl font-black text-zinc-900 mb-4 tracking-tight">
            Welcome to EduBCA
          </h2>
          
          <p className="text-zinc-500 font-medium mb-10 leading-relaxed">
            Intelligent Attendance & Academics Management.
          </p>

          <div className="flex justify-center mb-10">
            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col items-center gap-3 w-full max-w-[200px]">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-zinc-900 shadow-sm">
                <BookOpen size={24} />
              </div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Academic Tool</span>
            </div>
          </div>

          <button
            onClick={handleGetStarted}
            className="w-full group flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-hover transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
          >
            <ShieldCheck size={24} />
            Get Started
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-6 text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
            Secure & Private • Local Storage Only
          </p>
        </div>
      </div>
    </div>
  );
}
