import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Transaction {
  id: string;
  description: string | null;
  amount: number;
  date: Date | string;
  isReimbursed: boolean;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
  card?: {
    name: string;
    color: string;
  };
}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  spent: number;
  percentage: number;
  transactions: Transaction[];
}

interface CardBill {
  cardName: string;
  cardColor: string;
  closingDay: number;
  billMonth: string;
  transactions: Array<{
    id: string;
    description: string | null;
    amount: number;
    date: Date | string;
    isReimbursed: boolean;
    category?: {
      name: string;
      icon: string;
      color: string;
    };
  }>;
  total: number;
}

interface DirectTransaction {
  id: string;
  description: string | null;
  amount: number;
  date: Date | string;
  isReimbursed: boolean;
  category?: {
    name: string;
    icon: string;
    color: string;
  };
}

interface LoanData {
  id: string;
  type: string;
  description: string | null;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: number;
  dueDate: Date | string | null;
  status: string;
  createdAt: Date | string;
  payments: Array<{
    id: string;
    amount: number;
    date: Date | string;
    notes: string | null;
  }>;
}

interface PersonExpenseData {
  personName: string;
  period: {
    start: string;
    end: string;
  };
  total: number;
  totalPending: number;
  totalReimbursed: number;
  transactionCount: number;
  categories: CategoryData[];
  // Novos campos
  cardBills?: CardBill[];
  directTransactions?: DirectTransaction[];
  totalCard?: number;
  totalDirect?: number;
  // Empréstimos
  loans?: LoanData[];
  totalLoans?: number;
  totalLoansPaid?: number;
  totalLoansRemaining?: number;
}

/**
 * Remove emojis e caracteres especiais que não são suportados pelo PDF
 * Mantém apenas texto ASCII e caracteres latinos básicos
 */
const sanitizeText = (text: string): string => {
  // Remove emojis e símbolos especiais, mantém apenas texto
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "") // Remove emojis
    .replace(/[\u{2600}-\u{26FF}]/gu, "") // Remove símbolos diversos
    .replace(/[\u{2700}-\u{27BF}]/gu, "") // Remove dingbats
    .replace(/[\u{FE00}-\u{FE0F}]/gu, "") // Remove seletores de variação
    .replace(/\s+/g, " ") // Normaliza espaços
    .trim();
};

/**
 * Retorna um ícone textual baseado no tipo
 */
const getTextIcon = (type: "card" | "pix" | "pending" | "paid"): string => {
  const icons = {
    card: "[Cartao]",
    pix: "[PIX]",
    pending: "[Pendente]",
    paid: "[Pago]",
  };
  return icons[type];
};

/**
 * Formata valor em moeda brasileira
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

/**
 * Formata data para exibição
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/**
 * Gera PDF com relatório de gastos de uma pessoa (agrupado por método de pagamento)
 */
export function generatePersonExpensesPDF(data: PersonExpenseData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Cores
  const primaryColor: [number, number, number] = [147, 51, 234]; // Purple
  const secondaryColor: [number, number, number] = [100, 100, 100];
  const successColor: [number, number, number] = [16, 185, 129]; // Green
  const warningColor: [number, number, number] = [245, 158, 11]; // Orange

  // ====================
  // HEADER
  // ====================
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Poupai", 15, 15);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Relatorio de Gastos por Pessoa", 15, 25);

  yPosition = 45;

  // ====================
  // INFORMAÇÕES DA PESSOA
  // ====================
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(data.personName, 15, yPosition);

  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Período: ${formatDate(data.period.start)} - ${formatDate(data.period.end)}`,
    15,
    yPosition
  );

  yPosition += 5;
  doc.text(`Total de Transações: ${data.transactionCount}`, 15, yPosition);

  yPosition += 5;
  doc.text(
    `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString(
      "pt-BR"
    )}`,
    15,
    yPosition
  );

  yPosition += 15;

  // ====================
  // RESUMO FINANCEIRO
  // ====================
  doc.setFillColor(245, 245, 245);
  doc.rect(15, yPosition, pageWidth - 30, 35, "F");

  const boxWidth = (pageWidth - 40) / 3;
  const boxY = yPosition + 5;

  // Total Gasto
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Total Gasto", 20, boxY);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(formatCurrency(data.total), 20, boxY + 10);

  // Pendente
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Pendente", 20 + boxWidth, boxY);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...warningColor);
  doc.text(formatCurrency(data.totalPending), 20 + boxWidth, boxY + 10);

  // Reembolsado
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Reembolsado", 20 + boxWidth * 2, boxY);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...successColor);
  doc.text(formatCurrency(data.totalReimbursed), 20 + boxWidth * 2, boxY + 10);

  // Barra de Progresso
  const progressY = boxY + 20;
  const progressWidth = pageWidth - 40;
  const progressPercentage = data.total > 0 ? (data.totalReimbursed / data.total) * 100 : 0;

  doc.setFillColor(220, 220, 220);
  doc.rect(20, progressY, progressWidth, 5, "F");

  doc.setFillColor(...successColor);
  doc.rect(20, progressY, (progressWidth * progressPercentage) / 100, 5, "F");

  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  doc.text(`${progressPercentage.toFixed(1)}% Reembolsado`, 20, progressY + 9);

  yPosition += 50;

  // ====================
  // DETALHAMENTO POR MÉTODO DE PAGAMENTO
  // ====================
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Detalhamento por Metodo de Pagamento", 15, yPosition);

  yPosition += 10;

  // FATURAS DE CARTÃO
  if (data.cardBills && data.cardBills.length > 0) {
    data.cardBills.forEach((bill, index) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      // Nome do Cartão - Parsear o mês corretamente
      const [year, month] = bill.billMonth.split("-").map(Number);
      const billDate = new Date(year, month - 1, 1); // month - 1 porque JS usa 0-11
      const monthName = billDate.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text(`${getTextIcon("card")} ${bill.cardName} - Fatura de ${monthName}`, 15, yPosition);

      yPosition += 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...secondaryColor);
      doc.text(
        `${bill.transactions.length} transacao(oes) | Fecha dia ${
          bill.closingDay
        } | Total: ${formatCurrency(bill.total)}`,
        15,
        yPosition
      );

      yPosition += 5;

      // Tabela de transações do cartão
      const cardTransactionRows = bill.transactions.map((t) => [
        new Date(t.date).toLocaleDateString("pt-BR"),
        sanitizeText(t.description || "Sem descricao"),
        t.category ? sanitizeText(t.category.name) : "Sem categoria",
        formatCurrency(t.amount),
        t.isReimbursed ? "Pago" : "Pendente",
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Data", "Descricao", "Categoria", "Valor", "Status"]],
        body: cardTransactionRows,
        theme: "plain",
        headStyles: {
          fillColor: [245, 245, 245],
          textColor: [0, 0, 0],
          fontSize: 8,
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [60, 60, 60],
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 60 },
          2: { cellWidth: 35 },
          3: { cellWidth: 28, halign: "right" },
          4: { cellWidth: 20, halign: "center" },
        },
        margin: { left: 15, right: 15 },
        didDrawCell: (data) => {
          // Linha separadora entre transações
          if (data.section === "body" && data.column.index === 0) {
            doc.setDrawColor(230, 230, 230);
          }
        },
      });

      // @ts-ignore
      yPosition = doc.lastAutoTable.finalY + 10;
    });
  }

  // GASTOS DIRETOS (PIX, Transferência, etc)
  if (data.directTransactions && data.directTransactions.length > 0) {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(`${getTextIcon("pix")} Gastos Diretos (PIX / Transferencia)`, 15, yPosition);

    yPosition += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text(
      `${data.directTransactions.length} transacao(oes) | Total: ${formatCurrency(
        data.totalDirect || 0
      )}`,
      15,
      yPosition
    );

    yPosition += 5;

    // Tabela de gastos diretos
    const directTransactionRows = data.directTransactions.map((t) => [
      new Date(t.date).toLocaleDateString("pt-BR"),
      sanitizeText(t.description || "Sem descricao"),
      t.category ? sanitizeText(t.category.name) : "Sem categoria",
      formatCurrency(t.amount),
      t.isReimbursed ? "Pago" : "Pendente",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Data", "Descricao", "Categoria", "Valor", "Status"]],
      body: directTransactionRows,
      theme: "plain",
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 60 },
        2: { cellWidth: 35 },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 20, halign: "center" },
      },
      margin: { left: 15, right: 15 },
    });

    // @ts-ignore
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // EMPRÉSTIMOS
  if (data.loans && data.loans.length > 0) {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(`[Emprestimos] Gestao de Dividas`, 15, yPosition);

    yPosition += 5;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text(
      `${data.loans.length} emprestimo(s) | Total: ${formatCurrency(
        data.totalLoans || 0
      )} | Restante: ${formatCurrency(data.totalLoansRemaining || 0)}`,
      15,
      yPosition
    );

    yPosition += 5;

    // Tabela de empréstimos
    const loanRows = data.loans.map((loan) => {
      const isLent = loan.type === "LENT";
      const progress =
        loan.totalAmount > 0 ? ((loan.paidAmount / loan.totalAmount) * 100).toFixed(0) : "0";

      return [
        sanitizeText(loan.description || (isLent ? "Emprestei" : "Peguei emprestado")),
        isLent ? "Emprestei" : "Devo",
        formatCurrency(loan.totalAmount),
        formatCurrency(loan.paidAmount),
        formatCurrency(loan.remainingAmount),
        `${progress}%`,
        loan.status === "PAID" ? "Pago" : loan.status === "PARTIAL" ? "Parcial" : "Pendente",
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [["Descricao", "Tipo", "Total", "Pago", "Restante", "Progresso", "Status"]],
      body: loanRows,
      theme: "plain",
      headStyles: {
        fillColor: [245, 245, 245],
        textColor: [0, 0, 0],
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 20, halign: "center" },
        6: { cellWidth: 20, halign: "center" },
      },
      margin: { left: 15, right: 15 },
    });

    // @ts-ignore
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // ====================
  // FOOTER
  // ====================
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text("Gerado por Poupai - Sistema de Gestão Financeira", pageWidth / 2, pageHeight - 5, {
      align: "center",
    });
  }

  // ====================
  // SALVAR PDF
  // ====================
  const fileName = `gastos-${data.personName.toLowerCase().replace(/\s+/g, "-")}-${
    new Date().toISOString().split("T")[0]
  }.pdf`;

  doc.save(fileName);
}

/**
 * Gera PDF consolidado de todas as pessoas
 */
export function generateAllPeopleExpensesPDF(peopleData: PersonExpenseData[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const primaryColor: [number, number, number] = [79, 70, 229];
  const secondaryColor: [number, number, number] = [100, 100, 100];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Poupai", 15, 15);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório Consolidado - Gastos por Pessoa", 15, 25);

  let yPosition = 50;

  // Resumo Geral
  const totalGeral = peopleData.reduce((sum, p) => sum + p.total, 0);
  const totalPendente = peopleData.reduce((sum, p) => sum + p.totalPending, 0);
  const totalReembolsado = peopleData.reduce((sum, p) => sum + p.totalReimbursed, 0);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Geral", 15, yPosition);

  yPosition += 10;

  const summaryRows = peopleData.map((person) => [
    person.personName,
    person.transactionCount.toString(),
    formatCurrency(person.total),
    formatCurrency(person.totalPending),
    formatCurrency(person.totalReimbursed),
  ]);

  summaryRows.push([
    "TOTAL",
    peopleData.reduce((sum, p) => sum + p.transactionCount, 0).toString(),
    formatCurrency(totalGeral),
    formatCurrency(totalPendente),
    formatCurrency(totalReembolsado),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Pessoa", "Transações", "Total", "Pendente", "Reembolsado"]],
    body: summaryRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
    },
    foot: [[{ content: "", colSpan: 5, styles: { fontStyle: "bold" } }]],
    columnStyles: {
      0: { cellWidth: 50, fontStyle: "bold" },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
    margin: { left: 15, right: 15 },
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text(
    `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString(
      "pt-BR"
    )}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // Salvar
  const fileName = `relatorio-consolidado-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
