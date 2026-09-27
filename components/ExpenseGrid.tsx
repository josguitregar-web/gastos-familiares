"use client";

import React from "react";
import { Expense, getEvaluatedStatus, ExpenseCategory } from "@/types/expense";

interface ExpenseGridProps {
  expenses: Expense[];
  onToggleStatus: (expense: Expense) => void;
  onOpenCalendarExport: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  selectedIds: string[];
  onToggleSelectRow: (id: string) => void;
  referenceDate?: Date;
  monthName?: string;
}

export const ExpenseGrid: React.FC<ExpenseGridProps> = ({
  expenses,
  onToggleStatus,
  onOpenCalendarExport,
  onEditExpense,
  selectedIds,
  onToggleSelectRow,
  referenceDate = new Date(),
  monthName = "Sep",
}) => {
  const getCategoryIcon = (categoria: ExpenseCategory, concepto: string, iconoPersonalizado?: string) => {
    if (iconoPersonalizado) return iconoPersonalizado;

    const c = concepto.toLowerCase();
    if (c.includes("luz") || c.includes("cfe") || c.includes("gas")) return "bolt";
    if (c.includes("telmex") || c.includes("internet") || c.includes("izzi") || c.includes("wifi")) return "wifi";
    if (c.includes("agua")) return "water_drop";
    if (c.includes("auto") || c.includes("seguro")) return "directions_car";
    if (c.includes("renta") || c.includes("depto") || c.includes("mantenimiento")) return "home";
    if (c.includes("colegiatura") || c.includes("escuela")) return "school";
    if (c.includes("mercado") || c.includes("super")) return "shopping_cart";

    switch (categoria) {
      case "Vivienda":
        return "home";
      case "Educación":
        return "school";
      case "Salud":
        return "health_and_safety";
      case "Tarjetas":
        return "credit_card";
      case "Servicios":
      default:
        return "receipt";
    }
  };

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
        const iconName = getCategoryIcon(expense.categoria, expense.concepto, expense.icono);
        const isChecked = selectedIds.includes(expense.id);

        return (
          <div
            key={expense.id}
            className={`bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-md hover:bg-surface-container/60 transition-all border ${
              isChecked
                ? "border-primary shadow-lg ring-1 ring-primary"
                : "border-outline-variant/10"
            }`}
          >
            {/* Header: Checkbox, Category, Icon & Status Badge */}
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleSelectRow(expense.id)}
                  className="w-4 h-4 rounded border-outline-variant/40 bg-surface-container-high text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer accent-primary"
                  title="Seleccionar para lote"
                />
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    {iconName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      isOverdue
                        ? "bg-tertiary-container/30 text-tertiary"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {expense.categoria}
                  </span>
                </div>
              </div>

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
                className={`font-body-sm text-body-sm truncate max-w-[120px] ${
                  isOverdue ? "text-tertiary" : "text-on-surface-variant"
                }`}
                title={expense.metodo}
              >
                {expense.metodo}
              </span>

              <div className="flex items-center gap-1.5">
                {/* Google Calendar export options */}
                <button
                  className="w-8 h-8 rounded-lg bg-surface-container hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                  title="Opciones de exportación a Google Calendar"
                  type="button"
                  onClick={() => onOpenCalendarExport(expense)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    event
                  </span>
                </button>

                {/* Botón editar */}
                <button
                  className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                  title="Editar este gasto"
                  type="button"
                  onClick={() => onEditExpense(expense)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                </button>

                {/* Toggle status */}
                <button
                  onClick={() => onToggleStatus(expense)}
                  className={`px-3 py-1 rounded-lg font-label-md text-label-md transition-colors ${
                    isPaid
                      ? "bg-surface-container text-on-surface hover:bg-surface-container-high"
                      : isOverdue
                      ? "bg-tertiary-container/30 text-tertiary hover:bg-tertiary-container/40"
                      : "bg-surface-container hover:bg-secondary/20 hover:text-secondary text-on-surface"
                  }`}
                  type="button"
                >
                  {isPaid ? "Hecho" : isOverdue ? "Pagar" : "Marcar"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
