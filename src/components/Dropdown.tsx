import React, { useState, useRef, useEffect, ReactNode } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  [key: string]: unknown;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (option: DropdownOption) => void;
  icon?: ReactNode | ((option: DropdownOption, selected: boolean) => ReactNode);
  disabled?: boolean;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  icon,
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value) || options[0];

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close with Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Helper to render icon
  const renderIcon = (option: DropdownOption, isSelected: boolean) => {
    if (!icon) return null;
    if (typeof icon === "function") return icon(option, isSelected);
    return icon;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
          open
            ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/20"
            : "border-gray-300 dark:border-gray-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          {renderIcon(selected, true) && (
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/20">
              {renderIcon(selected, true)}
            </span>
          )}
          <div className="flex flex-col items-start">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selected.label}
            </span>
            {selected.description && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selected.description}
              </span>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 ml-2 text-gray-400 dark:text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-y-auto max-h-80 animate-fade-in"
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`w-full flex items-center px-4 py-3 gap-3 transition-all text-left ${
                  isSelected
                    ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                }`}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                tabIndex={0}
                aria-selected={isSelected}
                role="option"
              >
                {renderIcon(opt, isSelected) && (
                  <span
                    className={`flex items-center justify-center w-10 h-10 rounded-xl ${
                      isSelected
                        ? "bg-violet-200 dark:bg-violet-800"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    {renderIcon(opt, isSelected)}
                  </span>
                )}
                <div className="flex flex-col items-start flex-1">
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {opt.label}
                  </span>
                  {opt.description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {opt.description}
                    </span>
                  )}
                </div>
                {isSelected && (
                  <span className="ml-auto w-3 h-3 bg-violet-500 dark:bg-violet-400 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
