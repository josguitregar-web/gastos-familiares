"use client";

import React from "react";
import { Expense, getEvaluatedStatus } from "@/types/expense";

interface ExpenseGridProps {
  expenses: Expense[];
  onToggleStatus: (expense: Expense) => void;
  onSyncCalendar: (expense: Expense) => void;
  onEditExpense?: (expense: Expense) => void;
  referenceDate?: Date;
  monthName?: string;
}

export const ExpenseGrid: React.FC<ExpenseGridProps> = ({
  expenses,
  onToggleStatus,
  onSyncCalendar,
  onEditExpense,
  referenceDate = new Date(),
  monthName = "Sep",
}) => {
  if (expenses.length === 0) {
    return (
      <div className="bg-surface-container-low rounded-xl p-space-xl text-center text-on-surface-variant font-body-md">
        No se encontraron gastos que coincidan con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter" id="cardViewContainer">
      {expenses.map((expense) => {
        const status = getEvaluatedStatus(expense, referenceDate);
        const isPaid = status === "Hecho";
        const isOverdue = status === "Vencido";
        const diaStr = String(expense.dia).padStart(2, "0");

        return (
          <div
            key={expense.id}
            className="bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-md hover:bg-surface-container/60 transition-all border border-outline-variant/10"
          >
            {/* Header: Category and Status Badge */}
            <div className="flex items-center justify-between mb-space-sm">
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  isOverdue
                    ? "bg-tertiary-container/30 text-tertiary"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {expense.categoria}
              </span>

              {isPaid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary/15 text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Hecho
                </span>
              ) : isOverdue ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-tertiary-container/20 text-tertiary">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> Vencido
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-primary-container/20 text-primary-fixed">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span> Pendiente
                </span>
              )}
            </div>

            {/* Content: Title, Due Date, Amount */}
            <div className="my-space-sm">
              <h4
                className={`font-headline-sm text-headline-sm font-semibold ${
                  isOverdue ? "text-tertiary" : "text-on-surface"
                }`}
              >
                {expense.concepto}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Vence {diaStr} {monthName}
                {expense.subtitulo ? ` • ${expense.subtitulo}` : ""}
              </p>
              <div
                className={`font-metric-xl text-metric-xl font-bold mt-space-sm font-mono ${
                  isOverdue ? "text-tertiary" : "text-on-surface"
                }`}
              >
                $
                {Number(expense.monto).toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            {/* Footer & Actions */}
            <div className="flex items-center justify-between pt-space-sm border-t border-outline-variant/15 mt-2">
              <span
                className={`font-body-sm text-body-sm truncate max-w-[140px] ${
                  isOverdue ? "text-tertiary" : "text-on-surface-variant"
                }`}
                title={expense.metodo}
              >
                {expense.metodo}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  className="w-8 h-8 rounded-lg bg-surface-container hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                  title="Sincronizar con Google Calendar"
                  type="button"
                  onClick={() => onSyncCalendar(expense)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    event
                  </span>
                </button>

                <button
                  onClick={() => onToggleStatus(expense)}
                  className={`px-space-md py-1 rounded-lg font-label-md text-label-md transition-colors ${
                    isPaid
                      ? "bg-surface-container text-on-surface hover:bg-surface-container-high"
                      : isOverdue
                      ? "bg-tertiary-container/30 text-tertiary hover:bg-tertiary-container/40"
                      : "bg-surface-container hover:bg-secondary/20 hover:text-secondary text-on-surface"
                  }`}
                  type="button"
                >
                  {isPaid ? "Hecho" : isOverdue ? "Pagar Ahora" : "Marcar Pagado"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
