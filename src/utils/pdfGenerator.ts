import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Transaction {
  id: string;
  description: string | null;
  amount: number;
  date: Date | string;
  isReimbursed: boolean;
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
}

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
 * Gera PDF com relatório de gastos de uma pessoa
 */
export function generatePersonExpensesPDF(data: PersonExpenseData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Cores
  const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo
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
  doc.text("Relatório de Gastos por Pessoa", 15, 25);

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
  // GASTOS POR CATEGORIA
  // ====================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Gastos por Categoria", 15, yPosition);

  yPosition += 5;

  // Tabela de categorias
  const categoryRows = data.categories.map((cat) => [
    `${cat.icon} ${cat.name}`,
    cat.transactions.length.toString(),
    formatCurrency(cat.spent),
    `${cat.percentage.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Categoria", "Transações", "Total", "% do Total"]],
    body: categoryRows,
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
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 30, halign: "right" },
    },
    margin: { left: 15, right: 15 },
  });

  // @ts-ignore - autoTable adiciona finalY
  yPosition = doc.lastAutoTable.finalY + 15;

  // ====================
  // DETALHAMENTO DE TRANSAÇÕES
  // ====================
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Detalhamento de Transações", 15, yPosition);

  yPosition += 5;

  // Agrupar todas as transações
  const allTransactions: Array<{
    date: string;
    description: string;
    category: string;
    amount: string;
    status: string;
  }> = [];

  data.categories.forEach((category) => {
    category.transactions.forEach((transaction) => {
      allTransactions.push({
        date: new Date(transaction.date).toLocaleDateString("pt-BR"),
        description: transaction.description || "Sem descrição",
        category: `${category.icon} ${category.name}`,
        amount: formatCurrency(transaction.amount),
        status: transaction.isReimbursed ? "✓ Pago" : "⏳ Pendente",
      });
    });
  });

  // Ordenar por data (mais recente primeiro)
  allTransactions.sort((a, b) => {
    const dateA = new Date(a.date.split("/").reverse().join("-"));
    const dateB = new Date(b.date.split("/").reverse().join("-"));
    return dateB.getTime() - dateA.getTime();
  });

  const transactionRows = allTransactions.map((t) => [
    t.date,
    t.description,
    t.category,
    t.amount,
    t.status,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Data", "Descrição", "Categoria", "Valor", "Status"]],
    body: transactionRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 40 },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 25, halign: "center" },
    },
    margin: { left: 15, right: 15 },
  });

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
