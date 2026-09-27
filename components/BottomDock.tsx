"use client";

import React from "react";
import { Expense, getEvaluatedStatus } from "@/types/expense";

interface BottomDockProps {
  expenses: Expense[];
  onOpenAddExpense: () => void;
  onSyncAllCalendar: () => void;
  onNextMonth: () => void;
  referenceDate?: Date;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  expenses,
  onOpenAddExpense,
  onSyncAllCalendar,
  onNextMonth,
  referenceDate = new Date(),
}) => {
  const pendientes = expenses.filter(
    (e) => getEvaluatedStatus(e, referenceDate) === "Pendiente"
  );
  const vencidos = expenses.filter(
    (e) => getEvaluatedStatus(e, referenceDate) === "Vencido"
  );

  const totalPendiente = pendientes.reduce((acc, curr) => acc + Number(curr.monto), 0);

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 px-margin-mobile flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-4xl bg-surface-container-high/90 backdrop-blur-xl rounded-2xl p-space-sm sm:px-space-lg sm:py-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-space-sm sm:gap-space-md border border-outline-variant/30">
        {/* Left side summary snippet */}
        <div className="flex items-center gap-space-md w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[20px]">
              account_balance_wallet
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Balance por Liquidar
            </span>
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Restante: $
                {totalPendiente.toLocaleString("es-MX", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              {vencidos.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-tertiary-container/30 text-tertiary font-bold">
                  {vencidos.length} {vencidos.length === 1 ? "Vencido" : "Vencidos"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons inside Dock */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-space-md py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed-dim font-body-md text-body-md font-semibold transition-all shadow-md active:scale-95"
            type="button"
            onClick={onOpenAddExpense}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Agregar Gasto</span>
          </button>

          <button
            className="flex items-center justify-center gap-1.5 px-space-md py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface transition-colors shadow-sm active:scale-95"
            title="Sincronizar todos los vencimientos con Google Calendar"
            type="button"
            onClick={onSyncAllCalendar}
          >
            <span className="material-symbols-outlined text-primary text-[18px]">
              save_as
            </span>
            <span className="hidden md:inline font-body-md text-body-md">
              Google Calendar
            </span>
          </button>

          <button
            className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-colors shadow-sm active:scale-95"
            title="Siguiente Periodo"
            type="button"
            onClick={onNextMonth}
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
