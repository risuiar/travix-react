import React, { useState } from "react";

interface Interest {
  key: string;
  label: string;
  description?: string;
}

interface Category {
  key: string;
  label: string;
  interests: Interest[];
}

interface InterestsAccordionProps {
  categories: Category[];
  selected: Record<string, boolean>;
  onToggle: (key: string) => void;
}

const InterestsAccordion: React.FC<InterestsAccordionProps> = ({
  categories,
  selected,
  onToggle,
}) => {
  const [open, setOpen] = useState<string[]>([categories[0]?.key]);

  const handleToggleAccordion = (catKey: string) => {
    setOpen((prev) =>
      prev.includes(catKey)
        ? prev.filter((k) => k !== catKey)
        : [...prev, catKey]
    );
  };

  return (
    <div className="space-y-2">
      {categories.map((cat) => (
        <div
          key={cat.key}
          className="border rounded-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
        >
          <button
            type="button"
            className="w-full flex justify-between items-center px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
            onClick={() => handleToggleAccordion(cat.key)}
            aria-expanded={open.includes(cat.key)}
          >
            <span>{cat.label}</span>
            <svg
              className={`w-4 h-4 ml-2 transition-transform ${
                open.includes(cat.key) ? "rotate-180" : ""
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
          {open.includes(cat.key) && (
            <div className="px-4 pb-3 pt-1 flex flex-wrap gap-1.5">
              {cat.interests.map((interest) => (
                <button
                  key={interest.key}
                  type="button"
                  onClick={() => onToggle(interest.key)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    selected[interest.key]
                      ? "bg-blue-500 text-white shadow-sm hover:bg-blue-600 border-blue-500"
                      : "bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 border-gray-200 dark:border-gray-500"
                  }`}
                  title={interest.description}
                >
                  {interest.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InterestsAccordion;
