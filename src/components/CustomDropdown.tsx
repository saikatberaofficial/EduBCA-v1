import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: LucideIcon;
  itemIcon?: LucideIcon;
}

export default function CustomDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon,
  itemIcon: ItemIcon
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 bg-white border-2 rounded-2xl transition-all outline-none",
          isOpen || value
            ? "border-[#00B4FF] ring-4 ring-[#00B4FF]/10 shadow-sm" 
            : "border-zinc-100 hover:border-zinc-200"
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon size={18} className={cn(isOpen || value ? "text-[#00B4FF]" : "text-zinc-400")} />}
          <span className={cn(
            "font-bold text-sm truncate",
            isOpen || value ? "text-[#00B4FF]" : "text-zinc-400"
          )}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown 
          size={20} 
          className={cn(
            "transition-transform duration-300",
            isOpen || value ? "text-[#00B4FF]" : "text-zinc-400",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-[60] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[240px] overflow-y-auto no-scrollbar py-2">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-zinc-400 text-sm font-medium italic">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    value === option 
                      ? "bg-sky-50 text-[#00B4FF]" 
                      : "text-zinc-600 hover:bg-zinc-50"
                  )}
                >
                  {ItemIcon && <ItemIcon size={18} className={cn(value === option ? "text-[#00B4FF]" : "text-zinc-400")} />}
                  <span className="font-bold text-sm">{option}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
