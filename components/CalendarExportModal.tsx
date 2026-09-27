"use client";

import React, { useState } from "react";
import { Expense, getEvaluatedStatus } from "@/types/expense";

interface CalendarExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleExpense?: Expense | null;
  selectedExpenses: Expense[];
  allMonthExpenses: Expense[];
  currentPeriodLabel: string;
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  isOpen,
  onClose,
  singleExpense,
  selectedExpenses,
  allMonthExpenses,
  currentPeriodLabel,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string>("");

  if (!isOpen) return null;

  const buildCalendarUrl = (expense: Expense) => {
    const [y, m] = expense.mes_ano.split("-");
    const diaNum = Number(expense.dia) || 1;
    const dayStr = String(diaNum).padStart(2, "0");
    const nextDayStr = String(Math.min(31, diaNum + 1)).padStart(2, "0");

    const dateFormatted = `${y}${m}${dayStr}`;
    const endDateFormatted = `${y}${m}${nextDayStr}`;

    const details = `Monto: $${Number(expense.monto).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
    })} MXN\nCategoría: ${expense.categoria}\nMétodo: ${expense.metodo}${
      expense.subtitulo ? `\nDetalle: ${expense.subtitulo}` : ""
    }\n\nOrganizado con Control de Gastos Familiares`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `Pago: ${expense.concepto}`
    )}&details=${encodeURIComponent(details)}&dates=${dateFormatted}/${endDateFormatted}`;
  };

  const handleOpenGoogleCalendarSingle = (expense: Expense) => {
    window.open(buildCalendarUrl(expense), "_blank");
    onClose();
  };

  const handleOpenGoogleCalendarBatch = (expensesList: Expense[]) => {
    if (expensesList.length === 0) return;
    // Abrir las URLs (máximo 5 tabs para evitar bloqueadores de popups)
    expensesList.slice(0, 5).forEach((exp) => {
      window.open(buildCalendarUrl(exp), "_blank");
    });
    if (expensesList.length > 5) {
      // Y descargar el archivo .ics completo
      handleDownloadICS(expensesList, `gastos-seleccionados-${Date.now()}`);
    } else {
      onClose();
    }
  };

  const handleDownloadICS = (expensesList: Expense[], filenamePrefix: string) => {
    if (expensesList.length === 0) return;

    let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Control de Gastos Familiares//MX\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n";

    expensesList.forEach((exp) => {
      const [y, m] = exp.mes_ano.split("-");
      const diaNum = Number(exp.dia) || 1;
      const dayStr = String(diaNum).padStart(2, "0");
      const nextDayStr = String(Math.min(31, diaNum + 1)).padStart(2, "0");
      const dateFormatted = `${y}${m}${dayStr}`;
      const endDateFormatted = `${y}${m}${nextDayStr}`;

      const desc = `Monto: $${Number(exp.monto).toFixed(2)} MXN | Categoria: ${exp.categoria} | Metodo: ${exp.metodo}${exp.subtitulo ? ` | Detalle: ${exp.subtitulo}` : ""}`;

      icsContent += "BEGIN:VEVENT\r\n";
      icsContent += `UID:gasto-${exp.id || Date.now()}@gastosfamiliares.app\r\n`;
      icsContent += `DTSTAMP:${dateFormatted}T000000Z\r\n`;
      icsContent += `DTSTART;VALUE=DATE:${dateFormatted}\r\n`;
      icsContent += `DTEND;VALUE=DATE:${endDateFormatted}\r\n`;
      icsContent += `SUMMARY:Pago: ${exp.concepto}\r\n`;
      icsContent += `DESCRIPTION:${desc}\r\n`;
      icsContent += "STATUS:CONFIRMED\r\n";
      icsContent += "END:VEVENT\r\n";
    });

    icsContent += "END:VCALENDAR\r\n";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${filenamePrefix}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess("¡Archivo de calendario (.ics) descargado! Puedes importarlo en Google Calendar.");
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const pendingExpenses = allMonthExpenses.filter(
    (e) => getEvaluatedStatus(e) !== "Hecho"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-space-lg border-b border-outline-variant/20 flex items-center justify-between bg-surface-container/50">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[20px]">
                event
              </span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Exportar a Google Calendar
              </h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Programa recordatorios automáticos de tus fechas de pago
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-space-lg space-y-4">
          {downloadSuccess && (
            <div className="p-3 rounded-lg bg-secondary/15 text-secondary text-body-sm flex items-center gap-2 border border-secondary/30">
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Opción 1: Exportar este gasto individual (si se invocó desde fila/tarjeta) */}
          {singleExpense && (
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-primary transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    event_upcoming
                  </span>
                  <span className="font-semibold text-on-surface text-body-md">
                    a) Exportar este gasto individual
                  </span>
                </div>
                <span className="font-label-sm text-label-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                  Día {singleExpense.dia}
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant mb-3">
                {singleExpense.concepto} • ${Number(singleExpense.monto).toFixed(2)} MXN
              </p>
              <button
                type="button"
                onClick={() => handleOpenGoogleCalendarSingle(singleExpense)}
                className="w-full py-2 px-3 rounded-lg bg-primary hover:bg-primary-fixed-dim text-on-primary font-semibold text-body-sm transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">
                  open_in_new
                </span>
                Abrir en Google Calendar
              </button>
            </div>
          )}

          {/* Opción 2: Exportar gastos seleccionados */}
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-primary transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  checklist
                </span>
                <span className="font-semibold text-on-surface text-body-md">
                  b) Exportar gastos seleccionados
                </span>
              </div>
              <span className="font-label-sm text-label-sm bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full font-bold">
                {selectedExpenses.length} seleccionados
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-3">
              {selectedExpenses.length > 0
                ? `Exporta los ${selectedExpenses.length} gastos que marcaste con casilla en la tabla.`
                : "Marca casillas en la tabla principal para habilitar esta exportación por lote."}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={selectedExpenses.length === 0}
                onClick={() => handleOpenGoogleCalendarBatch(selectedExpenses)}
                className="flex-1 py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-body-sm transition-all flex items-center justify-center gap-1.5 border border-outline-variant/30 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">
                  tab
                </span>
                Abrir Pestañas
              </button>
              <button
                type="button"
                disabled={selectedExpenses.length === 0}
                onClick={() =>
                  handleDownloadICS(
                    selectedExpenses,
                    `gastos-seleccionados-${selectedExpenses.length}`
                  )
                }
                className="flex-1 py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-semibold text-body-sm transition-all flex items-center justify-center gap-1.5 border border-outline-variant/30 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Descargar .ICS
              </button>
            </div>
          </div>

          {/* Opción 3: Exportar todos los gastos del mes */}
          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 hover:border-primary transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed text-[20px]">
                  calendar_month
                </span>
                <span className="font-semibold text-on-surface text-body-md">
                  c) Exportar todos los gastos de {currentPeriodLabel}
                </span>
              </div>
              <span className="font-label-sm text-label-sm bg-primary-container/20 text-primary-fixed px-2.5 py-0.5 rounded-full font-bold">
                {allMonthExpenses.length} en total
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-3">
              Genera un calendario unificado con todos los vencimientos del mes ({pendingExpenses.length} pendientes por pagar).
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  handleDownloadICS(
                    pendingExpenses.length > 0 ? pendingExpenses : allMonthExpenses,
                    `calendario-gastos-${currentPeriodLabel.toLowerCase().replace(/\s+/g, "-")}`
                  )
                }
                className="w-full py-2.5 px-3 rounded-lg bg-primary hover:bg-primary-fixed-dim text-on-primary font-semibold text-body-sm transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                Descargar Calendario Unificado (.ics)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container/40 border-t border-outline-variant/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-space-lg py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-body-md text-body-md transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
