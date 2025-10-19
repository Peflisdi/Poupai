import toast from "react-hot-toast";

// Configurações de estilo customizadas para os toasts
const toastStyles = {
  success: {
    duration: 4000,
    style: {
      background: "#10b981",
      color: "#fff",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#10b981",
    },
  },
  error: {
    duration: 5000,
    style: {
      background: "#ef4444",
      color: "#fff",
      fontWeight: "500",
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#ef4444",
    },
  },
  warning: {
    duration: 4500,
    style: {
      background: "#f59e0b",
      color: "#fff",
      fontWeight: "500",
    },
    icon: "⚠️",
  },
  info: {
    duration: 4000,
    style: {
      background: "#3b82f6",
      color: "#fff",
      fontWeight: "500",
    },
    icon: "ℹ️",
  },
  loading: {
    style: {
      background: "#6b7280",
      color: "#fff",
      fontWeight: "500",
    },
  },
};

// Funções helper para mostrar toasts
export const showToast = {
  success: (message: string) => toast.success(message, toastStyles.success),
  error: (message: string) => toast.error(message, toastStyles.error),
  warning: (message: string) => toast(message, toastStyles.warning),
  info: (message: string) => toast(message, toastStyles.info),
  loading: (message: string) => toast.loading(message, toastStyles.loading),

  // Para operações assíncronas com loading
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        success: toastStyles.success,
        error: toastStyles.error,
        loading: toastStyles.loading,
      }
    );
  },

  // Dismiss específico ou todos
  dismiss: (toastId?: string) => toast.dismiss(toastId),
};

// Mensagens padrão do sistema
export const toastMessages = {
  transactions: {
    created: "Transação criada com sucesso!",
    updated: "Transação atualizada com sucesso!",
    deleted: "Transação excluída com sucesso!",
    error: "Erro ao processar transação",
  },
  cards: {
    created: "Cartão criado com sucesso!",
    updated: "Cartão atualizado com sucesso!",
    deleted: "Cartão excluído com sucesso!",
    error: "Erro ao processar cartão",
  },
  goals: {
    created: "Meta criada com sucesso!",
    updated: "Meta atualizada com sucesso!",
    deleted: "Meta excluída com sucesso!",
    depositAdded: "Depósito adicionado com sucesso!",
    error: "Erro ao processar meta",
  },
  categories: {
    created: "Categoria criada com sucesso!",
    updated: "Categoria atualizada com sucesso!",
    deleted: "Categoria excluída com sucesso!",
    error: "Erro ao processar categoria",
  },
  auth: {
    loginSuccess: "Login realizado com sucesso!",
    loginError: "Erro ao fazer login",
    logoutSuccess: "Logout realizado com sucesso!",
    sessionExpired: "Sessão expirada. Faça login novamente.",
  },
  general: {
    loading: "Carregando...",
    saved: "Salvo com sucesso!",
    error: "Ocorreu um erro. Tente novamente.",
    networkError: "Erro de conexão. Verifique sua internet.",
  },
};
