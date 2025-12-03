import React from "react";
import { useTravel } from "../hooks/useTravel";
import { TripDay } from "./TripDay";

interface TravelDaysWithPaginationProps {
  travelDays: string[];
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  onOpenAIModal?: (date: string, dayNumber: number) => void;
  onOpenAddActivityModal?: (date: string) => void;
  onOpenAddExpenseModal?: (date: string) => void;
  onEditActivity?: (activityId: string) => void;
  onEditExpense?: (expenseId: string) => void;
  travelBudget: number;
}

export const TravelDaysWithPagination: React.FC<
  TravelDaysWithPaginationProps
> = ({
  travelDays,
  selectedDate,
  setSelectedDate,
  onOpenAIModal,
  onOpenAddActivityModal,
  onOpenAddExpenseModal,
  onEditActivity,
  onEditExpense,
  travelBudget,
}) => {
  const { dailyPlan } = useTravel();

  // Ensure we have valid data before rendering
  const hasValidData = travelDays.length > 0 && travelBudget > 0;

  // Don't render if we don't have valid data
  if (!hasValidData) {
    return (
      <div className="overview-cards-container flex flex-col">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center text-gray-500">
            Cargando datos del viaje...
          </div>
        </div>
      </div>
    );
  }

  // Handlers for day interactions
  const handleToggleExpand = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
  };

  return (
    <div className="overview-cards-container flex flex-col">
      {/* Days */}
      <div className="grid grid-cols-1 gap-4">
        {travelDays.map((date: string, weekIndex: number) => {
          // Calculate the actual day number based on the original trip days
          const actualDayNumber = weekIndex + 1;
          const dayData = dailyPlan.find((day) => day.day === date);
          const status = selectedDate === date ? "active" : "upcoming";

          return (
            <TripDay
              key={date}
              dayNumber={actualDayNumber}
              date={date}
              budget={
                travelBudget ? travelBudget / (travelDays.length || 1) : 0
              }
              activitiesCount={dayData?.activities_count || 0}
              expensesCount={dayData?.expenses_count || 0}
              totalSpent={dayData?.total_spent || 0}
              status={status}
              expanded={selectedDate === date}
              onToggleExpand={() => handleToggleExpand(date)}
              onAddActivity={() =>
                onOpenAddActivityModal && onOpenAddActivityModal(date)
              }
              onAddExpense={() =>
                onOpenAddExpenseModal && onOpenAddExpenseModal(date)
              }
              onEditActivity={onEditActivity || (() => {})}
              onEditExpense={onEditExpense || (() => {})}
              onAI={() => onOpenAIModal && onOpenAIModal(date, actualDayNumber)}
            />
          );
        })}
      </div>
    </div>
  );
};
