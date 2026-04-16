import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CalendarRange, UserCircle, GraduationCap } from 'lucide-react';
import DailyDashboard from './components/DailyDashboard';
import RoutineBuilder from './components/RoutineBuilder';
import Profile from './components/Profile';
import WelcomeModal from './components/WelcomeModal';
import { storageService } from './services/storageService';
import { cn } from './utils/cn';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routine' | 'profile'>('dashboard');
  const [profile, setProfile] = useState(storageService.getProfile());

  useEffect(() => {
    // Sync when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setProfile(storageService.getProfile());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'routine', label: 'Routine', icon: CalendarRange },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ] as const;

  return (
    <div className="min-h-screen bg-bg-main pb-32">
      <WelcomeModal />
      
      {/* Header */}
      <header className="sticky top-0 z-40 nav-blur border-b border-zinc-100/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-zinc-100 p-1">
              <img 
                src={`${import.meta.env.BASE_URL}logo.png`} 
                alt="EduBCA Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-zinc-900 tracking-tight leading-none">EduBCA</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Intelligent Attendance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden xs:flex items-center gap-1 bg-zinc-100/50 p-1 rounded-xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 py-1">Live Sync</span>
            </div>
            <button 
              onClick={() => setActiveTab('profile')}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md hover:scale-105 transition-transform"
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'EduBCA'}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {activeTab === 'dashboard' && <DailyDashboard />}
        {activeTab === 'routine' && <RoutineBuilder />}
        {activeTab === 'profile' && <Profile />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] max-w-md">
        <div className="bg-zinc-900 rounded-[2.5rem] p-1.5 sm:p-2 flex items-center justify-between shadow-2xl shadow-zinc-900/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-[2rem] transition-all duration-300",
                  isActive ? "bg-white text-zinc-900 flex-[1.5]" : "text-zinc-500 hover:text-zinc-300 flex-1"
                )}
              >
                <Icon size={20} className={cn(isActive ? "text-primary" : "")} />
                {isActive && (
                  <span className="text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
