"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Estilos padrão para todos os toasts
        className: "",
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          maxWidth: "500px",
        },

        // Estilos para dark mode
        success: {
          duration: 4000,
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}
