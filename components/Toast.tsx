"use client";

import React, { useEffect } from "react";

export interface ToastData {
  title: string;
  message: string;
  type?: "success" | "info" | "warning";
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const iconName =
    toast.type === "warning"
      ? "warning"
      : toast.type === "info"
      ? "info"
      : "check_circle";

  const borderColor =
    toast.type === "warning"
      ? "border-tertiary"
      : toast.type === "info"
      ? "border-primary"
      : "border-secondary";

  const iconColor =
    toast.type === "warning"
      ? "text-tertiary"
      : toast.type === "info"
      ? "text-primary"
      : "text-secondary";

  return (
    <div className="fixed top-24 right-6 z-50 pointer-events-none animate-slide-left">
      <div
        className={`bg-surface-container-high border-l-4 ${borderColor} text-on-surface px-space-md py-space-sm rounded-lg shadow-2xl flex items-center gap-space-sm pointer-events-auto max-w-sm`}
      >
        <span className={`material-symbols-outlined ${iconColor} text-[22px]`}>
          {iconName}
        </span>
        <div>
          <div className="font-semibold text-on-surface font-body-md text-body-md">
            {toast.title}
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            {toast.message}
          </div>
        </div>
      </div>
    </div>
  );
};
