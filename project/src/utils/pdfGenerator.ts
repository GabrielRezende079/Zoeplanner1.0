import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ReportData {
  selectedMonth: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyPaidExpenses: number;
  monthlyTithes: number;
  monthlyOfferings: number;
  monthlyGiving: number;
  monthlyBalance: number;
  monthlyNetBalance: number;
  tithePercentage: number;
  expenseCategories: { name: string; value: number }[];
  transactions: any[];
  tithingRecords: any[];
  goals: any[];
}

export const generatePDFReport = (data: ReportData) => {
  const doc = new jsPDF();
  
  // Set up fonts and colors
  const primaryColor = [143, 168, 75]; // olive-600
  const secondaryColor = [56, 137, 204]; // azure-600
  const goldColor = [245, 201, 53]; // gold-500
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  // Logo and title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ZoePlanner', 20, 20);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Financeiro Cristão', 20, 26);
  
  // Date and period
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  const currentDate = new Date().toLocaleDateString('pt-BR');
  doc.text(`Gerado em: ${currentDate}`, 150, 20);
  doc.text(`Período: ${formatMonthName(data.selectedMonth)}`, 150, 26);
  
  let yPosition = 45;
  
  // Scripture verse
  doc.setFillColor(245, 245, 220); // Light background
  doc.rect(15, yPosition - 5, 180, 15, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('"Trazei todos os dízimos à casa do tesouro..." (Malaquias 3:10)', 20, yPosition + 5);
  
  yPosition += 25;
  
  // Financial Summary Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro', 20, yPosition);
  yPosition += 10;
  
  // Summary table
  const summaryData = [
    ['Receitas', `R$ ${data.monthlyIncome.toLocaleString('pt-BR')}`],
    ['Despesas Transações', `R$ ${data.monthlyExpenses.toLocaleString('pt-BR')}`],
    ['Despesas Pagas', `R$ ${data.monthlyPaidExpenses.toLocaleString('pt-BR')}`],
    ['Total de Despesas', `R$ ${(data.monthlyExpenses + data.monthlyPaidExpenses).toLocaleString('pt-BR')}`],
    ['Dízimos', `R$ ${data.monthlyTithes.toLocaleString('pt-BR')}`],
    ['Ofertas/Votos', `R$ ${data.monthlyOfferings.toLocaleString('pt-BR')}`],
    ['Total Dízimos e Ofertas', `R$ ${data.monthlyGiving.toLocaleString('pt-BR')}`],
    ['Saldo Bruto', `R$ ${data.monthlyBalance.toLocaleString('pt-BR')}`],
    ['Saldo Líquido', `R$ ${data.monthlyNetBalance.toLocaleString('pt-BR')}`]
  ];
  
  doc.autoTable({
    startY: yPosition,
    head: [['Categoria', 'Valor']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 20, right: 20 }
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Tithe Fidelity Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Fidelidade nos Dízimos', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Percentual de dízimo: ${data.tithePercentage.toFixed(1)}%`, 20, yPosition);
  yPosition += 6;
  
  const fidelityMessage = data.tithePercentage >= 10 
    ? 'Parabéns! Você está sendo fiel nos dízimos conforme a orientação bíblica.'
    : 'Considere ajustar seus dízimos para alcançar os 10% recomendados biblicamente.';
  
  doc.setTextColor(...(data.tithePercentage >= 10 ? [34, 197, 94] : [239, 68, 68]));
  doc.text(fidelityMessage, 20, yPosition);
  doc.setTextColor(0, 0, 0);
  yPosition += 15;
  
  // Expense Categories Section
  if (data.expenseCategories.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Despesas por Categoria', 20, yPosition);
    yPosition += 10;
    
    const categoryData = data.expenseCategories.map(cat => [
      cat.name,
      `R$ ${cat.value.toLocaleString('pt-BR')}`,
      `${((cat.value / data.monthlyExpenses) * 100).toFixed(1)}%`
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Categoria', 'Valor', '% do Total']],
      body: categoryData,
      theme: 'grid',
      headStyles: { fillColor: secondaryColor, textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  // Goals Section
  if (data.goals.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Metas em Progresso', 20, yPosition);
    yPosition += 10;
    
    const goalsData = data.goals.map(goal => [
      goal.title,
      getCategoryLabel(goal.category),
      `R$ ${goal.current_amount.toLocaleString('pt-BR')}`,
      `R$ ${goal.target_amount.toLocaleString('pt-BR')}`,
      `${Math.round((goal.current_amount / goal.target_amount) * 100)}%`
    ]);
    
    doc.autoTable({
      startY: yPosition,
      head: [['Meta', 'Categoria', 'Atual', 'Objetivo', 'Progresso']],
      body: goalsData,
      theme: 'grid',
      headStyles: { fillColor: goldColor, textColor: 0 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }
  
  // Spiritual Assessment Section
  if (yPosition > 220) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Avaliação Espiritual', 20, yPosition);
  yPosition += 10;
  
  // Fidelity assessment
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Fidelidade Financeira:', 20, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  const fidelityText = data.tithePercentage >= 10 
    ? 'Parabéns por sua fidelidade nos dízimos! Você está honrando a Deus com suas finanças.'
    : 'Lembre-se que o dízimo representa nossa gratidão e reconhecimento de que tudo vem de Deus.';
  
  const splitFidelity = doc.splitTextToSize(fidelityText, 170);
  doc.text(splitFidelity, 20, yPosition);
  yPosition += splitFidelity.length * 5 + 8;
  
  // Generosity assessment
  doc.setFont('helvetica', 'bold');
  doc.text('Generosidade:', 20, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  const generosityText = data.monthlyOfferings > 0 
    ? 'Suas ofertas demonstram um coração generoso. Continue desenvolvendo esta virtude!'
    : 'Considere como você pode exercitar a generosidade além dos dízimos.';
  
  const splitGenerosity = doc.splitTextToSize(generosityText, 170);
  doc.text(splitGenerosity, 20, yPosition);
  yPosition += splitGenerosity.length * 5 + 8;
  
  // Stewardship assessment
  doc.setFont('helvetica', 'bold');
  doc.text('Mordomia:', 20, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  const stewardshipText = data.monthlyNetBalance >= 0 
    ? 'Você está administrando bem seus recursos, mantendo suas finanças equilibradas mesmo após dízimos e ofertas.'
    : 'Este mês apresenta um déficit após dízimos e ofertas. Considere ajustes em seu orçamento para melhor equilíbrio.';
  
  const splitStewardship = doc.splitTextToSize(stewardshipText, 170);
  doc.text(splitStewardship, 20, yPosition);
  yPosition += splitStewardship.length * 5 + 15;
  
  // Action Items
  doc.setFont('helvetica', 'bold');
  doc.text('Passos para o Próximo Mês:', 20, yPosition);
  yPosition += 8;
  
  doc.setFont('helvetica', 'normal');
  let stepNumber = 1;
  
  if (data.monthlyNetBalance < 0) {
    doc.text(`${stepNumber}. Revise seus gastos e identifique áreas para redução de despesas.`, 25, yPosition);
    yPosition += 6;
    stepNumber++;
  }
  
  if (data.tithePercentage < 10) {
    doc.text(`${stepNumber}. Considere ajustar seus dízimos para alcançar os 10% recomendados.`, 25, yPosition);
    yPosition += 6;
    stepNumber++;
  }
  
  doc.text(`${stepNumber}. Reserve um tempo para orar sobre suas finanças e buscar sabedoria divina.`, 25, yPosition);
  yPosition += 6;
  stepNumber++;
  
  doc.text(`${stepNumber}. Avalie o progresso de suas metas e faça ajustes conforme necessário.`, 25, yPosition);
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`ZoePlanner - Planejamento Financeiro Cristão | Página ${i} de ${pageCount}`, 20, 290);
    doc.text('"Planeje com propósito. Administre com fé."', 150, 290);
  }
  
  // Save the PDF
  const fileName = `ZoePlanner_Relatorio_${data.selectedMonth.replace('-', '_')}.pdf`;
  doc.save(fileName);
};

// Helper functions
const formatMonthName = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'mission': return 'Missões';
    case 'personal': return 'Pessoal';
    case 'study': return 'Estudos';
    case 'debt': return 'Dívidas';
    case 'giving': return 'Generosidade';
    default: return category;
  }
};