/**
 * Utilitários para cálculos relacionados a cartões de crédito
 */

/**
 * Verifica se uma data é final de semana (sábado ou domingo)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = domingo, 6 = sábado
}

/**
 * Ajusta a data de fechamento para o próximo dia útil, caso caia em final de semana
 *
 * Exemplo:
 * - Fecha dia 1 (domingo) → Ajusta para dia 2 (segunda)
 * - Fecha dia 31 (sábado) → Ajusta para dia 2 (segunda, considerando que 1 é domingo)
 *
 * @param year - Ano da data
 * @param month - Mês da data (0-11, como em JavaScript Date)
 * @param closingDay - Dia de fechamento do cartão (1-31)
 * @returns Data ajustada para o próximo dia útil
 */
export function getActualClosingDate(year: number, month: number, closingDay: number): Date {
  const closingDate = new Date(year, month, closingDay);

  // Se cai em final de semana, avança para o próximo dia útil
  while (isWeekend(closingDate)) {
    closingDate.setDate(closingDate.getDate() + 1);
  }

  return closingDate;
}

/**
 * Verifica se a data da transação é anterior ao fechamento efetivo (considerando finais de semana)
 *
 * Lógica:
 * - Se o fechamento cai em dia útil: compras até (closingDay - 1) vão para a fatura atual
 * - Se o fechamento cai em final de semana: o fechamento é adiado para a próxima segunda-feira
 *
 * Exemplo 1: Fecha dia 4 (quinta-feira)
 * - Compras até dia 3 (quarta) → Fatura atual
 * - Compras a partir de dia 4 (quinta) → Próxima fatura
 *
 * Exemplo 2: Fecha dia 1 (domingo)
 * - Fechamento efetivo: dia 2 (segunda)
 * - Compras até dia 1 (domingo) → Fatura atual (ainda não processou)
 * - Compras a partir de dia 2 (segunda) → Próxima fatura
 *
 * @param transactionDate - Data da transação
 * @param closingDay - Dia de fechamento configurado no cartão
 * @returns true se a transação pertence à fatura anterior ao fechamento
 */
export function isBeforeClosing(transactionDate: Date, closingDay: number): boolean {
  const year = transactionDate.getFullYear();
  const month = transactionDate.getMonth();

  // Obter a data de fechamento ajustada para dia útil
  const actualClosingDate = getActualClosingDate(year, month, closingDay);

  // A transação é anterior ao fechamento se for ANTES da data de fechamento ajustada
  return transactionDate < actualClosingDate;
}

/**
 * Calcula o período da fatura atual, considerando finais de semana
 *
 * @param closingDay - Dia de fechamento do cartão (1-31)
 * @param referenceDate - Data de referência (geralmente hoje). Opcional.
 * @returns Objeto com startDate e endDate do período da fatura
 */
export function getCurrentBillPeriod(
  closingDay: number,
  referenceDate: Date = new Date()
): { startDate: Date; endDate: Date } {
  const currentMonth = referenceDate.getMonth();
  const currentYear = referenceDate.getFullYear();

  // Obter a data de fechamento EFETIVA (ajustada para dia útil) do mês atual
  const currentMonthClosing = getActualClosingDate(currentYear, currentMonth, closingDay);

  let startDate: Date;
  let endDate: Date;

  if (referenceDate < currentMonthClosing) {
    // Ainda não chegou no fechamento deste mês
    // Fatura vence NESTE mês
    // Período: fechamento do mês anterior até (fechamento atual - 1 dia)

    const prevMonth = currentMonth - 1;
    const prevYear = prevMonth < 0 ? currentYear - 1 : currentYear;
    const prevMonthIndex = prevMonth < 0 ? 11 : prevMonth;

    startDate = getActualClosingDate(prevYear, prevMonthIndex, closingDay);

    // End date é o dia anterior ao fechamento atual
    endDate = new Date(currentMonthClosing);
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // Já passou o fechamento deste mês
    // Fatura vence no PRÓXIMO mês
    // Período: fechamento atual até (fechamento próximo mês - 1 dia)

    startDate = currentMonthClosing;

    const nextMonth = currentMonth + 1;
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear;
    const nextMonthIndex = nextMonth > 11 ? 0 : nextMonth;

    const nextMonthClosing = getActualClosingDate(nextYear, nextMonthIndex, closingDay);

    endDate = new Date(nextMonthClosing);
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}

/**
 * Calcula o período de uma fatura específica (por mês de vencimento)
 *
 * @param closingDay - Dia de fechamento do cartão
 * @param year - Ano do vencimento
 * @param month - Mês do vencimento (1-12)
 * @returns Objeto com startDate e endDate do período da fatura
 */
export function getBillPeriodByMonth(
  closingDay: number,
  year: number,
  month: number // 1-12 (1=Jan, 10=Out)
): { startDate: Date; endDate: Date } {
  // Converter mês de 1-12 para 0-11
  const monthIndex = month - 1;

  // Fatura que vence em `month/year`
  // Período de compras: fechamento do mês anterior até (fechamento do mês atual - 1)

  const prevMonthIndex = monthIndex - 1;
  const prevYear = prevMonthIndex < 0 ? year - 1 : year;
  const prevMonth = prevMonthIndex < 0 ? 11 : prevMonthIndex;

  // Data de início: fechamento do mês anterior (ajustado para dia útil)
  const startDate = getActualClosingDate(prevYear, prevMonth, closingDay);

  // Data de fim: dia anterior ao fechamento do mês de vencimento (ajustado)
  const currentMonthClosing = getActualClosingDate(year, monthIndex, closingDay);
  const endDate = new Date(currentMonthClosing);
  endDate.setDate(endDate.getDate() - 1);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}
