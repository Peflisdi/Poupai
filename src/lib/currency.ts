/**
 * Utilitários para formatação de moeda (BRL)
 */

/**
 * Formata um número para moeda brasileira
 * @param value - Valor numérico
 * @param showSymbol - Se deve mostrar o símbolo R$
 * @returns String formatada (ex: "R$ 12.450,20")
 */
export function formatCurrency(value: number, showSymbol = true): string {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

  return showSymbol ? formatted : formatted.replace("R$", "").trim();
}

/**
 * Converte string formatada para número
 * Remove R$, pontos e troca vírgula por ponto
 * @param value - String formatada (ex: "R$ 12.450,20" ou "12.450,20" ou "12450.20")
 * @returns Número (ex: 12450.20)
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;

  // Remove R$, espaços e underscores
  let cleaned = value.replace(/R\$/g, "").replace(/\s/g, "").replace(/_/g, "");

  // Se tem vírgula, assume formato BR (12.450,20)
  if (cleaned.includes(",")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  }
  // Se tem ponto mas não vírgula, pode ser tanto US (12450.20) quanto BR (12.450)
  // Vamos assumir que se tem mais de um ponto, é separador de milhar BR
  else if ((cleaned.match(/\./g) || []).length > 1) {
    cleaned = cleaned.replace(/\./g, "");
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata valor enquanto usuário digita
 * @param value - String atual do input
 * @returns String formatada para exibição
 */
export function formatCurrencyInput(value: string): string {
  const number = parseCurrency(value);
  if (number === 0 && !value) return "";

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}
