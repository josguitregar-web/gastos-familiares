"use client";

import React from "react";
import { Expense, getEvaluatedStatus, ExpenseCategory } from "@/types/expense";

interface ExpenseTableProps {
  expenses: Expense[];
  onToggleStatus: (expense: Expense) => void;
  onSyncCalendar: (expense: Expense) => void;
  onEditExpense?: (expense: Expense) => void;
  referenceDate?: Date;
  monthName?: string;
  year?: number;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onToggleStatus,
  onSyncCalendar,
  onEditExpense,
  referenceDate = new Date(),
  monthName = "Sep",
  year = 2026,
}) => {
  const getCategoryIcon = (categoria: ExpenseCategory, concepto: string) => {
    const c = concepto.toLowerCase();
    if (c.includes("luz") || c.includes("cfe") || c.includes("gas")) return "bolt";
    if (c.includes("telmex") || c.includes("internet") || c.includes("izzi")) return "router";
    if (c.includes("agua")) return "water_drop";
    if (c.includes("auto") || c.includes("seguro")) return "directions_car";
    if (c.includes("renta") || c.includes("depto") || c.includes("mantenimiento")) return "home";
    if (c.includes("colegiatura") || c.includes("escuela")) return "school";

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
        return "receipt_long";
    }
  };

  const getMethodIcon = (metodo: string) => {
    const m = (metodo || "").toLowerCase();
    if (m.includes("spei") || m.includes("transferencia")) return "account_balance";
    if (m.includes("app") || m.includes("qr")) return "qr_code_scanner";
    if (m.includes("efectivo")) return "payments";
    return "credit_card";
  };

  const totalAcumulado = expenses.reduce((acc, curr) => acc + Number(curr.monto), 0);

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-xl transition-all" id="tableViewContainer">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
              <th className="py-space-md px-space-lg w-28" scope="col">
                Fecha
              </th>
              <th className="py-space-md px-space-lg" scope="col">
                Concepto &amp; Categoría
              </th>
              <th className="py-space-md px-space-lg" scope="col">
                Método &amp; Cargo
              </th>
              <th className="py-space-md px-space-lg text-right" scope="col">
                Monto
              </th>
              <th className="py-space-md px-space-lg text-center w-36" scope="col">
                Estado
              </th>
              <th className="py-space-md px-space-lg text-right w-44" scope="col">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md divide-y divide-surface-container" id="transactionTableBody">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-on-surface-variant font-body-md">
                  No se encontraron gastos que coincidan con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => {
                const status = getEvaluatedStatus(expense, referenceDate);
                const diaStr = String(expense.dia).padStart(2, "0");
                const iconName = getCategoryIcon(expense.categoria, expense.concepto);
                const methodIcon = getMethodIcon(expense.metodo);
                const isPaid = status === "Hecho";
                const isOverdue = status === "Vencido";

                return (
                  <tr
                    key={expense.id}
                    className="ledger-row hover:bg-surface-container transition-colors group"
                    data-category={expense.categoria}
                    data-status={status}
                  >
                    {/* Fecha */}
                    <td
                      className={`py-space-md px-space-lg font-semibold whitespace-nowrap ${
                        isOverdue ? "text-tertiary" : "text-on-surface"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span
                          className={`font-headline-sm text-headline-sm leading-tight ${
                            isOverdue
                              ? "text-tertiary"
                              : !isPaid
                              ? "text-primary-fixed"
                              : "text-on-surface"
                          }`}
                        >
                          {diaStr}
                        </span>
                        <span
                          className={`font-label-sm text-label-sm uppercase ${
                            isOverdue ? "text-tertiary" : "text-on-surface-variant"
                          }`}
                        >
                          {monthName} {year}
                        </span>
                      </div>
                    </td>

                    {/* Concepto & Categoría */}
                    <td className="py-space-md px-space-lg">
                      <div className="flex items-center gap-space-sm">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                            isOverdue
                              ? "bg-tertiary-container/20 text-tertiary"
                              : "bg-surface-container-high text-primary"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {iconName}
                          </span>
                        </div>
                        <div>
                          <div
                            className={`font-semibold flex items-center gap-1.5 ${
                              isOverdue ? "text-tertiary" : "text-on-surface"
                            }`}
                          >
                            {expense.concepto}
                            {isOverdue && (
                              <span className="material-symbols-outlined text-[16px] text-tertiary">
                                priority_high
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                                isOverdue
                                  ? "bg-tertiary-container/30 text-tertiary"
                                  : "bg-surface-container-highest text-on-surface-variant"
                              }`}
                            >
                              {expense.categoria}
                            </span>
                            {expense.subtitulo && (
                              <span className="text-on-surface-variant text-[12px]">
                                • {expense.subtitulo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Método & Cargo */}
                    <td className="py-space-md px-space-lg text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-on-surface">
                          {methodIcon}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface">
                          {expense.metodo}
                        </span>
                      </div>
                    </td>

                    {/* Monto */}
                    <td
                      className={`py-space-md px-space-lg text-right font-metric-md text-metric-md font-semibold font-mono ${
                        isOverdue
                          ? "text-tertiary"
                          : !isPaid
                          ? "text-primary-fixed"
                          : "text-on-surface"
                      }`}
                    >
                      ${Number(expense.monto).toLocaleString("es-MX", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Estado Badge */}
                    <td className="py-space-md px-space-lg text-center">
                      {isPaid ? (
                        <span className="status-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md font-semibold bg-secondary/15 text-secondary shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          Hecho
                        </span>
                      ) : isOverdue ? (
                        <span className="status-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md font-semibold bg-tertiary-container/25 text-tertiary shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                          Vencido
                        </span>
                      ) : (
                        <span className="status-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md text-label-md font-semibold bg-primary-container/20 text-primary-fixed shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                          Pendiente
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-space-md px-space-lg text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className={`btn-toggle-status w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center transition-colors ${
                            isPaid
                              ? "hover:bg-secondary/20 text-secondary"
                              : "hover:bg-secondary/20 text-on-surface-variant hover:text-secondary"
                          }`}
                          title={
                            isPaid
                              ? "Marcar como Pendiente"
                              : "Marcar como Hecho (Liquidado)"
                          }
                          type="button"
                          onClick={() => onToggleStatus(expense)}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isPaid ? "check" : "radio_button_unchecked"}
                          </span>
                        </button>

                        <button
                          className="btn-sync-cal w-8 h-8 rounded-lg bg-surface-container hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                          title="Sincronizar a Google Calendar"
                          type="button"
                          onClick={() => onSyncCalendar(expense)}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            event
                          </span>
                        </button>

                        <button
                          className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                          title="Editar Gasto"
                          type="button"
                          onClick={() => onEditExpense && onEditExpense(expense)}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="bg-surface-container p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <span>
            Mostrando <strong>{expenses.length} gastos</strong> registrados
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Moneda: Pesos Mexicanos (MXN)</span>
        </div>
        <div className="flex items-center gap-space-lg">
          <div className="text-right">
            <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">
              Total Acumulado
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              $
              {totalAcumulado.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              MXN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
