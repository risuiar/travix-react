import React, { useState } from "react";
import {
  Plus,
  Filter,
  Search,
  Receipt,
  Calendar,
  MapPin,
  TrendingUp,
  Clock,
  Bed,
} from "lucide-react";
import { getCategoryIcon, getCategoryHexColor, categoryColors } from "../Icons";
import { Travel, Expense, ExpenseCategory } from "../../types";
import MainTravelCard from "../MainTravelCard";

import { useCurrency } from "../../hooks/useCurrency";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";
import { useTranslation } from "react-i18next";
import { useLocalizedDates } from "../../hooks/useLocalizedDates";
import { AdBannerResponsive } from "../AdBannerResponsive";
import { getCategoryKeys } from "../../data/categories";
import { Card } from "../Card";
import { 
  useTravelExpenses, 
  useTravelAccommodations,
  useExpensesTotal,
  useAccommodationsTotal,
  useActivitiesCount
} from "../../utils/hooks/useExpensesQueries";
import { useTravelOverview } from "../../utils/hooks/useTravelQueries";
import { ExpensesSkeleton } from "../Skeleton";

interface ExpensesProps {
  travel: Travel;
  onAddExpense?: () => void;
  onEditTrip: () => void;
}


// Use centralized category functions
const getCategoryColorByKey = (key: ExpenseCategory) => getCategoryHexColor(key);

export const Expenses: React.FC<ExpensesProps> = ({
  travel,
  onAddExpense,
  onEditTrip,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { formatDate } = useLocalizedDates();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAccommodationExpenseModal, setShowAccommodationExpenseModal] =
    useState(false);
  
  // Usar nuevos hooks para obtener datos sin views
  const { data: regularExpenses = [], isLoading: expensesLoading, isError: expensesError, refetch: refetchExpenses } = useTravelExpenses(parseInt(travel?.id || "0"));
  const { data: accommodations = [], isLoading: accommodationsLoading, isError: accommodationsError, refetch: refetchAccommodations } = useTravelAccommodations(parseInt(travel?.id || "0"));
  const { data: expensesTotal = 0 } = useExpensesTotal(parseInt(travel?.id || "0"));
  const { data: accommodationsTotal = 0 } = useAccommodationsTotal(parseInt(travel?.id || "0"));
  const { data: countActivities = 0 } = useActivitiesCount(parseInt(travel?.id || "0"));
  const { data: overviewData } = useTravelOverview(parseInt(travel?.id || "0"));
  
  // Combinar datos para totales
  const totalSpent = expensesTotal + accommodationsTotal;
  
  const handleRefetch = () => {
    refetchExpenses();
    refetchAccommodations();
  };

  const { userCurrency } = useCurrency();

  const handleOpenAccommodationExpenseModal = (date?: string) => {
    if (date) {
      // setSelectedDate(date); // This state was removed
    }
    setShowAccommodationExpenseModal(true);
  };

  // Ordenar y separar los expenses
  const sortedRegularExpenses = (regularExpenses || []).sort((a: Expense, b: Expense) => {
    // Si ambos tienen fecha, ordenar por fecha (más reciente primero)
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    // Si solo uno tiene fecha, el que tiene fecha va primero
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    // Si ninguno tiene fecha (gastos generales), ordenar por ID (más nuevo primero)
    return parseInt(b.id) - parseInt(a.id);
  });

  const sortedAccommodations = (accommodations || []).sort((a: Expense, b: Expense) => {
    // Ordenar accommodations por fecha
    if (a.date && b.date) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return parseInt(a.id) - parseInt(b.id);
  });

  // Para filtros, necesitamos todos juntos
  const allExpensesForFiltering = [...sortedRegularExpenses, ...sortedAccommodations];

  const filteredExpenses = allExpensesForFiltering.filter((expense) => {
    const matchesFilter =
      filter === "all" ||
      expense.category === filter ||
      t(`categories.${expense.category as ExpenseCategory}`) === filter;
    const matchesSearch =
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.location &&
        expense.location.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Separar los filtrados por tipo
  const filteredRegularExpenses = filteredExpenses.filter(e => e.category !== ("accommodation" as ExpenseCategory));
  const filteredAccommodations = filteredExpenses.filter(e => e.category === ("accommodation" as ExpenseCategory));

  // Usar totalSpent del hook para que sea consistente
  const totalExpenses = totalSpent;
  const categoryTotals = (allExpensesForFiltering as Expense[]).reduce(
    (acc: Record<string, number>, expense) => {
      const mapped = t(`categories.${expense.category as ExpenseCategory}`);
      acc[mapped] = (acc[mapped] || 0) + expense.cost;
      return acc;
    },
    {}
  );

  const totalBudget = travel.budget || 0;

  // Group regular expenses by date
  const regularExpensesByDate = filteredRegularExpenses.reduce(
    (acc: Record<string, Expense[]>, expense) => {
      const dateKey = expense.date || "general";
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(expense);
      return acc;
    },
    {}
  );

  // Check if main data is still loading
  if (expensesLoading || accommodationsLoading) {
  return <ExpensesSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto pt-0 pb-6 px-0 sm:px-0">
      {/* Reusable Trip Header */}
      <MainTravelCard
        name={travel.name}
        startDate={travel.start_date}
        endDate={travel.end_date}
        country_codes={travel.country_codes}
        budget={travel.budget}
        spent={totalSpent}
        activities={countActivities}
        expenses={overviewData?.total_expenses || (regularExpenses.length + accommodations.length)}
        onEdit={onEditTrip}
        onBack={() => navigate("/travels")}
      />
      {/* Ad Banner */}
      <AdBannerResponsive area="large" provider="custom" className="mb-4" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 lg:gap-4 pt-4">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Controls */}
          <Card className="mb-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <h2 className="text-xs sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                {t("expense.allExpenses")}
              </h2>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-1.5 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder={t("expense.searchExpenses")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-6 pr-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none text-xs w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-1">
                  <Filter className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">{t("expense.allCategories")}</option>
                    {getCategoryKeys().map((categoryKey) => (
                      <option
                        key={categoryKey}
                        value={t(`categories.${categoryKey}`)}
                      >
                        {t(`categories.${categoryKey}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Expenses List */}
          <div className="space-y-3">
            {(expensesLoading || accommodationsLoading) ? (
              <Card>
                <div className="text-center py-4">
                  <div className="text-gray-400 dark:text-gray-500 text-xs">
                    {t("common.loading", "Loading expenses...")}
                  </div>
                </div>
              </Card>
            ) : (expensesError || accommodationsError) ? (
              <Card>
                <div className="text-center py-4">
                  <div className="text-red-400 text-xs mb-2">
                    {t("common.error", "Error loading expenses")}
                  </div>
                  <button
                    onClick={handleRefetch}
                    className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors font-medium text-xs"
                  >
                    {t("common.retry", "Retry")}
                  </button>
                </div>
              </Card>
            ) : (
              <>
                {/* Accommodations Section */}
                {filteredAccommodations.length > 0 && (
                  <Card>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: getCategoryHexColor("accommodation") }}
                        >
                          <Bed className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {t("expense.accommodations")}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(accommodationsTotal, userCurrency)}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {filteredAccommodations.length} {t("dailyPlanner.expenses")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {filteredAccommodations.map((accommodation) => (
                        <div
                          key={accommodation.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
                        >
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: getCategoryHexColor("accommodation") }}
                          >
                            <span className="text-sm">{getCategoryIcon("accommodation")}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {accommodation.title}
                            </h4>
                            {accommodation.location && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                                📍 {accommodation.location}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {accommodation.startDate && accommodation.endDate ? (
                                <span>
                                  {formatDate(accommodation.startDate)} - {formatDate(accommodation.endDate)}
                                </span>
                              ) : accommodation.date ? (
                                <span>{formatDate(accommodation.date)}</span>
                              ) : (
                                <span>{t("overview.generalExpenses")}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {formatCurrency(accommodation.cost, userCurrency, true)}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {t("expense.total", "Total")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Regular Expenses Section */}
                {Object.entries(regularExpensesByDate)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, dayExpenses], i) => {
                const dayTotal = (dayExpenses as Expense[]).reduce(
                  (sum, expense) => sum + expense.cost,
                  0
                );

                return (
                  <React.Fragment key={date}>
                    {i % 2 === 0 && (
                      <AdBannerResponsive
                        area="medium"
                        provider="custom"
                        className="mb-4"
                      />
                    )}
                    <Card>
                      {/* Date Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 pb-1.5 border-b border-gray-100 dark:border-gray-700 gap-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: getCategoryHexColor("sightseeing") }}
                          >
                            <Calendar className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                              {date === "general"
                                ? t("overview.generalExpenses")
                                : formatDate(date)}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {(dayExpenses as Expense[]).length}{" "}
                              {t("dailyPlanner.expenses")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(dayTotal, userCurrency)}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {t("dailyPlanner.totalDay")}
                          </p>
                        </div>
                      </div>

                      {/* Expenses List */}
                      <div className="space-y-1">
                        {(dayExpenses as Expense[])
                          .sort((a, b) => {
                            // Sort by time if available, otherwise by title
                            if (a.notes && b.notes) {
                              return a.notes.localeCompare(b.notes);
                            }
                            return a.title.localeCompare(b.title);
                          })
                          .map((expense) => {
                            const mappedCategory = t(
                              `categories.${
                                expense.category as ExpenseCategory
                              }`
                            );

                            return (
                              <div
                                key={expense.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-1.5 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-all duration-200"
                              >
                                {/* Category Icon */}
                                <div
                                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: getCategoryHexColor(expense.category as ExpenseCategory) }}
                                >
                                  <span className="text-xs">
                                    {getCategoryIcon(
                                      expense.category as ExpenseCategory
                                    )}
                                  </span>
                                </div>

                                {/* Expense Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 mb-0.5">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                                      {expense.title}
                                    </h4>
                                    <span
                                      className="inline-block px-1 py-0.5 rounded-full text-xs font-medium self-start"
                                      style={{
                                        backgroundColor: getCategoryHexColor(expense.category as ExpenseCategory),
                                        color: categoryColors[expense.category as ExpenseCategory] || categoryColors.other,
                                      }}
                                    >
                                      {mappedCategory}
                                    </span>
                                  </div>

                                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1 text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <span>{expense.notes}</span>
                                    </div>
                                    {expense.location && (
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-2.5 h-2.5" />
                                        <span className="truncate">
                                          {expense.location}
                                        </span>
                                      </div>
                                    )}
                                    <div className="text-gray-500 dark:text-gray-400 text-xs hidden sm:block">
                                      {expense.location}
                                    </div>
                                  </div>

                                  {expense.notes &&
                                    expense.notes !== expense.title && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 hidden sm:block">
                                        {expense.notes}
                                      </p>
                                    )}
                                </div>

                                {/* Amount */}
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(
                                      expense.cost,
                                      userCurrency,
                                      true
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </Card>
                  </React.Fragment>
                );
              })}
              </>
            )}
          </div>

          {filteredExpenses.length === 0 && (
            <div className="text-center py-4">
              <Receipt className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
              <div className="text-gray-400 dark:text-gray-500 text-xs mb-1">
                {t("overview.noExpenses")}
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2 text-xs">
                {t("expense.searchExpenses")}
              </p>
              <button
                onClick={onAddExpense}
                className="bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors font-medium text-xs"
              >
                {t("dailyPlanner.addFirstExpense")}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Ad Banner */}
          <AdBannerResponsive
            area="planner-side"
            provider="custom"
            className="mb-4"
          />
          {/* Category Breakdown */}
          <Card>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("expense.categoryBreakdown")}
            </h3>

            <div className="space-y-1.5">
              {Object.entries(categoryTotals).map(([category, amount]) => {
                // Find the category key by name for backward compatibility
                const categoryKey =
                  (Object.values(getCategoryKeys()).find(
                    (key) => t(`categories.${key}`) === category
                  ) as ExpenseCategory) || "other";
                const categoryColor = getCategoryColorByKey(categoryKey);
                const percentage =
                  totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">
                          {getCategoryIcon(categoryKey)}
                        </span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {category}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(amount, userCurrency, false)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div
                        className="h-1 rounded-full"
                        style={{
                          backgroundColor: categoryColor,
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {percentage.toFixed(1)}%{" "}
                      {t("expense.ofSpent", {
                        budget: formatCurrency(
                          totalBudget,
                          userCurrency,
                          false
                        ),
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Expenses Breakdown: Accommodation vs Others */}
          <Card>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("expense.expenseBreakdown")}
            </h3>

            <div className="space-y-1.5">
              {/* Accommodations */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">🛏️</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t("categories.accommodation", "Accommodation")}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(accommodationsTotal, userCurrency, false)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-blue-500"
                    style={{
                      width: `${totalSpent > 0 ? (accommodationsTotal / totalSpent) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {totalSpent > 0 ? ((accommodationsTotal / totalSpent) * 100).toFixed(1) : 0}% of total
                </div>
              </div>

              {/* Other Expenses */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">💰</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t("expense.otherExpenses", "Other Expenses")}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(expensesTotal, userCurrency, false)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-green-500"
                    style={{
                      width: `${totalSpent > 0 ? (expensesTotal / totalSpent) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {totalSpent > 0 ? ((expensesTotal / totalSpent) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
            </div>
          </Card>

          {/* Budget Progress */}
          <Card>
            <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t("trip.budgetProgress")}
            </h3>

            <div className="space-y-1.5">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-0.5">
                  {formatCurrency(totalExpenses, userCurrency, false)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {totalExpenses > totalBudget ? (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      {t("expense.budgetExceeded")}
                    </span>
                  ) : (
                    t("expense.ofSpent", {
                      budget: formatCurrency(totalBudget, userCurrency, false),
                    })
                  )}
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    totalExpenses > totalBudget
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (totalExpenses / totalBudget) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>{formatCurrency(0, userCurrency, false)}</span>
                <span>{formatCurrency(totalBudget, userCurrency, false)}</span>
              </div>
            </div>
          </Card>

          {/* Ad Banner */}
          <AdBannerResponsive
            area="planner-side"
            provider="custom"
            className="mb-4"
          />
          
        </div>
      </div>
      {/* Ad Banner */}
      <AdBannerResponsive area="large" provider="custom" className="mb-4" />
    </div>
  );
};

export default Expenses;
