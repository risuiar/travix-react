import { Travel } from "../types";

export const calculateTotalExpenses = (travel: Travel): number => {
  // Usar el total de la base de datos
  // Nota: Este valor puede estar desactualizado si hay gastos generales
  const expenses = Number(travel.total_expenses) || 0;
  return expenses;
};

export const calculateRemainingBudget = (travel: Travel): number => {
  const totalExpenses = calculateTotalExpenses(travel);
  const budget = Number(travel.budget) || 0;
  return budget - totalExpenses;
};
