"use client";
import React, { useState, useRef, useEffect } from "react";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  theme?: "dark" | "light";
}

export function MultiSelect({ options, value, onChange, placeholder = "Seçiniz", disabled = false, theme = "dark" }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const dropdownClass = theme === "dark"
    ? "bg-[#1a1a1a] border-white/10"
    : "bg-white border-neutral-200";

  const optionHoverClass = theme === "dark"
    ? "hover:bg-white/5"
    : "hover:bg-neutral-50";

  const checkboxBorderClass = theme === "dark"
    ? "border-white/30"
    : "border-neutral-400";

  const textColor = theme === "dark" ? "text-white" : "text-neutral-900";
  const iconColor = theme === "dark" ? "text-white/50" : "text-neutral-500";
  
  const buttonClass = theme === "dark"
    ? "bg-[#1a1a1a] border-white/10 text-white"
    : "bg-white border-neutral-300 text-neutral-900";

  // Filtre panellerinde 52px, profil düzenleme gibi sayfalarda 60px - tema bazlı
  const heightClass = theme === "dark" ? "h-[52px]" : "h-[60px]";
  const borderClass = theme === "dark" ? "border-2 border-[#ff7a00] rounded-xl" : "border border-neutral-300 rounded-lg";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full ${heightClass} px-4 ${borderClass} text-sm flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/50 focus:border-[#ff7a00] ${buttonClass} ${
          disabled ? "opacity-60 cursor-not-allowed !bg-neutral-100" : "cursor-pointer hover:border-[#ff7a00]"
        }`}
      >
        <span className={`truncate block mr-2 ${value.length === 0 ? (theme === "dark" ? "text-white/50" : "text-neutral-500") : textColor}`}>
          {value.length === 0
            ? placeholder
            : value.length === options.length
            ? "Tümü Seçili"
            : `${value.length} seçim`}
        </span>
        <svg
          className={`w-5 h-5 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""} ${iconColor}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-2 border rounded-xl shadow-xl max-h-60 overflow-y-auto ${dropdownClass}`}>
          <div className={`p-2 sticky top-0 border-b z-10 ${theme === "dark" ? "bg-[#1a1a1a] border-white/10" : "bg-white border-neutral-200"}`}>
             <button
              type="button"
              onClick={handleSelectAll}
              className={`w-full text-left px-3 py-2 text-sm text-[#ff7a00] rounded-lg transition-colors font-medium ${optionHoverClass}`}
            >
              {value.length === options.length ? "Tümünü Kaldır" : "Tümünü Seç"}
            </button>
          </div>
          <div className="p-2 space-y-1">
            {options.map((option) => (
              <div
                key={option}
                onClick={() => toggleOption(option)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${optionHoverClass}`}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    value.includes(option)
                      ? "bg-[#ff7a00] border-[#ff7a00]"
                      : checkboxBorderClass
                  }`}
                >
                  {value.includes(option) && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${textColor}`}>{option}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
