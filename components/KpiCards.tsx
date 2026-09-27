"use client";

import React from "react";
import { Expense, getEvaluatedStatus } from "@/types/expense";

interface KpiCardsProps {
  expenses: Expense[];
  referenceDate?: Date;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  expenses,
  referenceDate = new Date(),
}) => {
  // Cálculos dinámicos reales basados en los gastos actuales
  const totalPresupuesto = expenses.reduce((acc, curr) => acc + Number(curr.monto), 0);

  const pagados = expenses.filter(
    (e) => getEvaluatedStatus(e, referenceDate) === "Hecho"
  );
  const pendientes = expenses.filter(
    (e) => getEvaluatedStatus(e, referenceDate) === "Pendiente"
  );
  const vencidos = expenses.filter(
    (e) => getEvaluatedStatus(e, referenceDate) === "Vencido"
  );

  const totalPagado = pagados.reduce((acc, curr) => acc + Number(curr.monto), 0);
  const totalPendiente = pendientes.reduce((acc, curr) => acc + Number(curr.monto), 0);
  const totalVencido = vencidos.reduce((acc, curr) => acc + Number(curr.monto), 0);

  const percentPagado =
    totalPresupuesto > 0 ? (totalPagado / totalPresupuesto) * 100 : 0;

  // Próximo vencimiento pendiente
  const currentDay = referenceDate.getDate();
  const proximoPendiente = pendientes
    .filter((e) => e.dia >= currentDay)
    .sort((a, b) => a.dia - b.dia)[0];

  const formatCurrency = (val: number) => {
    return val.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const splitCurrency = (val: number) => {
    const formatted = formatCurrency(val);
    const [entero, decimales] = formatted.split(".");
    return { entero, decimales: decimales ? `.${decimales}` : ".00" };
  };

  const cPresupuesto = splitCurrency(totalPresupuesto);
  const cPagado = splitCurrency(totalPagado);
  const cPendiente = splitCurrency(totalPendiente);
  const cVencido = splitCurrency(totalVencido);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter mb-space-xl">
      {/* KPI 1: Presupuesto Total */}
      <div className="relative overflow-hidden bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-lg">
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary/10 rounded-full blur-xl pointer-events-none"></div>
        <div>
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Total Presupuesto
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">
                account_balance
              </span>
            </div>
          </div>
          <div className="font-metric-xl text-metric-xl font-bold text-on-surface tracking-tight">
            ${cPresupuesto.entero}
            <span className="font-body-md text-body-md font-normal text-on-surface-variant">
              {cPresupuesto.decimales} MXN
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Presupuesto mensual unificado
          </p>
        </div>
        <div className="mt-space-md pt-space-sm">
          <div className="flex justify-between items-center font-label-sm text-label-sm text-on-surface-variant mb-1">
            <span>Consumo pagado</span>
            <span className="font-semibold text-primary">
              {percentPagado.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-container transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, percentPagado))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* KPI 2: Total Pagado */}
      <div className="relative overflow-hidden bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-lg">
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-secondary/15 rounded-full blur-xl pointer-events-none"></div>
        <div>
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Total Pagado
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shadow-sm">
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
            </div>
          </div>
          <div className="font-metric-xl text-metric-xl font-bold text-secondary tracking-tight">
            ${cPagado.entero}
            <span className="font-body-md text-body-md font-normal text-secondary/80">
              {cPagado.decimales} MXN
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 mt-2 bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            {pagados.length} {pagados.length === 1 ? "pago completado" : "pagos completados"}
          </div>
        </div>
        <div className="mt-space-md pt-space-sm flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
          <span>{percentPagado.toFixed(1)}% del plan liquidado</span>
          <span className="material-symbols-outlined text-secondary text-[18px]">
            trending_up
          </span>
        </div>
      </div>

      {/* KPI 3: Pendiente por Pagar */}
      <div className="relative overflow-hidden bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-lg">
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-primary-fixed/10 rounded-full blur-xl pointer-events-none"></div>
        <div>
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Pendiente por Pagar
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary-fixed-dim shadow-sm">
              <span className="material-symbols-outlined text-[18px]">
                hourglass_top
              </span>
            </div>
          </div>
          <div className="font-metric-xl text-metric-xl font-bold text-primary-fixed tracking-tight">
            ${cPendiente.entero}
            <span className="font-body-md text-body-md font-normal text-primary-fixed/70">
              {cPendiente.decimales} MXN
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 mt-2 bg-surface-container-high text-primary-fixed-dim px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            {pendientes.length} {pendientes.length === 1 ? "por vencer" : "por vencer en el mes"}
          </div>
        </div>
        <div className="mt-space-md pt-space-sm flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
          <span>
            {proximoPendiente
              ? `Próx. vencimiento: Día ${proximoPendiente.dia}`
              : "Sin pagos pendientes"}
          </span>
          <span className="material-symbols-outlined text-primary-fixed text-[18px]">
            schedule
          </span>
        </div>
      </div>

      {/* KPI 4: Pagos Vencidos */}
      <div className="relative overflow-hidden bg-surface-container-low rounded-xl p-space-lg flex flex-col justify-between shadow-lg">
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-tertiary-container/15 rounded-full blur-xl pointer-events-none"></div>
        <div>
          <div className="flex items-center justify-between mb-space-sm">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Pagos Vencidos
            </span>
            <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary shadow-sm">
              <span className="material-symbols-outlined text-[18px]">
                warning
              </span>
            </div>
          </div>
          <div className="font-metric-xl text-metric-xl font-bold text-tertiary tracking-tight">
            ${cVencido.entero}
            <span className="font-body-md text-body-md font-normal text-tertiary/70">
              {cVencido.decimales} MXN
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 mt-2 bg-tertiary-container/20 text-tertiary px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
            {vencidos.length} {vencidos.length === 1 ? "factura vencida" : "facturas vencidas"}
          </div>
        </div>
        <div className="mt-space-md pt-space-sm flex items-center justify-between text-tertiary font-body-sm text-body-sm">
          <span className="font-medium">
            {vencidos.length > 0 ? "Requiere atención inmediata" : "Al corriente"}
          </span>
          <span className="material-symbols-outlined text-[18px]">
            {vencidos.length > 0 ? "priority_high" : "verified"}
          </span>
        </div>
      </div>
    </div>
  );
};
