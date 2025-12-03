import React from "react";
import { useTravel } from "../../hooks/useTravel";
import { TripDay } from "../TripDay";

interface TravelDaysProps {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  onOpenAIModal?: (date: string, dayNumber: number) => void;
  onOpenAddActivityModal?: (date: string) => void;
  onOpenAddExpenseModal?: (date: string) => void;
  onEditActivity?: (activityId: string) => void;
  onEditExpense?: (expenseId: string) => void;
}

export const TravelDays: React.FC<TravelDaysProps> = ({
  selectedDate,
  setSelectedDate,
  onOpenAIModal,
  onOpenAddActivityModal,
  onOpenAddExpenseModal,
  onEditActivity,
  onEditExpense,
}) => {
  const { travel, dailyPlan } = useTravel();

  // Handlers globales
  const handleToggleExpand = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
  };

  return (
    <div className="overview-cards-container flex flex-col">
      {dailyPlan.map((day, index: number) => {
        const dayNumber = index + 1;
        const date = day.day;
        // Puedes calcular el status según lógica real
        const status = selectedDate === date ? "active" : "upcoming";
        return (
          <TripDay
            key={date}
            dayNumber={dayNumber}
            date={date}
            budget={
              travel?.budget ? travel.budget / (dailyPlan.length || 1) : 0
            }
            activitiesCount={day.activities_count}
            expensesCount={day.expenses_count}
            totalSpent={day.total_spent}
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
            onAI={() => onOpenAIModal && onOpenAIModal(date, dayNumber)}
          />
        );
      })}
    </div>
  );
};
