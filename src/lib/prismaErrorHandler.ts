import { Prisma } from "@prisma/client";

/**
 * Trata erros do Prisma e retorna mensagens amigáveis
 */
export function handlePrismaError(error: unknown): string {
  // Se não for erro do Prisma, retorna mensagem genérica
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    if (error instanceof Error) {
      return error.message;
    }
    return "Erro desconhecido ao processar a requisição";
  }

  // P2002: Unique constraint violation
  if (error.code === "P2002") {
    const fields = (error.meta?.target as string[]) || [];
    if (fields.includes("email")) {
      return "Este email já está cadastrado";
    }
    return `Registro duplicado: ${fields.join(", ")}`;
  }

  // P2003: Foreign key constraint failed
  if (error.code === "P2003") {
    return "Não é possível realizar esta operação. Verifique se os dados relacionados existem.";
  }

  // P2025: Record not found
  if (error.code === "P2025") {
    return "Registro não encontrado";
  }

  // P2014: Relation violation
  if (error.code === "P2014") {
    return "Não é possível deletar este item pois ele está relacionado a outros registros";
  }

  // P2000: Value too long
  if (error.code === "P2000") {
    return "Valor muito longo para o campo";
  }

  // P2001: Record does not exist
  if (error.code === "P2001") {
    return "O registro que você está tentando modificar não existe";
  }

  // P2011: Null constraint violation
  if (error.code === "P2011") {
    return "Campo obrigatório está vazio";
  }

  // P2012: Missing required value
  if (error.code === "P2012") {
    return "Um valor obrigatório está faltando";
  }

  // P2015: Related record not found
  if (error.code === "P2015") {
    return "Registro relacionado não encontrado";
  }

  // P2016: Query interpretation error
  if (error.code === "P2016") {
    return "Erro ao processar a consulta";
  }

  // P2021: Table does not exist
  if (error.code === "P2021") {
    return "Erro de configuração do banco de dados. Contate o administrador.";
  }

  // P2022: Column does not exist
  if (error.code === "P2022") {
    return "Erro de estrutura do banco de dados. Contate o administrador.";
  }

  // Erro genérico do Prisma
  return `Erro no banco de dados: ${error.message}`;
}

/**
 * Verifica se o erro é de autenticação/sessão
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("Não autenticado") ||
      error.message.includes("Sessão inválida") ||
      error.message.includes("não encontrado")
    );
  }
  return false;
}

/**
 * Wrapper para executar operações do Prisma com tratamento de erro
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error("Database operation error:", error);
    const message = errorMessage || handlePrismaError(error);
    throw new Error(message);
  }
}

/**
 * Valida se o usuário está autenticado
 */
export function validateUser(userId: string | undefined | null): asserts userId is string {
  if (!userId) {
    throw new Error("Não autenticado. Faça login para continuar.");
  }
}

/**
 * Wrapper para APIs com tratamento de erro padrão
 */
export function apiErrorHandler(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      error: handlePrismaError(error),
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message,
    };
  }

  return {
    error: "Erro interno do servidor",
  };
}
