import React from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  subject: string;
}

export default function AbsentNoteModal({ isOpen, onClose, onSubmit, subject }: Props) {
  const [note, setNote] = React.useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-zinc-100">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100">
          <h2 className="text-lg font-semibold text-zinc-900">Reason for Absence</h2>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-zinc-500 mb-4">
            You are marking <span className="font-semibold text-zinc-900">{subject}</span> as absent. Please provide a short note.
          </p>
          <textarea
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Sick leave, missed bus, etc."
            className="w-full h-32 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-200 resize-none text-zinc-900 placeholder-zinc-400"
          />
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSubmit(note);
                setNote('');
              }}
              className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
