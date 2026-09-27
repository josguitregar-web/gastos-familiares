"use client";

import React from "react";
import { Expense, getEvaluatedStatus } from "@/types/expense";

interface HealthBannerProps {
  expenses: Expense[];
  referenceDate?: Date;
}

export const HealthBanner: React.FC<HealthBannerProps> = ({
  expenses,
  referenceDate = new Date(),
}) => {
  const total = expenses.reduce((acc, curr) => acc + Number(curr.monto), 0);

  const pagados = expenses.filter(
    (e) => getEvaluatedStatus(e, referenceDate) === "Hecho"
  );
  const pendientes = expenses.filter(
    (e) => getEvaluatedStatus(e, referenceDate) === "Pendiente"
  );
  const vencidos = expenses.filter(
    (e) => getEvaluatedStatus(e, referenceDate) === "Vencido"
  );

  const sumPagado = pagados.reduce((acc, curr) => acc + Number(curr.monto), 0);
  const sumPendiente = pendientes.reduce((acc, curr) => acc + Number(curr.monto), 0);
  const sumVencido = vencidos.reduce((acc, curr) => acc + Number(curr.monto), 0);

  const pctPagado = total > 0 ? (sumPagado / total) * 100 : 0;
  const pctPendiente = total > 0 ? (sumPendiente / total) * 100 : 0;
  const pctVencido = total > 0 ? (sumVencido / total) * 100 : 0;

  const formatMoney = (val: number) => {
    return `$${val.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="bg-surface-container-low rounded-xl p-space-lg mb-space-lg shadow-md flex flex-col md:flex-row items-center gap-space-lg justify-between">
      <div className="flex items-center gap-space-md w-full md:w-auto">
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[28px]">
            donut_large
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Salud Financiera del Mes
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {pctPagado.toFixed(1)}% Pagado • {pctPendiente.toFixed(1)}% En espera •{" "}
            {pctVencido.toFixed(1)}% Vencido
          </span>
        </div>
      </div>

      {/* Segmented Bar Visualization */}
      <div className="w-full md:max-w-md flex flex-col gap-1.5">
        <div className="h-3 w-full rounded-full bg-surface-container-highest flex overflow-hidden">
          <div
            className="bg-secondary h-full transition-all duration-700"
            style={{ width: `${pctPagado}%` }}
            title={`Pagado: ${pctPagado.toFixed(1)}%`}
          ></div>
          <div
            className="bg-primary h-full transition-all duration-700"
            style={{ width: `${pctPendiente}%` }}
            title={`Pendiente: ${pctPendiente.toFixed(1)}%`}
          ></div>
          <div
            className="bg-tertiary-container h-full transition-all duration-700"
            style={{ width: `${pctVencido}%` }}
            title={`Vencido: ${pctVencido.toFixed(1)}%`}
          ></div>
        </div>
        <div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>{formatMoney(sumPagado)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>{formatMoney(sumPendiente)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tertiary-container"></span>
            <span>{formatMoney(sumVencido)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
