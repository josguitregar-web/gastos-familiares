"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Header, UserProfile } from "@/components/Header";
import { KpiCards } from "@/components/KpiCards";
import { HealthBanner } from "@/components/HealthBanner";
import { FilterControls } from "@/components/FilterControls";
import { ExpenseTable } from "@/components/ExpenseTable";
import { ExpenseGrid } from "@/components/ExpenseGrid";
import { BottomDock } from "@/components/BottomDock";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { CalendarExportModal } from "@/components/CalendarExportModal";
import { Toast, ToastData } from "@/components/Toast";
import { Expense, getEvaluatedStatus } from "@/types/expense";
import {
  getGastos,
  toggleEstadoGasto,
  addGasto,
  updateGasto,
  isSupabaseConfigured,
  supabase,
} from "@/lib/supabase";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const AVAILABLE_YEARS = [2025, 2026, 2027];

const DEFAULT_USER: UserProfile = {
  id: "user-josue",
  name: "Josué Treviño",
  role: "Josué",
  email: "josue@familia.mx",
};

export default function DashboardPage() {
  // Periodo seleccionado (Por defecto Septiembre 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 1-12 (9 = Septiembre)
  const [isMonthPopoverOpen, setIsMonthPopoverOpen] = useState<boolean>(false);
  const monthPopoverRef = useRef<HTMLDivElement>(null);

  // Modo de visualización
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filtros interactivos
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Selección de filas para exportación por lote
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Datos y estado de carga
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modales
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [calendarTargetExpense, setCalendarTargetExpense] = useState<Expense | null>(null);

  const [toast, setToast] = useState<ToastData | null>(null);

  // Perfil de Usuario Activo
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEFAULT_USER);

  // Tema: Oscuro / Claro
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Presencia Realtime ("Compartido con Papá")
  const [isCompanionOnline, setIsCompanionOnline] = useState<boolean>(false);
  const [companionStatusText, setCompanionStatusText] = useState<string>(
    "Sincronizado con Supabase Realtime"
  );

  const currentPeriodKey = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
  const monthName = MONTH_NAMES[selectedMonth - 1];
  const formattedPeriodLabel = `${monthName} ${selectedYear}`;

  // Fecha de referencia para evaluación de "Vencido"
  const referenceDate = useMemo(() => new Date(2026, 8, 27), []); // 27 Sep 2026

  // 1. Inicializar Tema y Perfil desde LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme_mode") as "dark" | "light" | null;
      const initialTheme = savedTheme === "light" ? "light" : "dark";
      setTheme(initialTheme);
      if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      const savedUser = localStorage.getItem("household_active_user");
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Error parsing saved user", e);
        }
      }
    }
  }, []);

  // Manejar cambio de tema
  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme_mode", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    setToast({
      title: "Tema Actualizado",
      message: `Modo ${nextTheme === "dark" ? "Oscuro" : "Claro"} activado`,
      type: "info",
    });
  };

  // Manejar cambio de perfil de usuario
  const handleSwitchUser = (newUser: UserProfile) => {
    setCurrentUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("household_active_user", JSON.stringify(newUser));
    }
    setToast({
      title: "Perfil Cambiado",
      message: `Sesión activa como ${newUser.name} (${newUser.role})`,
      type: "success",
    });
  };

  // 2. Consulta dinámica a Supabase al cambiar de mes
  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getGastos(currentPeriodKey);
      setExpenses(data);
    } catch (err: any) {
      console.error("Error al cargar gastos:", err);
      setToast({
        title: "Error de Conexión",
        message: err.message || "No se pudieron obtener los gastos del mes seleccionado.",
        type: "warning",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPeriodKey]);

  useEffect(() => {
    fetchExpenses();
    setSelectedIds([]); // Reset selection on month change
  }, [fetchExpenses]);

  // Cerrar popover de mes al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        monthPopoverRef.current &&
        !monthPopoverRef.current.contains(event.target as Node)
      ) {
        setIsMonthPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 3. Suscripción a Cambios en Base de Datos y Supabase Presence
  useEffect(() => {
    let presenceChannel: any = null;

    if (isSupabaseConfigured && supabase) {
      const client = supabase;

      const dataChannel = client
        .channel(`gastos_realtime_${currentPeriodKey}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "gastos" },
          () => {
            fetchExpenses();
          }
        )
        .subscribe();

      presenceChannel = client.channel("household_presence", {
        config: {
          presence: {
            key: currentUser.id,
          },
        },
      });

      presenceChannel
        .on("presence", { event: "sync" }, () => {
          const state = presenceChannel.presenceState();
          const allPresences = Object.values(state).flat() as any[];
          const otherMembers = allPresences.filter(
            (p: any) => p.role !== currentUser.role
          );
          if (otherMembers.length > 0) {
            setIsCompanionOnline(true);
            setCompanionStatusText(
              `${otherMembers[0].name || "Papá"} en línea • Sincronización en vivo activa`
            );
          } else {
            setIsCompanionOnline(allPresences.length > 1);
            setCompanionStatusText(
              allPresences.length > 1
                ? "2 sesiones activas conectadas"
                : "Esperando conexión de Papá"
            );
          }
        })
        .subscribe(async (status: string) => {
          if (status === "SUBSCRIBED") {
            await presenceChannel.track({
              id: currentUser.id,
              name: currentUser.name,
              role: currentUser.role,
              online_at: new Date().toISOString(),
            });
          }
        });

      return () => {
        client.removeChannel(dataChannel);
        if (presenceChannel) client.removeChannel(presenceChannel);
      };
    } else {
      const channel =
        typeof window !== "undefined" && "BroadcastChannel" in window
          ? new BroadcastChannel("household_local_presence")
          : null;

      const pingPresence = () => {
        if (channel) {
          channel.postMessage({
            type: "presence_ping",
            user: currentUser,
            timestamp: Date.now(),
          });
        }
      };

      const presenceTimer = setInterval(pingPresence, 4000);
      pingPresence();

      let lastSeenOther = 0;
      const checkTimer = setInterval(() => {
        if (Date.now() - lastSeenOther > 9000) {
          setIsCompanionOnline(false);
          setCompanionStatusText("Modo Local • Esperando otra pestaña");
        }
      }, 3000);

      if (channel) {
        channel.onmessage = (event) => {
          if (event.data?.type === "presence_ping") {
            const sender = event.data.user;
            if (sender && sender.role !== currentUser.role) {
              lastSeenOther = Date.now();
              setIsCompanionOnline(true);
              setCompanionStatusText(
                `${sender.role} en línea en otra pestaña • Sincronizado`
              );
            }
          }
        };
      }

      const handleLocalUpdate = () => {
        fetchExpenses();
      };
      window.addEventListener("local_storage_gastos_updated", handleLocalUpdate);
      window.addEventListener("storage", handleLocalUpdate);

      return () => {
        clearInterval(presenceTimer);
        clearInterval(checkTimer);
        if (channel) channel.close();
        window.removeEventListener("local_storage_gastos_updated", handleLocalUpdate);
        window.removeEventListener("storage", handleLocalUpdate);
      };
    }
  }, [currentPeriodKey, currentUser, fetchExpenses]);

  // Navegación de Meses
  const handleSelectPeriod = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setIsMonthPopoverOpen(false);
    setToast({
      title: "Periodo Cambiado",
      message: `Cargando gastos de ${MONTH_NAMES[month - 1]} ${year}`,
      type: "info",
    });
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      handleSelectPeriod(selectedYear - 1, 12);
    } else {
      handleSelectPeriod(selectedYear, selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      handleSelectPeriod(selectedYear + 1, 1);
    } else {
      handleSelectPeriod(selectedYear, selectedMonth + 1);
    }
  };

  // Alternar Estado de Pago (Hecho <-> Pendiente)
  const handleToggleStatus = async (expense: Expense) => {
    const currentStatus = getEvaluatedStatus(expense, referenceDate);
    const nuevoEstado = currentStatus === "Hecho" ? "Pendiente" : "Hecho";

    try {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === expense.id ? { ...item, estado: nuevoEstado } : item
        )
      );

      await toggleEstadoGasto(expense.id, nuevoEstado);

      setToast({
        title: nuevoEstado === "Hecho" ? "Gasto Liquidado" : "Actualizado",
        message:
          nuevoEstado === "Hecho"
            ? `"${expense.concepto}" registrado como Pagado con éxito`
            : `"${expense.concepto}" marcado como Pendiente`,
        type: "success",
      });
    } catch (err: any) {
      console.error(err);
      fetchExpenses();
      setToast({
        title: "Error",
        message: err.message || "No se pudo actualizar el estado del gasto.",
        type: "warning",
      });
    }
  };

  // Manejar creación o edición de gasto
  const handleSaveExpense = async (
    expenseData: Omit<Expense, "id" | "created_at" | "updated_at">,
    expenseId?: string
  ) => {
    try {
      if (expenseId) {
        // Actualizar gasto existente
        const updated = await updateGasto(expenseId, expenseData);
        setExpenses((prev) =>
          prev.map((item) => (item.id === expenseId ? updated : item)).sort((a, b) => a.dia - b.dia)
        );
        setToast({
          title: "Gasto Actualizado",
          message: `"${expenseData.concepto}" actualizado exitosamente.`,
          type: "success",
        });
      } else {
        // Crear nuevo gasto
        const created = await addGasto(expenseData);
        setExpenses((prev) => [...prev, created].sort((a, b) => a.dia - b.dia));
        setToast({
          title: "Gasto Registrado",
          message: `"${expenseData.concepto}" agregado exitosamente a ${formattedPeriodLabel}.`,
          type: "success",
        });
      }
    } catch (error: any) {
      console.error("Error al procesar gasto en handleSaveExpense:", error);
      setToast({
        title: "Error de Guardado",
        message: error.message || "Ocurrió un error al persistir el gasto en Supabase.",
        type: "warning",
      });
      throw error;
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsModalOpen(true);
  };

  // Abrir modal de nuevo gasto
  const handleOpenNewExpense = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  // Abrir modal de exportación a Google Calendar
  const handleOpenCalendarExport = (expense?: Expense) => {
    setCalendarTargetExpense(expense || null);
    setIsCalendarModalOpen(true);
  };

  // Manejar selección de filas individuales
  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Manejar selección de todos
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredExpenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredExpenses.map((e) => e.id));
    }
  };

  // Filtrado reactivo
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const status = getEvaluatedStatus(expense, referenceDate);

      const matchesCategory =
        selectedCategory === "all" || expense.categoria === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" || status === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        expense.concepto.toLowerCase().includes(q) ||
        (expense.subtitulo && expense.subtitulo.toLowerCase().includes(q)) ||
        expense.metodo.toLowerCase().includes(q) ||
        expense.categoria.toLowerCase().includes(q);

      return matchesCategory && matchesStatus && matchesQuery;
    });
  }, [expenses, selectedCategory, selectedStatus, searchQuery, referenceDate]);

  const selectedExpensesList = useMemo(() => {
    return expenses.filter((e) => selectedIds.includes(e.id));
  }, [expenses, selectedIds]);

  return (
    <>
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header funcional */}
      <Header
        currentPeriodLabel={formattedPeriodLabel}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onSelectPeriod={handleSelectPeriod}
        onOpenAddExpense={handleOpenNewExpense}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isCompanionOnline={isCompanionOnline}
        companionStatusText={companionStatusText}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
      />

      <main className="w-full pt-20 bg-background min-h-screen">
        <div className="flex flex-col w-full">
          {/* Decorative ambient glow */}
          <div className="relative w-full max-w-7xl mx-auto px-margin-mobile lg:px-margin pb-32">
            <div className="absolute top-4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
            <div className="absolute top-32 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

            {/* Section 1: Dashboard Context Strip & Period Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md py-space-lg">
              <div className="flex flex-wrap items-center gap-space-md">
                {/* Month Navigation Pill con Dropdown Interactivo */}
                <div
                  className="relative flex items-center bg-surface-container-low rounded-xl p-1 shadow-md"
                  ref={monthPopoverRef}
                >
                  <button
                    aria-label="Mes anterior"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    id="btnPrevMonth"
                    type="button"
                    onClick={handlePrevMonth}
                    title="Ir al mes anterior"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      chevron_left
                    </span>
                  </button>

                  <button
                    className="px-space-md py-space-xs flex items-center gap-space-xs hover:bg-surface-container rounded-lg transition-colors"
                    id="btnMonthDropdown"
                    type="button"
                    onClick={() => setIsMonthPopoverOpen((prev) => !prev)}
                    title="Hacer clic para cambiar de mes y año"
                  >
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      calendar_month
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">
                      {formattedPeriodLabel}
                    </span>
                    <span
                      className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform ${
                        isMonthPopoverOpen ? "rotate-180" : ""
                      }`}
                    >
                      keyboard_arrow_down
                    </span>
                  </button>

                  <button
                    aria-label="Mes siguiente"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    id="btnNextMonth"
                    type="button"
                    onClick={handleNextMonth}
                    title="Ir al mes siguiente"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      chevron_right
                    </span>
                  </button>

                  {/* Popover Selector de Meses y Años */}
                  {isMonthPopoverOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-outline-variant/20">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                          Año
                        </span>
                        <div className="flex gap-1.5">
                          {AVAILABLE_YEARS.map((y) => (
                            <button
                              key={y}
                              onClick={() => handleSelectPeriod(y, selectedMonth)}
                              className={`px-2.5 py-1 rounded-lg text-label-sm font-semibold transition-colors ${
                                y === selectedYear
                                  ? "bg-primary text-on-primary shadow-sm"
                                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                              }`}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {MONTH_NAMES.map((m, idx) => {
                          const monthNum = idx + 1;
                          const isSelected =
                            selectedMonth === monthNum && selectedYear === selectedYear;
                          return (
                            <button
                              key={m}
                              onClick={() => handleSelectPeriod(selectedYear, monthNum)}
                              className={`py-2 px-2 rounded-xl text-body-sm transition-all text-center ${
                                isSelected
                                  ? "bg-primary-container text-on-primary-container font-bold shadow-md"
                                  : "bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-medium"
                              }`}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Indicador de Presencia Familiar Activa */}
                <div
                  className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-xl shadow-sm border border-outline-variant/20"
                  title={companionStatusText}
                >
                  <div className="flex -space-x-2 overflow-hidden">
                    <div
                      className={`inline-block h-7 w-7 rounded-full text-center flex items-center justify-center font-label-sm text-label-sm font-bold shadow-md transition-all ${
                        currentUser.role === "Josué"
                          ? "bg-primary-container text-on-primary-container ring-2 ring-primary/40"
                          : "bg-surface-container-highest text-on-surface-variant"
                      }`}
                      title="Josué"
                    >
                      YO
                    </div>
                    <div
                      className={`inline-block h-7 w-7 rounded-full text-center flex items-center justify-center font-label-sm text-label-sm font-bold shadow-md transition-all ${
                        currentUser.role === "Papá"
                          ? "bg-secondary text-on-secondary ring-2 ring-secondary/40"
                          : isCompanionOnline
                          ? "bg-secondary/20 text-secondary"
                          : "bg-surface-container-highest text-on-surface-variant"
                      }`}
                      title="Papá"
                    >
                      PA
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-md text-label-md text-on-surface font-medium">
                        {isCompanionOnline ? "Papá en línea" : "Compartido con Papá"}
                      </span>
                      <span className="relative flex h-2 w-2">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            isCompanionOnline ? "bg-secondary" : "bg-primary"
                          }`}
                        ></span>
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${
                            isCompanionOnline ? "bg-secondary" : "bg-primary"
                          }`}
                        ></span>
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-[190px]">
                      {companionStatusText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción Rápida */}
              <div className="flex items-center gap-space-sm">
                <button
                  className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors shadow-sm active:scale-95"
                  type="button"
                  onClick={() => window.print()}
                  title="Imprimir o guardar reporte PDF del mes"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    splitscreen
                  </span>
                  <span className="font-label-md text-label-md">Reporte PDF</span>
                </button>
                <button
                  className="flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-primary hover:bg-primary-fixed-dim text-on-primary font-semibold shadow-md transition-all active:scale-95"
                  type="button"
                  onClick={handleOpenNewExpense}
                  title="Registrar un nuevo gasto para este mes"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    add_circle
                  </span>
                  <span className="font-body-md text-body-md font-semibold">
                    Registrar Gasto
                  </span>
                </button>
              </div>
            </div>

            {/* Section 2: Summary KPI Metric Cards (Recálculo dinámico) */}
            <KpiCards expenses={expenses} referenceDate={referenceDate} />

            {/* Section 3: Visual Analytics Breakdown Banner (Recálculo dinámico) */}
            <HealthBanner expenses={expenses} referenceDate={referenceDate} />

            {/* Section 4: Filter Controls & View Switches */}
            <FilterControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Barra contextual si hay filas seleccionadas para lote */}
            {selectedIds.length > 0 && (
              <div className="mb-4 p-3 bg-primary-container/20 border border-primary-container/40 rounded-xl flex items-center justify-between text-body-md">
                <div className="flex items-center gap-2 text-primary-fixed font-medium">
                  <span className="material-symbols-outlined text-[20px]">
                    checklist
                  </span>
                  <span>
                    <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? "gasto seleccionado" : "gastos seleccionados"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenCalendarExport()}
                    className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-semibold text-body-sm flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      event
                    </span>
                    Exportar Selección a Calendar
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface text-body-sm font-medium transition-colors"
                  >
                    Deseleccionar
                  </button>
                </div>
              </div>
            )}

            {/* Section 5: Main Transactions Ledger Table or Cards Grid */}
            {viewMode === "table" ? (
              <ExpenseTable
                expenses={filteredExpenses}
                onToggleStatus={handleToggleStatus}
                onOpenCalendarExport={handleOpenCalendarExport}
                onEditExpense={handleOpenEdit}
                selectedIds={selectedIds}
                onToggleSelectRow={handleToggleSelectRow}
                onToggleSelectAll={handleToggleSelectAll}
                referenceDate={referenceDate}
                monthName={monthName.substring(0, 3)}
                year={selectedYear}
              />
            ) : (
              <ExpenseGrid
                expenses={filteredExpenses}
                onToggleStatus={handleToggleStatus}
                onOpenCalendarExport={handleOpenCalendarExport}
                onEditExpense={handleOpenEdit}
                selectedIds={selectedIds}
                onToggleSelectRow={handleToggleSelectRow}
                referenceDate={referenceDate}
                monthName={monthName.substring(0, 3)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Section 6: Floating Pill Bottom Bar (Dock) */}
      <BottomDock
        expenses={expenses}
        onOpenAddExpense={handleOpenNewExpense}
        onSyncAllCalendar={() => handleOpenCalendarExport()}
        onNextMonth={handleNextMonth}
        referenceDate={referenceDate}
      />

      {/* Modal para Agregar / Editar Gasto */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSaveExpense={handleSaveExpense}
        currentMonthYear={currentPeriodKey}
        expenseToEdit={expenseToEdit}
      />

      {/* Modal Avanzado para Exportar a Google Calendar */}
      <CalendarExportModal
        isOpen={isCalendarModalOpen}
        onClose={() => {
          setIsCalendarModalOpen(false);
          setCalendarTargetExpense(null);
        }}
        singleExpense={calendarTargetExpense}
        selectedExpenses={selectedExpensesList}
        allMonthExpenses={expenses}
        currentPeriodLabel={formattedPeriodLabel}
      />

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20 py-space-xl">
        <div className="max-w-7xl mx-auto px-margin-mobile lg:px-margin flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-primary text-[18px]">
              shield
            </span>
            <span className="font-body-sm text-body-sm">
              © 2026 Control de Gastos Familiares • Cifrado y Sincronización en
              Tiempo Real
            </span>
          </div>
          <div className="flex items-center gap-space-lg text-on-surface-variant font-label-md text-label-md">
            <a className="hover:text-on-surface transition-colors" href="#privacidad">
              Privacidad
            </a>
            <a className="hover:text-on-surface transition-colors" href="#auditoria">
              Auditoría Familiar
            </a>
            <a className="hover:text-on-surface transition-colors" href="#soporte">
              Soporte
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
