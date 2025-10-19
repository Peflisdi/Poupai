"use client";

import { AlertTriangle, Trash2, AlertCircle, Info } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Configurações por tipo
  const typeConfig = {
    danger: {
      icon: Trash2,
      iconBg: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
      buttonBg: "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
      borderColor: "border-red-200 dark:border-red-800",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-600 dark:text-orange-400",
      buttonBg: "bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      buttonBg: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 dark:bg-black/90 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      style={{ margin: 0 }}
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ margin: 0 }}
      >
        {/* Icon */}
        <div className="flex justify-center pt-6 pb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${config.iconBg}`}
          >
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">{title}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonBg}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processando...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
