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
 * Sugere o mês da fatura com base na data da compra e dia de fechamento
 *
 * NOVA LÓGICA SIMPLIFICADA:
 * - Usuário escolhe o mês da fatura manualmente
 * - Esta função apenas SUGERE o mês mais provável
 *
 * Regra simples:
 * - Se comprou ANTES do fechamento → Fatura do mês atual
 * - Se comprou DEPOIS do fechamento → Fatura do próximo mês
 *
 * @param purchaseDate - Data da compra
 * @param closingDay - Dia de fechamento do cartão
 * @param dueDay - Dia de vencimento do cartão
 * @returns String no formato YYYY-MM (mês de vencimento sugerido)
 *
 * @example
 * // Compra dia 15/10, fecha dia 30, vence dia 7
 * suggestBillMonth(new Date(2025, 9, 15), 30, 7) // "2025-11" (vence em novembro)
 *
 * // Compra dia 31/10, fecha dia 30, vence dia 7
 * suggestBillMonth(new Date(2025, 9, 31), 30, 7) // "2025-12" (vence em dezembro)
 */
export function suggestBillMonth(purchaseDate: Date, closingDay: number, dueDay: number): string {
  const purchaseDay = purchaseDate.getDate();
  const purchaseMonth = purchaseDate.getMonth(); // 0-11
  const purchaseYear = purchaseDate.getFullYear();

  // Obter último dia do mês de compra
  const lastDayOfMonth = new Date(purchaseYear, purchaseMonth + 1, 0).getDate();
  const actualClosingDay = Math.min(closingDay, lastDayOfMonth);

  let dueMonth: number;
  let dueYear: number;

  // Se comprou DEPOIS do fechamento → próxima fatura
  if (purchaseDay > actualClosingDay) {
    // Fechou este mês, vai para próxima fatura
    const nextMonth = purchaseMonth + 1;
    const closingMonth = nextMonth > 11 ? 0 : nextMonth;
    const closingYear = nextMonth > 11 ? purchaseYear + 1 : purchaseYear;

    // Calcular mês de vencimento baseado no fechamento
    if (dueDay < closingDay) {
      // Vence no mês seguinte ao fechamento
      dueMonth = closingMonth + 1;
      dueYear = dueMonth > 11 ? closingYear + 1 : closingYear;
      dueMonth = dueMonth > 11 ? 0 : dueMonth;
    } else {
      // Vence no mesmo mês do fechamento
      dueMonth = closingMonth;
      dueYear = closingYear;
    }
  } else {
    // Comprou ANTES do fechamento → fatura atual
    const closingMonth = purchaseMonth;
    const closingYear = purchaseYear;

    // Calcular mês de vencimento
    if (dueDay < closingDay) {
      // Vence no mês seguinte
      dueMonth = closingMonth + 1;
      dueYear = dueMonth > 11 ? closingYear + 1 : closingYear;
      dueMonth = dueMonth > 11 ? 0 : dueMonth;
    } else {
      // Vence no mesmo mês
      dueMonth = closingMonth;
      dueYear = closingYear;
    }
  }

  // Retornar no formato YYYY-MM
  return `${dueYear}-${String(dueMonth + 1).padStart(2, "0")}`;
}

/**
 * Ajusta a data de fechamento para o próximo dia útil, caso caia em final de semana
 *
 * Exemplo:
 * - Fecha dia 1 (domingo) → Ajusta para dia 2 (segunda)
 * - Fecha dia 31 (sábado) → Ajusta para dia 2 (segunda, considerando que 1 é domingo)
 * - Fecha dia 31 em fevereiro → Usa dia 28 (ou 29 em ano bissexto) - ÚLTIMO DIA DO MÊS
 *
 * @param year - Ano da data
 * @param month - Mês da data (0-11, como em JavaScript Date)
 * @param closingDay - Dia de fechamento do cartão (1-31)
 * @returns Data ajustada para o próximo dia útil
 */
export function getActualClosingDate(year: number, month: number, closingDay: number): Date {
  // Primeiro, obter o último dia válido do mês
  // Criar data com dia 0 do MÊS SEGUINTE = último dia do mês atual
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

  // Se o closingDay é maior que os dias do mês, usar o último dia
  const actualDay = Math.min(closingDay, lastDayOfMonth);

  const closingDate = new Date(year, month, actualDay);

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
 * Calcula o período da fatura atual
 *
 * @param closingDay - Dia de fechamento do cartão (1-31)
 * @param dueDay - Dia de vencimento do cartão (1-31)
 * @param referenceDate - Data de referência (geralmente hoje). Opcional.
 * @returns Objeto com startDate e endDate do período da fatura, e o mês de vencimento
 */
export function getCurrentBillPeriod(
  closingDay: number,
  dueDay: number,
  referenceDate: Date = new Date()
): { startDate: Date; endDate: Date; dueMonth: number; dueYear: number } {
  const currentMonth = referenceDate.getMonth();
  const currentYear = referenceDate.getFullYear();
  const currentDay = referenceDate.getDate();

  // Obter último dia do mês atual (para comparação)
  const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const actualCurrentClosingDay = Math.min(closingDay, lastDayOfCurrentMonth);

  // Data de fechamento do mês atual (sem ajuste de fim de semana)
  const currentMonthClosingDate = new Date(currentYear, currentMonth, actualCurrentClosingDay);
  currentMonthClosingDate.setHours(23, 59, 59, 999);

  let closingMonth: number;
  let closingYear: number;

  // Determinar qual fatura estamos (baseado no fechamento)
  if (referenceDate <= currentMonthClosingDate) {
    // Ainda não fechou este mês
    // A fatura ATUAL é a que fecha este mês
    closingMonth = currentMonth;
    closingYear = currentYear;
  } else {
    // Já fechou este mês
    // A fatura ATUAL é a que fecha no próximo mês
    closingMonth = currentMonth + 1;
    closingYear = closingMonth > 11 ? currentYear + 1 : currentYear;
    closingMonth = closingMonth > 11 ? 0 : closingMonth;
  }

  // Calcular mês de vencimento baseado no fechamento
  let dueMonth: number;
  let dueYear: number;

  if (dueDay >= closingDay) {
    // Vence no mesmo mês do fechamento
    dueMonth = closingMonth;
    dueYear = closingYear;
  } else {
    // Vence no mês seguinte ao fechamento
    dueMonth = closingMonth + 1;
    dueYear = dueMonth > 11 ? closingYear + 1 : closingYear;
    dueMonth = dueMonth > 11 ? 0 : dueMonth;
  }

  // Calcular período de compras (SEM ajuste de fim de semana)

  // Obter último dia do mês de fechamento
  const lastDayOfClosingMonth = new Date(closingYear, closingMonth + 1, 0).getDate();
  const actualClosingDay = Math.min(closingDay, lastDayOfClosingMonth);

  const closingDate = new Date(closingYear, closingMonth, actualClosingDay);
  closingDate.setHours(23, 59, 59, 999);

  // Fechamento anterior
  const prevClosingMonth = closingMonth - 1;
  const prevClosingYear = prevClosingMonth < 0 ? closingYear - 1 : closingYear;
  const prevMonth = prevClosingMonth < 0 ? 11 : prevClosingMonth;

  // Obter último dia do mês anterior
  const lastDayOfPrevMonth = new Date(prevClosingYear, prevMonth + 1, 0).getDate();
  const actualPrevClosingDay = Math.min(closingDay, lastDayOfPrevMonth);

  const prevClosingDate = new Date(prevClosingYear, prevMonth, actualPrevClosingDay);

  // Start date: dia APÓS o fechamento anterior (00:00:00)
  const startDate = new Date(prevClosingDate);
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);

  // End date: dia do fechamento atual (23:59:59)
  const endDate = closingDate;

  return {
    startDate,
    endDate,
    dueMonth: dueMonth + 1, // Retornar 1-12
    dueYear,
  };
}

/**
 * Calcula o período de uma fatura específica (por mês de vencimento)
 *
 * IMPORTANTE: O mês passado é o mês de VENCIMENTO, não de fechamento!
 *
 * Exemplo: Cartão fecha dia 31, vence dia 07
 * - Fatura de NOVEMBRO (vence 07/11) = compras de 01/10 até 31/10
 * - Fatura de DEZEMBRO (vence 07/12) = compras de 01/11 até 30/11
 *
 * @param closingDay - Dia de fechamento do cartão
 * @param dueDay - Dia de vencimento do cartão
 * @param year - Ano do vencimento
 * @param month - Mês do vencimento (1-12)
 * @returns Objeto com startDate e endDate do período da fatura
 */
export function getBillPeriodByMonth(
  closingDay: number,
  dueDay: number,
  year: number,
  month: number // 1-12 (1=Jan, 10=Out)
): { startDate: Date; endDate: Date } {
  // Converter mês de 1-12 para 0-11
  const monthIndex = month - 1;

  // Determinar o mês de fechamento baseado no vencimento
  let closingMonthIndex: number;
  let closingYear: number;

  if (dueDay >= closingDay) {
    // Vencimento no mesmo mês do fechamento (ex: fecha dia 10, vence dia 15)
    // Fatura vence em outubro → fecha em outubro
    closingMonthIndex = monthIndex;
    closingYear = year;
  } else {
    // Vencimento no mês seguinte ao fechamento (caso mais comum)
    // Ex: fecha dia 31, vence dia 07
    // Fatura vence em novembro (07/11) → fechou em outubro (31/10)
    closingMonthIndex = monthIndex - 1;
    closingYear = closingMonthIndex < 0 ? year - 1 : year;
    closingMonthIndex = closingMonthIndex < 0 ? 11 : closingMonthIndex;
  }

  // IMPORTANTE: Para o período de compras, NÃO ajustamos finais de semana!
  // O período é FIXO baseado nos dias configurados.
  // Apenas a DATA DE PROCESSAMENTO da fatura é ajustada para dia útil.

  // Obter último dia do mês de fechamento
  const lastDayOfClosingMonth = new Date(closingYear, closingMonthIndex + 1, 0).getDate();
  const actualClosingDay = Math.min(closingDay, lastDayOfClosingMonth);

  // Data de fechamento (SEM ajuste de fim de semana para período)
  const closingDate = new Date(closingYear, closingMonthIndex, actualClosingDay);
  closingDate.setHours(23, 59, 59, 999);

  // Fechamento anterior (1 mês antes)
  const prevClosingMonthIndex = closingMonthIndex - 1;
  const prevClosingYear = prevClosingMonthIndex < 0 ? closingYear - 1 : closingYear;
  const prevClosingMonth = prevClosingMonthIndex < 0 ? 11 : prevClosingMonthIndex;

  // Obter último dia do mês anterior
  const lastDayOfPrevMonth = new Date(prevClosingYear, prevClosingMonth + 1, 0).getDate();
  const actualPrevClosingDay = Math.min(closingDay, lastDayOfPrevMonth);

  const prevClosingDate = new Date(prevClosingYear, prevClosingMonth, actualPrevClosingDay);

  // Start date: dia APÓS o fechamento anterior (00:00:00)
  const startDate = new Date(prevClosingDate);
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);

  // End date: dia do fechamento atual (23:59:59) - já definido acima
  const endDate = closingDate;

  return { startDate, endDate };
}
