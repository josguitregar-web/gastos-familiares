"use client";

import React from "react";
import { ExpenseCategory } from "@/types/expense";

interface FilterControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string; // 'all' or ExpenseCategory
  onCategoryChange: (category: string) => void;
  selectedStatus: string; // 'all' | 'Hecho' | 'Pendiente' | 'Vencido'
  onStatusChange: (status: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: "Todos", value: "all" },
  { label: "Vivienda", value: "Vivienda" },
  { label: "Servicios", value: "Servicios" },
  { label: "Educación", value: "Educación" },
  { label: "Salud", value: "Salud" },
  { label: "Tarjetas", value: "Tarjetas" },
];

export const FilterControls: React.FC<FilterControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="bg-surface-container-low rounded-xl p-space-md mb-space-md shadow-md flex flex-col lg:flex-row gap-space-md items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full lg:w-72">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
          search
        </span>
        <input
          className="w-full bg-surface-container rounded-lg pl-9 pr-9 py-2 text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:bg-surface-container-high transition-colors"
          placeholder="Buscar por concepto o servicio..."
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5 rounded-full"
            title="Limpiar búsqueda"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0"
        id="categoryPillList"
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onCategoryChange(cat.value)}
              className={`category-btn px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all whitespace-nowrap ${
                isActive
                  ? "font-semibold bg-primary text-on-primary"
                  : "font-medium bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Status Segmented Controls & Layout View Toggle */}
      <div className="flex items-center gap-space-sm w-full lg:w-auto justify-end">
        <select
          className="bg-surface-container text-on-surface font-label-md text-label-md rounded-lg px-space-md py-2 focus:outline-none focus:bg-surface-container-high cursor-pointer"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="all">Estado: Todos</option>
          <option value="Hecho">Solo Pagados</option>
          <option value="Pendiente">Solo Pendientes</option>
          <option value="Vencido">Solo Vencidos</option>
        </select>

        <div className="flex items-center bg-surface-container p-1 rounded-lg">
          <button
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors shadow-sm ${
              viewMode === "table"
                ? "bg-surface-container-high text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            title="Vista en Tabla"
            type="button"
            onClick={() => onViewModeChange("table")}
          >
            <span className="material-symbols-outlined text-[18px]">
              table_rows
            </span>
          </button>
          <button
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
              viewMode === "grid"
                ? "bg-surface-container-high text-on-surface"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            title="Vista en Tarjetas"
            type="button"
            onClick={() => onViewModeChange("grid")}
          >
            <span className="material-symbols-outlined text-[18px]">
              grid_view
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
