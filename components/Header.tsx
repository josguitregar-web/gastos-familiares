"use client";

import React, { useState, useRef, useEffect } from "react";

export interface UserProfile {
  id: string;
  name: string;
  role: "Josué" | "Papá";
  email: string;
}

interface HeaderProps {
  currentPeriodLabel: string;
  selectedYear: number;
  selectedMonth: number;
  onSelectPeriod: (year: number, month: number) => void;
  onOpenAddExpense?: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  isCompanionOnline: boolean;
  companionStatusText: string;
  currentUser: UserProfile;
  onSwitchUser: (newUser: UserProfile) => void;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const YEARS = [2025, 2026, 2027];

export const Header: React.FC<HeaderProps> = ({
  currentPeriodLabel,
  selectedYear,
  selectedMonth,
  onSelectPeriod,
  onOpenAddExpense,
  theme,
  onToggleTheme,
  isCompanionOnline,
  companionStatusText,
  currentUser,
  onSwitchUser,
}) => {
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMonthDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
      <div className="h-20 max-w-7xl mx-auto px-margin-mobile lg:px-margin flex items-center justify-between gap-gutter">
        {/* Logo and App Title */}
        <div className="flex items-center gap-space-lg">
          <div className="flex items-center gap-space-sm cursor-pointer select-none">
            <div className="w-9 h-9 rounded-lg bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-[20px]">
                account_balance_wallet
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none">
                Control de Gastos
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-0.5">
                Familiar • Finanzas
              </span>
            </div>
          </div>

          {/* Month Selector in Header */}
          <div className="hidden sm:flex items-center relative" ref={monthDropdownRef}>
            <button
              onClick={() => setIsMonthDropdownOpen((prev) => !prev)}
              className="flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-space-xs rounded-lg border border-outline-variant/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary-container/40"
              type="button"
              aria-expanded={isMonthDropdownOpen}
            >
              <span className="material-symbols-outlined text-primary text-[18px]">
                calendar_today
              </span>
              <span className="font-body-md text-body-md font-semibold text-on-surface">
                {currentPeriodLabel}
              </span>
              <span className={`material-symbols-outlined text-on-surface-variant text-[18px] transition-transform ${isMonthDropdownOpen ? "rotate-180" : ""}`}>
                expand_more
              </span>
            </button>

            {/* Month Dropdown Menu */}
            {isMonthDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl p-3 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Seleccionar Año
                  </span>
                  <div className="flex gap-1">
                    {YEARS.map((y) => (
                      <button
                        key={y}
                        onClick={() => onSelectPeriod(y, selectedMonth)}
                        className={`px-2 py-0.5 rounded text-label-sm font-semibold transition-colors ${
                          y === selectedYear
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                  {MONTHS.map((m, idx) => {
                    const monthNum = idx + 1;
                    const isSelected =
                      selectedMonth === monthNum && selectedYear === selectedYear;
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          onSelectPeriod(selectedYear, monthNum);
                          setIsMonthDropdownOpen(false);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-body-sm font-medium transition-colors text-center ${
                          isSelected
                            ? "bg-primary-container text-on-primary-container font-bold"
                            : "hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {m.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Central Navigation Pills */}
        <nav
          className="hidden xl:flex items-center gap-space-xs bg-surface-container-lowest/60 p-space-xs rounded-xl border border-outline-variant/20"
          data-active-classes="bg-surface-container-high text-on-surface font-semibold"
        >
          <a
            aria-current="page"
            className="px-space-md py-space-xs rounded-lg transition-colors bg-surface-container-high text-on-surface font-semibold"
            href="#resumen"
          >
            Resumen
          </a>
          <a
            className="px-space-md py-space-xs rounded-lg font-body-md text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            href="#distribucion"
          >
            Distribución
          </a>
          <a
            className="px-space-md py-space-xs rounded-lg font-body-md text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            href="#cuentas"
          >
            Cuentas
          </a>
          <a
            className="px-space-md py-space-xs rounded-lg font-body-md text-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            href="#historial"
          >
            Historial
          </a>
        </nav>

        {/* Right side: Realtime status, theme toggle, add button, user avatar */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          {/* Realtime Presence Pill: Compartido con Papá */}
          <div
            className={`hidden md:flex items-center gap-space-xs px-space-md py-space-xs rounded-full border transition-colors ${
              isCompanionOnline
                ? "bg-surface-container-low border-secondary/50 shadow-[0_0_12px_rgba(78,222,163,0.15)]"
                : "bg-surface-container-low border-outline-variant/40"
            }`}
            title={companionStatusText}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-surface-container-high border border-outline-variant/50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[13px]">
                  group
                </span>
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
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
            <span
              className={`font-label-md text-label-md font-medium ${
                isCompanionOnline ? "text-secondary" : "text-on-surface-variant"
              }`}
            >
              {isCompanionOnline ? "Papá en línea" : "Compartido con Papá"}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            aria-label="Cambiar tema visual"
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30 flex items-center justify-center transition-colors focus:outline-none"
            type="button"
            title={theme === "dark" ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {theme === "dark" ? "dark_mode" : "light_mode"}
            </span>
          </button>

          {/* New Expense button */}
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-space-xs bg-primary-container hover:bg-primary-container/90 text-on-primary-container px-space-md py-space-xs rounded-lg font-body-md text-body-md font-semibold transition-all shadow-[0_2px_12px_rgba(128,131,255,0.25)] hover:shadow-[0_2px_16px_rgba(128,131,255,0.4)] active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="hidden sm:inline">Nuevo Gasto</span>
          </button>

          {/* User Profile / Avatar with Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
              type="button"
              className={`w-8 h-8 rounded-full flex items-center justify-center ml-space-xs ring-2 transition-all ${
                currentUser.role === "Josué"
                  ? "bg-primary ring-primary/40 text-on-primary"
                  : "bg-secondary ring-secondary/40 text-on-secondary"
              }`}
              title={`Perfil: ${currentUser.name} (${currentUser.role})`}
            >
              <span className="font-label-sm text-label-sm font-bold">
                {currentUser.role === "Josué" ? "YO" : "PA"}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in">
                {/* User Info Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-headline-sm shadow-md ${
                      currentUser.role === "Josué"
                        ? "bg-primary text-on-primary"
                        : "bg-secondary text-on-secondary"
                    }`}
                  >
                    {currentUser.role === "Josué" ? "YO" : "PA"}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md font-semibold text-on-surface">
                      {currentUser.name}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                {/* Profile Switcher Section */}
                <div className="py-3">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-2">
                    Cambiar Perfil Activo
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchUser({
                          id: "user-josue",
                          name: "Josué Treviño",
                          role: "Josué",
                          email: "josue@familia.mx",
                        });
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`py-2 px-3 rounded-xl border text-body-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                        currentUser.role === "Josué"
                          ? "bg-primary-container/20 border-primary text-primary font-semibold"
                          : "bg-surface-container border-outline-variant/20 text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        person
                      </span>
                      Josué (YO)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSwitchUser({
                          id: "user-papa",
                          name: "Papá",
                          role: "Papá",
                          email: "papa@familia.mx",
                        });
                        setIsProfileDropdownOpen(false);
                      }}
                      className={`py-2 px-3 rounded-xl border text-body-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                        currentUser.role === "Papá"
                          ? "bg-secondary/20 border-secondary text-secondary font-semibold"
                          : "bg-surface-container border-outline-variant/20 text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        elderly
                      </span>
                      Papá (PA)
                    </button>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-body-sm text-on-surface-variant py-1">
                    <span>Sincronización</span>
                    <span className="text-secondary font-medium">Activa</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("household_active_user");
                        window.location.reload();
                      }
                    }}
                    className="w-full mt-1 py-1.5 px-3 rounded-lg text-left text-body-sm text-tertiary hover:bg-tertiary-container/15 flex items-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      logout
                    </span>
                    Reiniciar sesión local
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
