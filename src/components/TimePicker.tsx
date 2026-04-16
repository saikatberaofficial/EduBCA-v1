import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../utils/cn';

interface TimePickerProps {
  value: string; // "HH:mm" format (24h)
  onChange: (value: string) => void;
  label?: string;
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Convert 24h to 12h for the picker
  const [h24, m24] = value.split(':').map(Number);
  const initialH12 = h24 % 12 || 12;
  const initialM = m24;
  const initialAMPM = h24 >= 12 ? 'PM' : 'AM';

  const [tempH, setTempH] = useState(initialH12);
  const [tempM, setTempM] = useState(initialM);
  const [tempAMPM, setTempAMPM] = useState(initialAMPM);

  useEffect(() => {
    if (isOpen) {
      const [h, m] = value.split(':').map(Number);
      setTempH(h % 12 || 12);
      setTempM(m);
      setTempAMPM(h >= 12 ? 'PM' : 'AM');
    }
  }, [isOpen, value]);

  const handleSave = () => {
    let finalH = tempH;
    if (tempAMPM === 'PM' && finalH < 12) finalH += 12;
    if (tempAMPM === 'AM' && finalH === 12) finalH = 0;
    
    const timeStr = `${finalH.toString().padStart(2, '0')}:${tempM.toString().padStart(2, '0')}`;
    onChange(timeStr);
    setIsOpen(false);
  };

  const formatDisplay = () => {
    const [h, m] = value.split(':').map(Number);
    const displayH = h % 12 || 12;
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-zinc-100 group-hover:border-zinc-200"
        >
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <span className="text-zinc-900 font-bold text-sm">{formatDisplay()}</span>
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-[320px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-zinc-100">
            <div className="p-8">
              <div className="text-center mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1">Select Time</h4>
                <div className="text-3xl font-black text-zinc-900 tracking-tight">
                  {tempH.toString().padStart(2, '0')}:{tempM.toString().padStart(2, '0')} <span className="text-primary">{tempAMPM}</span>
                </div>
              </div>

              <div className="relative h-[220px] flex items-center justify-center select-none bg-zinc-50 rounded-3xl border border-zinc-100">
                {/* Selection Highlight */}
                <div className="absolute inset-x-4 h-12 bg-white rounded-2xl shadow-sm border border-zinc-100 pointer-events-none" />
                
                <div className="flex items-center justify-center gap-4 w-full h-full relative z-10">
                  <Wheel
                    items={Array.from({ length: 12 }, (_, i) => i + 1)}
                    value={tempH}
                    onChange={setTempH}
                  />
                  <span className="text-2xl font-bold text-zinc-300">:</span>
                  <Wheel
                    items={Array.from({ length: 60 }, (_, i) => i)}
                    value={tempM}
                    onChange={setTempM}
                  />
                  <Wheel
                    items={['AM', 'PM']}
                    value={tempAMPM}
                    onChange={setTempAMPM}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-all hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all hover:bg-primary-hover"
                >
                  Set Time
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface WheelProps<T> {
  items: T[];
  value: T;
  onChange: (val: T) => void;
}

function Wheel<T extends string | number>({ items, value, onChange }: WheelProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemHeight = 44;
  
  // Create an extended list for infinite-like feel
  const displayItems = [...items, ...items, ...items];
  const middleOffset = items.length;

  useEffect(() => {
    if (scrollRef.current) {
      const index = items.indexOf(value);
      scrollRef.current.scrollTop = (index + middleOffset) * itemHeight;
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const index = items.indexOf(value);
      const currentScroll = scrollRef.current.scrollTop;
      const targetScroll = (index + middleOffset) * itemHeight;
      if (Math.abs(currentScroll - targetScroll) > 1) {
        scrollRef.current.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }, [value, items, middleOffset]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const actualIndex = index % items.length;
    const newValue = items[actualIndex];

    if (newValue !== value) {
      onChange(newValue);
    }

    // Infinite scroll reset
    if (scrollTop <= itemHeight * (middleOffset - 3)) {
      scrollRef.current.scrollTop = scrollTop + items.length * itemHeight;
    } else if (scrollTop >= itemHeight * (middleOffset + items.length + 3)) {
      scrollRef.current.scrollTop = scrollTop - items.length * itemHeight;
    }
  };

  const handleItemClick = (item: T) => {
    onChange(item);
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-[220px] overflow-y-scroll snap-y snap-mandatory no-scrollbar w-14"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div className="py-[88px]">
        {displayItems.map((item, i) => (
          <div
            key={i}
            onClick={() => handleItemClick(item)}
            className={cn(
              "h-[44px] flex items-center justify-center text-lg transition-all snap-center cursor-pointer",
              (i % items.length) === items.indexOf(value)
                ? "text-primary font-black scale-125"
                : "text-zinc-300 font-bold scale-90 opacity-40"
            )}
          >
            {typeof item === 'number' ? item.toString().padStart(2, '0') : item}
          </div>
        ))}
      </div>
    </div>
  );
}
