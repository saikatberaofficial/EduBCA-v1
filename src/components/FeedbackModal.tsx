import React, { useState } from 'react';
import { X, Send, MessageSquare, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { sendFeedback } from '../services/firebase';
import { storageService } from '../services/storageService';
import { cn } from '../utils/cn';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [category, setCategory] = useState<'Suggestion' | 'Complaint' | 'Bug'>('Suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = storageService.getProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await sendFeedback({
        userName: profile.name || 'Anonymous',
        studentId: profile.studentId || 'N/A',
        category,
        message: message.trim()
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setMessage('');
      }, 2000);
    } catch (err: any) {
      let errorMessage = 'Failed to send feedback.';
      try {
        const parsedError = JSON.parse(err.message);
        if (parsedError.error.includes('permissions')) {
          errorMessage = 'Permission Denied: Please check your Firestore Security Rules for the specific database ID.';
        }
      } catch {
        errorMessage = err.message || 'An unexpected error occurred.';
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-zinc-100">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">Help & Feedback</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">We value your input</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-xl transition-colors text-zinc-400">
              <X size={20} />
            </button>
          </div>

          {isSuccess ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-zinc-900">Thank You!</h4>
                <p className="text-zinc-500 text-sm">Your feedback has been sent to the admin.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-2">
                {(['Suggestion', 'Complaint', 'Bug'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                      category === cat 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    category === 'Suggestion' ? "How can we improve?" :
                    category === 'Complaint' ? "What went wrong?" : "Describe the bug..."
                  }
                  className="w-full h-32 px-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-zinc-900 font-medium resize-none"
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
