import { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export interface DateRange {
  start_date: Date | null;
  end_date: Date | null;
}

export interface DatePickerProps {
  mode?: "single" | "range";
  value?: Date | DateRange | null;
  onChange?: (value: Date | DateRange | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  isInModal?: boolean;
  showConfirmButton?: boolean;
  disabledDates?: Date[];
}

export default function DatePicker({
  mode = "single",
  value,
  onChange,
  placeholder,
  disabled = false,
  minDate,
  maxDate,
  className = "",
  isInModal = false,
  showConfirmButton = true,
  disabledDates = [],
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    // Inicializar currentDate en UTC 00:00
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [tempValue, setTempValue] = useState<Date | DateRange | null>(
    value || null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Establecer fecha mínima como hoy si no se especifica
  const effectiveMinDate = useMemo(() => {
    const base = minDate ? new Date(minDate) : new Date();
    // Normalizar a UTC 00:00
    return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  }, [minDate]);

  const MONTHS = [
    t("datePicker.months.january", "January"),
    t("datePicker.months.february", "February"),
    t("datePicker.months.march", "March"),
    t("datePicker.months.april", "April"),
    t("datePicker.months.may", "May"),
    t("datePicker.months.june", "June"),
    t("datePicker.months.july", "July"),
    t("datePicker.months.august", "August"),
    t("datePicker.months.september", "September"),
    t("datePicker.months.october", "October"),
    t("datePicker.months.november", "November"),
    t("datePicker.months.december", "December"),
  ];

  const DAYS = [
    t("datePicker.days.sunday", "Su"),
    t("datePicker.days.monday", "Mo"),
    t("datePicker.days.tuesday", "Tu"),
    t("datePicker.days.wednesday", "We"),
    t("datePicker.days.thursday", "Th"),
    t("datePicker.days.friday", "Fr"),
    t("datePicker.days.saturday", "Sa"),
  ];

  const today = new Date(Date.UTC((new Date()).getUTCFullYear(), (new Date()).getUTCMonth(), (new Date()).getUTCDate()));

  // Helper function para crear fecha en UTC
  const createUTCDate = (year: number, month: number, day: number): Date => {
    return new Date(Date.UTC(year, month, day));
  };

  // Sincronizar tempValue con value externo
  useEffect(() => {
    setTempValue(value || null);
  }, [value]);

  // Handle click outside - solo cuando NO está en un modal
  useEffect(() => {
    if (isInModal) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, isInModal]);

  // Sincronizar mes mostrado con la fecha seleccionada solo al abrir
  useEffect(() => {
    if (isOpen) {
      let newCurrentDate: Date;
      if (mode === "single" && tempValue instanceof Date) {
        const d = tempValue;
        newCurrentDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      } else if (
        mode === "range" &&
        tempValue &&
        typeof tempValue === "object" &&
        "start_date" in tempValue &&
        tempValue.start_date instanceof Date
      ) {
        const d = tempValue.start_date;
        newCurrentDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      } else {
        if (effectiveMinDate && !isNaN(effectiveMinDate.getTime())) {
          const d = effectiveMinDate;
          newCurrentDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        } else {
          const d = new Date();
          newCurrentDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        }
      }
      if (newCurrentDate && !isNaN(newCurrentDate.getTime())) {
        setCurrentDate(newCurrentDate);
      }
    }
  }, [isOpen, mode, effectiveMinDate, tempValue]);

  const getDaysInMonth = (date: Date) => {
    // Usar UTC para obtener días del mes
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // Usar UTC para obtener el primer día de la semana
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).getUTCDay();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getUTCDate() === date2.getUTCDate() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCFullYear() === date2.getUTCFullYear()
    );
  };

  const isDateDisabled = (date: Date) => {
    if (date < effectiveMinDate) return true;
    if (maxDate && date > maxDate) return true;

    // Check if date is in disabledDates array
    return disabledDates.some((disabledDate) => isSameDay(date, disabledDate));
  };

  const isDateOutsideRange = (date: Date) => {
    if (date < effectiveMinDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateUsedByItinerary = (date: Date) => {
    return disabledDates.some((disabledDate) => isSameDay(date, disabledDate));
  };

  const isDateSelected = (date: Date) => {
    if (mode === "single") {
      return tempValue && isSameDay(date, tempValue as Date);
    } else {
      const range = tempValue as DateRange;
      if (!range) return false;

      return (
        (range.start_date && isSameDay(date, range.start_date)) ||
        (range.end_date && isSameDay(date, range.end_date))
      );
    }
  };

  const isDateInRange = (date: Date) => {
    if (mode !== "range") return false;

    const range = tempValue as DateRange;
    if (!range || !range.start_date || !range.end_date) return false;

    return date >= range.start_date && date <= range.end_date;
  };

  const isDateInHoverRange = (date: Date) => {
    if (mode !== "range" || !hoverDate) return false;

    const range = tempValue as DateRange;
    if (!range || !range.start_date || range.end_date) return false;

    const start = range.start_date;
    const end = hoverDate;

    return (
      date.getTime() >= Math.min(start.getTime(), end.getTime()) &&
      date.getTime() <= Math.max(start.getTime(), end.getTime())
    );
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    // Crear fecha en UTC
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    
    if (mode === "single") {
      setTempValue(utcDate);
      if (!showConfirmButton) {
        onChange?.(utcDate);
        setIsOpen(false);
      }
    } else {
      const range = (tempValue as DateRange) || {
        start_date: null,
        end_date: null,
      };
      if (!range.start_date || (range.start_date && range.end_date)) {
        setTempValue({ start_date: utcDate, end_date: null });
      } else {
        const start_date = range.start_date;
        const end_date = utcDate;
        if (start_date <= end_date) {
          setTempValue({ start_date, end_date });
        } else {
          setTempValue({ start_date: end_date, end_date: start_date });
        }
        if (!showConfirmButton) {
          onChange?.({ start_date, end_date });
          setIsOpen(false);
        }
      }
    }
  };

  const handleConfirm = () => {
    onChange?.(tempValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value || null);
    setIsOpen(false);
  };

  // Helper para formatear fechas UTC de forma manual y evitar problemas de zona horaria
  const formatUTCDate = (date: Date, includeYear = false) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const month = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    
    return includeYear ? `${month} ${day}, ${year}` : `${month} ${day}`;
  };

  const formatDisplayValue = () => {
    if (!tempValue) return placeholder || "Select date";

    if (mode === "single") {
      const dateValue = tempValue as Date;
      return formatUTCDate(dateValue, true);
    } else {
      const range = tempValue as DateRange;
      
      if (range.start_date && range.end_date) {
        const startDisplay = formatUTCDate(range.start_date);
        const endDisplay = formatUTCDate(range.end_date, true);
        
        return `${startDisplay} - ${endDisplay}`;
      } else if (range.start_date) {
        return `${formatUTCDate(range.start_date, true)} - ${t("datePicker.selectEndDate", "Select end date")}`;
      }
      return (
        placeholder || t("datePicker.selectDateRange", "Select date range")
      );
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      // Navegación de meses usando UTC
      const year = prev.getUTCFullYear();
      const month = prev.getUTCMonth();
      let newMonth = direction === "prev" ? month - 1 : month + 1;
      let newYear = year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      return new Date(Date.UTC(newYear, newMonth, 1));
    });
  };

  const renderCalendar = () => {
    // Verificar que currentDate sea válida
    if (!currentDate || isNaN(currentDate.getTime())) {
      return [];
    }

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = createUTCDate(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth(),
        day
      );
      const isSelected = isDateSelected(date);
      const isInRange = isDateInRange(date);
      const isInHoverRange = isDateInHoverRange(date);
      const isDisabled = isDateDisabled(date);
      const isOutsideRange = isDateOutsideRange(date);
      const isUsedByItinerary = isDateUsedByItinerary(date);
      const isToday = isSameDay(date, today);

      days.push(
        <button
          type="button"
          key={day}
          onClick={(e) => {
            e.stopPropagation();
            handleDateClick(date);
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            setHoverDate(date);
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
            setHoverDate(null);
          }}
          disabled={isDisabled}
          className={`
            ${
              isInModal ? "h-8 w-8" : "h-10 w-10"
            } rounded-full flex items-center justify-center text-sm font-medium transition-all duration-150
            ${
              isOutsideRange
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : isUsedByItinerary
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-100 dark:bg-gray-700 line-through"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            }
            ${
              isSelected
                ? "bg-gray-900 dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700"
                : ""
            }
            ${
              (isInRange || isInHoverRange) && !isSelected
                ? "bg-gray-200 dark:bg-gray-600"
                : ""
            }
            ${
              isToday && !isSelected
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
                : ""
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const renderCalendarContent = () => (
    <div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[99999] min-w-[320px] ${
        isInModal ? "p-4" : "p-6"
      }`}
      style={
        isInModal
          ? undefined
          : {
              position: "absolute",
              top: "100%",
              left: "0",
              marginTop: "8px",
              zIndex: 99999,
            }
      }
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between ${
          isInModal ? "mb-2" : "mb-4"
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigateMonth("prev");
          }}
          disabled={false}
          className={`${
            isInModal ? "p-1.5" : "p-2"
          } rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400`}
        >
          <ChevronLeft className={isInModal ? "h-4 w-4" : "h-5 w-5"} />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {currentDate && !isNaN(currentDate.getTime())
            ? `${MONTHS[currentDate.getUTCMonth()]} ${currentDate.getUTCFullYear()}`
            : "Invalid Date"}
        </h2>

        <div className="flex items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateMonth("next");
            }}
            disabled={false}
            className={`${
              isInModal ? "p-1.5" : "p-2"
            } rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400`}
          >
            <ChevronRight className={isInModal ? "h-4 w-4" : "h-5 w-5"} />
          </button>

          {isInModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
              className={`ml-2 ${
                isInModal ? "p-1.5" : "p-2"
              } hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-400`}
            >
              <X className={isInModal ? "h-4 w-4" : "h-5 w-5"} />
            </button>
          )}
        </div>
      </div>

      {/* Days header */}
      <div
        className={`grid grid-cols-7 ${
          isInModal ? "gap-0.5 mb-1" : "gap-1 mb-2"
        }`}
      >
        {DAYS.map((day) => (
          <div
            key={day}
            className={`${
              isInModal ? "h-8" : "h-10"
            } flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`grid grid-cols-7 ${isInModal ? "gap-0.5" : "gap-1"}`}>
        {renderCalendar()}
      </div>

      {/* Footer */}
      <div
        className={`${
          isInModal ? "mt-4 pt-3" : "mt-6 pt-4"
        } border-t border-gray-200 dark:border-gray-700`}
      >
        {/* Legend for disabled dates */}
        {disabledDates.length > 0 && (
          <div className="mb-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-300 dark:text-gray-500 line-through">
              15
            </div>
            <span>
              {t(
                "datePicker.disabledDatesLegend",
                "Dates already used by other itineraries"
              )}
            </span>
          </div>
        )}

        <div
          className={`flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 ${
            isInModal ? "mb-3" : "mb-4"
          }`}
        >
          <span>
            {mode === "range" &&
            tempValue &&
            (tempValue as DateRange).start_date &&
            (tempValue as DateRange).end_date
              ? `${Math.ceil(
                  (((tempValue as DateRange).end_date?.getTime?.() ?? 0) -
                    ((tempValue as DateRange).start_date?.getTime?.() ?? 0)) /
                    (1000 * 60 * 60 * 24)
                )} ${t("datePicker.nights", "nights")}`
              : t("datePicker.selectYourDates", "Select your dates")}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setTempValue(null);
            }}
            className="text-gray-900 dark:text-gray-100 hover:underline font-medium"
          >
            {t("datePicker.clear", "Clear")}
          </button>
        </div>

        {/* Action buttons */}
        {showConfirmButton && (
          <div className={`flex ${isInModal ? "gap-1.5" : "gap-2"}`}>
            <button
              type="button"
              onClick={handleCancel}
              className={`flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors ${
                isInModal ? "px-3 py-1.5" : "px-4 py-2"
              }`}
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ${
                isInModal ? "px-3 py-1.5" : "px-4 py-2"
              }`}
            >
              {t("common.confirm", "Confirm")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
      >
        <span>{formatDisplayValue()}</span>
        <CalendarIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 ml-2" />
      </button>
      {isOpen &&
        (isInModal ? (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 99999,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {renderCalendarContent()}
          </div>
        ) : (
          <div style={{ position: "relative" }}>{renderCalendarContent()}</div>
        ))}
    </div>
  );
}
