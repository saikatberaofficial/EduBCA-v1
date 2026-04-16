import React, { useState, useEffect, useRef } from 'react';
import { User, BookOpen, Plus, Trash2, Save, Edit2, Check, X, Download, RefreshCw, AlertTriangle, Camera, GraduationCap, Building2, Fingerprint, Share2, MessageSquare } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toPng } from 'html-to-image';
import { storageService } from '../services/storageService';
import { UserProfile, AppConfig } from '../types';
import ConfirmationModal from './ConfirmationModal';
import FeedbackModal from './FeedbackModal';
import { cn } from '../utils/cn';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({ name: '', studentId: '', major: '', college: '' });
  const [config, setConfig] = useState<AppConfig>({ subjects: [], teachers: [] });
  const [newSubject, setNewSubject] = useState('');
  const [newTeacher, setNewTeacher] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [stats, setStats] = useState({ percentage: 0, present: 0, total: 0 });

  // Edit State
  const [editingSubjectIndex, setEditingSubjectIndex] = useState<number | null>(null);
  const [editingSubjectValue, setEditingSubjectValue] = useState('');
  const [editingTeacherIndex, setEditingTeacherIndex] = useState<number | null>(null);
  const [editingTeacherValue, setEditingTeacherValue] = useState('');

  // Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'subject' | 'teacher' | 'reset';
    index: number;
    name: string;
  }>({
    isOpen: false,
    type: 'subject',
    index: -1,
    name: ''
  });

  useEffect(() => {
    setProfile(storageService.getProfile());
    setConfig(storageService.getConfig());
    setStats(storageService.getOverallAttendanceStats());
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveProfile(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    const newConfig = { ...config, subjects: [...config.subjects, newSubject.trim()] };
    setConfig(newConfig);
    storageService.saveConfig(newConfig);
    setNewSubject('');
  };

  const startEditingSubject = (index: number, value: string) => {
    setEditingSubjectIndex(index);
    setEditingSubjectValue(value);
  };

  const saveEditedSubject = () => {
    if (editingSubjectIndex === null || !editingSubjectValue.trim()) return;
    
    const oldName = config.subjects[editingSubjectIndex];
    const newName = editingSubjectValue.trim();
    
    if (oldName !== newName) {
      storageService.updateSubjectName(oldName, newName);
      setConfig(storageService.getConfig());
    }
    
    setEditingSubjectIndex(null);
  };

  const startEditingTeacher = (index: number, value: string) => {
    setEditingTeacherIndex(index);
    setEditingTeacherValue(value);
  };

  const saveEditedTeacher = () => {
    if (editingTeacherIndex === null || !editingTeacherValue.trim()) return;
    
    const oldName = config.teachers[editingTeacherIndex];
    const newName = editingTeacherValue.trim();
    
    if (oldName !== newName) {
      storageService.updateTeacherName(oldName, newName);
      setConfig(storageService.getConfig());
    }
    
    setEditingTeacherIndex(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newProfile = { ...profile, avatar: base64String };
        setProfile(newProfile);
        storageService.saveProfile(newProfile);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDelete = (type: 'subject' | 'teacher' | 'reset', index: number, name: string) => {
    setDeleteModal({
      isOpen: true,
      type,
      index,
      name
    });
  };

  const handleDelete = () => {
    const { type, index } = deleteModal;
    if (type === 'subject') {
      const newConfig = { ...config, subjects: config.subjects.filter((_, i) => i !== index) };
      setConfig(newConfig);
      storageService.saveConfig(newConfig);
    } else if (type === 'teacher') {
      const newConfig = { ...config, teachers: config.teachers.filter((_, i) => i !== index) };
      setConfig(newConfig);
      storageService.saveConfig(newConfig);
    } else if (type === 'reset') {
      storageService.resetAllData();
    }
  };

  const addTeacher = () => {
    if (!newTeacher.trim()) return;
    const newConfig = { ...config, teachers: [...config.teachers, newTeacher.trim()] };
    setConfig(newConfig);
    storageService.saveConfig(newConfig);
    setNewTeacher('');
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const data = storageService.getAttendanceForExport();
      if (data.length === 0) {
        alert('No attendance data found to export.');
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

      const wscols = [
        { wch: 15 }, // Date
        { wch: 25 }, // Subject
        { wch: 20 }, // Teacher
        { wch: 15 }, // Type
        { wch: 15 }, // Status
        { wch: 30 }  // Note
      ];
      worksheet['!cols'] = wscols;

      XLSX.writeFile(workbook, `Attendance_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export attendance data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareCard = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        style: {
          borderRadius: '0px'
        }
      });
      const link = document.createElement('a');
      link.download = `EduBCA_Identity_${profile.name || 'Student'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Sharing failed:', error);
      alert('Failed to generate identity card.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Student Identity</h1>
          <p className="text-zinc-500">Manage your academic profile and preferences.</p>
        </div>
        <button
          onClick={handleShareCard}
          disabled={isSharing}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50"
        >
          {isSharing ? <RefreshCw size={18} className="animate-spin" /> : <Share2 size={18} />}
          Share Name Card
        </button>
      </header>

      {/* Hidden Card for Export */}
      <div className="fixed -left-[9999px] top-0">
        <div 
          ref={cardRef}
          className="w-[400px] bg-white p-10 space-y-8 border border-zinc-100"
        >
          <div className="flex flex-col items-center space-y-6">
            <div className="w-32 h-32 rounded-full bg-primary-light flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'EduBCA'}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{profile.name || 'Student Name'}</h2>
              <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-[0.2em]">{profile.major || 'Program of Study'}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-zinc-100">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Student ID</span>
              <span className="text-sm font-bold text-zinc-900">{profile.studentId || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Institution</span>
              <span className="text-sm font-bold text-zinc-900">{profile.college || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Attendance</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000",
                      stats.percentage >= 75 ? "bg-emerald-500" :
                      stats.percentage >= 50 ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <span className={cn(
                  "text-sm font-black",
                  stats.percentage >= 75 ? "text-emerald-600" :
                  stats.percentage >= 50 ? "text-amber-600" : "text-rose-600"
                )}>
                  {stats.percentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col items-center">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-2">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain invert" />
            </div>
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em]">EduBCA Intelligent Attendance</span>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[2.5rem] card-shadow p-8 flex flex-col items-center space-y-8">
        <div className="relative group">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-36 h-36 rounded-full bg-primary-light flex items-center justify-center overflow-hidden border-4 border-white shadow-xl transition-transform group-hover:scale-105 duration-500 cursor-pointer"
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'EduBCA'}`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 w-10 h-10 bg-primary rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          >
            <Camera size={18} />
          </button>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{profile.name || 'Student Name'}</h2>
          <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-[0.2em]">{profile.major || 'Program of Study'}</p>
        </div>

        <form onSubmit={handleSaveProfile} className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              <User size={12} className="text-primary" /> Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-zinc-900 font-medium"
              placeholder="e.g. Alex Thompson"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              <Fingerprint size={12} className="text-primary" /> Student ID
            </label>
            <input
              type="text"
              value={profile.studentId || ''}
              onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-zinc-900 font-medium"
              placeholder="e.g. BCA-2024-0892"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              <GraduationCap size={12} className="text-primary" /> Major / Stream
            </label>
            <input
              type="text"
              value={profile.major}
              onChange={(e) => setProfile({ ...profile, major: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-zinc-900 font-medium"
              placeholder="e.g. Computer Applications"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">
              <Building2 size={12} className="text-primary" /> Institution
            </label>
            <input
              type="text"
              value={profile.college}
              onChange={(e) => setProfile({ ...profile, college: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-zinc-900 font-medium"
              placeholder="e.g. EduBCA University"
            />
          </div>

          <button
            type="submit"
            className={cn(
              "md:col-span-2 py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95",
              isSaved ? "bg-emerald-500 shadow-emerald-100" : "bg-primary shadow-primary/20"
            )}
          >
            {isSaved ? 'Identity Saved!' : 'Update Identity'}
          </button>
        </form>
      </div>

      {/* Subjects & Faculty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] card-shadow p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary">
                <BookOpen size={20} />
              </div>
              <h3 className="font-bold text-zinc-900">Subjects</h3>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSubject()}
              placeholder="Add subject..."
              className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
            <button onClick={addSubject} className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/10">
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
            {config.subjects.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group">
                {editingSubjectIndex === i ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={editingSubjectValue}
                      onChange={(e) => setEditingSubjectValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEditedSubject()}
                      className="flex-1 px-3 py-1 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button onClick={saveEditedSubject} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-lg">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingSubjectIndex(null)} className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-zinc-900 text-sm">{s}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditingSubject(i, s)} className="p-2 text-zinc-300 hover:text-primary transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => confirmDelete('subject', i, s)} className="p-2 text-zinc-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] card-shadow p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <User size={20} />
              </div>
              <h3 className="font-bold text-zinc-900">Faculty</h3>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newTeacher}
              onChange={(e) => setNewTeacher(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTeacher()}
              placeholder="Add teacher..."
              className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
            />
            <button onClick={addTeacher} className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-100">
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
            {config.teachers.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group">
                {editingTeacherIndex === i ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={editingTeacherValue}
                      onChange={(e) => setEditingTeacherValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEditedTeacher()}
                      className="flex-1 px-3 py-1 bg-white border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button onClick={saveEditedTeacher} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-lg">
                      <Check size={16} />
                    </button>
                    <button onClick={() => setEditingTeacherIndex(null)} className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="font-bold text-zinc-900 text-sm">{t}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEditingTeacher(i, t)} className="p-2 text-zinc-300 hover:text-primary transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => confirmDelete('teacher', i, t)} className="p-2 text-zinc-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support & Feedback Section */}
      <div className="bg-white rounded-[2.5rem] card-shadow p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary">
            <MessageSquare size={20} />
          </div>
          <h3 className="font-bold text-zinc-900">Support & Feedback</h3>
        </div>
        
        <p className="text-zinc-500 text-sm leading-relaxed">
          Have a suggestion or found a bug? Send us your feedback directly. Your input helps us make EduBCA better for everyone.
        </p>

        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="w-full py-4 bg-zinc-50 border border-zinc-100 text-zinc-900 rounded-2xl font-bold text-sm hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
        >
          <MessageSquare size={18} className="text-primary" />
          Send Feedback / Complaint
        </button>
      </div>

      {/* Export Section */}
      <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white card-shadow relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-3">
            <h3 className="text-3xl font-black tracking-tight">Export Data</h3>
            <p className="text-zinc-400 font-medium leading-relaxed">
              Generate a professional Excel report of your attendance history, 
              performance metrics, and academic routine.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="py-5 bg-white text-zinc-900 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {isExporting ? <RefreshCw size={20} className="animate-spin" /> : <Download size={20} />}
            Download Report (.xlsx)
          </button>
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      </div>

      {/* Data Safety */}
      <div className="bg-rose-50 p-10 rounded-[2.5rem] border border-rose-100 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-rose-600 tracking-tight">Danger Zone</h3>
            <p className="text-rose-400 font-medium text-sm">Permanent actions that cannot be undone.</p>
          </div>
        </div>
        
        <div className="bg-white/50 p-6 rounded-2xl border border-rose-200">
          <p className="text-sm text-rose-700 font-bold leading-relaxed">
            Resetting data will permanently remove all subjects, teachers, custom schedules, and attendance logs associated with this profile.
          </p>
        </div>

        <button
          onClick={() => confirmDelete('reset', -1, 'All Data')}
          className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-200 active:scale-95 transition-all"
        >
          Reset All Application Data
        </button>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        title={`Delete ${deleteModal.type === 'subject' ? 'Subject' : deleteModal.type === 'teacher' ? 'Teacher' : 'All Data'}`}
        message={deleteModal.type === 'reset' 
          ? "Are you sure you want to reset ALL data? This action is permanent and cannot be undone."
          : `Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
      />

      <FeedbackModal 
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}
