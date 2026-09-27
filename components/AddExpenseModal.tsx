"use client";

import React, { useState, useEffect } from "react";
import { Expense, ExpenseCategory, BaseExpenseStatus } from "@/types/expense";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (
    expenseData: Omit<Expense, "id" | "created_at" | "updated_at">,
    expenseId?: string
  ) => Promise<void>;
  currentMonthYear: string; // YYYY-MM
  expenseToEdit?: Expense | null;
}

const AVAILABLE_ICONS = [
  { name: "credit_card", label: "Tarjeta" },
  { name: "receipt", label: "Recibo" },
  { name: "directions_car", label: "Auto" },
  { name: "home", label: "Hogar" },
  { name: "water_drop", label: "Agua" },
  { name: "bolt", label: "Luz/Gas" },
  { name: "shopping_cart", label: "Super/Mercado" },
  { name: "health_and_safety", label: "Salud" },
  { name: "wifi", label: "Internet" },
  { name: "payments", label: "Efectivo" },
  { name: "school", label: "Educación" },
  { name: "account_balance", label: "Banco" },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  currentMonthYear,
  expenseToEdit,
}) => {
  const [dia, setDia] = useState<number>(1);
  const [concepto, setConcepto] = useState<string>("");
  const [categoria, setCategoria] = useState<ExpenseCategory>("Servicios");
  const [subtitulo, setSubtitulo] = useState<string>("");
  const [metodo, setMetodo] = useState<string>("Banca Móvil");
  const [monto, setMonto] = useState<string>("");
  const [estado, setEstado] = useState<BaseExpenseStatus>("Pendiente");
  const [icono, setIcono] = useState<string>("receipt");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (expenseToEdit) {
      setDia(expenseToEdit.dia || 1);
      setConcepto(expenseToEdit.concepto || "");
      setCategoria(expenseToEdit.categoria || "Servicios");
      setSubtitulo(expenseToEdit.subtitulo || "");
      setMetodo(expenseToEdit.metodo || "Banca Móvil");
      setMonto(expenseToEdit.monto ? String(expenseToEdit.monto) : "");
      setEstado(expenseToEdit.estado || "Pendiente");
      setIcono(expenseToEdit.icono || "receipt");
    } else {
      setDia(1);
      setConcepto("");
      setCategoria("Servicios");
      setSubtitulo("");
      setMetodo("Banca Móvil");
      setMonto("");
      setEstado("Pendiente");
      setIcono("receipt");
    }
    setErrorMsg("");
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedConcepto = concepto.trim();
    if (!trimmedConcepto) {
      setErrorMsg("Por favor ingresa el concepto del gasto.");
      return;
    }

    const parsedMonto = parseFloat(monto);
    if (isNaN(parsedMonto) || parsedMonto <= 0) {
      setErrorMsg("Por favor ingresa un monto numérico válido mayor a 0 (ej. 1200.00).");
      return;
    }

    const parsedDia = parseInt(String(dia), 10);
    if (isNaN(parsedDia) || parsedDia < 1 || parsedDia > 31) {
      setErrorMsg("El día de pago debe estar entre 1 y 31.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveExpense(
        {
          dia: parsedDia,
          concepto: trimmedConcepto,
          categoria,
          subtitulo: subtitulo.trim() || undefined,
          metodo: metodo.trim() || "Banca Móvil",
          monto: parsedMonto,
          estado,
          mes_ano: expenseToEdit ? expenseToEdit.mes_ano : currentMonthYear,
          icono: icono || undefined,
        },
        expenseToEdit?.id
      );

      onClose();
    } catch (err: any) {
      console.error("Error al guardar gasto en modal:", err);
      setErrorMsg(err.message || "Error al conectar con la base de datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="p-space-lg border-b border-outline-variant/20 flex items-center justify-between bg-surface-container/50">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                {expenseToEdit ? "edit" : "add_circle"}
              </span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                {expenseToEdit ? "Editar Gasto Familiar" : "Registrar Gasto Familiar"}
              </h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {expenseToEdit
                  ? "Actualiza los detalles y sincroniza al instante"
                  : `Se agregará al periodo ${currentMonthYear} en tiempo real`}
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-space-lg space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-tertiary-container/20 text-tertiary text-body-sm flex items-center gap-2 border border-tertiary-container/30">
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Concepto del Gasto *
            </label>
            <input
              type="text"
              placeholder="Ej. Tarjeta Banamex, Seguro de Auto, Izzi..."
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full bg-surface-container rounded-lg px-space-md py-2.5 text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/50 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          {/* Selector visual de íconos */}
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1.5">
              Ícono Visual de Pago
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-6 gap-1.5 p-2 bg-surface-container rounded-xl border border-outline-variant/20">
              {AVAILABLE_ICONS.map((ic) => {
                const isSelected = icono === ic.name;
                return (
                  <button
                    key={ic.name}
                    type="button"
                    onClick={() => setIcono(ic.name)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                      isSelected
                        ? "bg-primary text-on-primary shadow-md scale-105"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    }`}
                    title={ic.label}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {ic.name}
                    </span>
                    <span className="text-[10px] mt-0.5 truncate max-w-full font-medium">
                      {ic.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Categoría *
              </label>
              <select
                value={categoria}
                onChange={(e) =>
                  setCategoria(e.target.value as ExpenseCategory)
                }
                className="w-full bg-surface-container rounded-lg px-space-md py-2.5 text-on-surface font-body-md text-body-md border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="Servicios">Servicios</option>
                <option value="Vivienda">Vivienda</option>
                <option value="Tarjetas">Tarjetas</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
              </select>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Día de Pago (1 - 31) *
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dia}
                onChange={(e) => setDia(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-surface-container rounded-lg px-space-md py-2.5 text-on-surface font-body-md text-body-md border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Monto (MXN) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full bg-surface-container rounded-lg pl-7 pr-space-md py-2.5 text-on-surface font-mono text-body-md border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
                Método de Pago
              </label>
              <input
                type="text"
                placeholder="Ej. Banca Móvil, SPEI, Efectivo"
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                className="w-full bg-surface-container rounded-lg px-space-md py-2.5 text-on-surface font-body-md text-body-md border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Detalle / Referencia (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Póliza semestral, Inmobiliaria Central..."
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              className="w-full bg-surface-container rounded-lg px-space-md py-2.5 text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/50 border border-outline-variant/20 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">
              Estado de Pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEstado("Pendiente")}
                className={`py-2 px-3 rounded-lg border text-body-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  estado === "Pendiente"
                    ? "bg-primary-container/20 border-primary-container text-primary-fixed"
                    : "bg-surface-container border-outline-variant/20 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  schedule
                </span>
                Pendiente
              </button>

              <button
                type="button"
                onClick={() => setEstado("Hecho")}
                className={`py-2 px-3 rounded-lg border text-body-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  estado === "Hecho"
                    ? "bg-secondary/20 border-secondary text-secondary"
                    : "bg-surface-container border-outline-variant/20 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  check_circle
                </span>
                Hecho (Pagado)
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 flex items-center justify-end gap-space-sm border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-space-lg py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-body-md text-body-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-space-lg py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-fixed-dim font-body-md text-body-md font-semibold transition-all shadow-md disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                save
              </span>
              <span>
                {isSubmitting
                  ? "Guardando..."
                  : expenseToEdit
                  ? "Actualizar Gasto"
                  : "Guardar Gasto"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
