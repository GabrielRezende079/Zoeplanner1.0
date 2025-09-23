import React, { useState } from "react";
import { useFinance } from "../stores/financeStore";
import {
  FileText,
  Download,
  BarChart2,
  Heart,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  Target,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CustomSelect from "../components/CustomSelect";
import { generatePDFReport } from "../utils/pdfGenerator";

const Reports: React.FC = () => {
  const { transactions, tithingRecords, goals, expenses, loadUserData } =
    useFinance();
  // Load finance data on mount
  React.useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Available months for selection - ONLY months with data + current month
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();

    // Always add current month
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}`;
    months.add(currentMonth);

    // Add months from transactions (only if they have data)
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      months.add(monthKey);
    });

    // Add months from tithing records (only if they have data)
    tithingRecords.forEach((record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      months.add(monthKey);
    });

    // Convert to array and sort (newest first)
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [transactions, tithingRecords]);

  // Filter data by selected month
  const filteredTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    return monthKey === selectedMonth;
  });

  const filteredTithingRecords = tithingRecords.filter((record) => {
    const date = new Date(record.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    return monthKey === selectedMonth;
  });

  // Calculate monthly metrics
  const monthlyIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Filter expenses by selected month and paid status
  const filteredExpenses = expenses.filter((expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    return monthKey === selectedMonth && expense.status === "paid";
  });

  const monthlyPaidExpenses = filteredExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  const monthlyTithes = filteredTithingRecords
    .filter((r) => r.type === "tithe")
    .reduce((sum, r) => sum + r.amount, 0);

  const monthlyOfferings = filteredTithingRecords
    .filter((r) => r.type === "offering" || r.type === "vow")
    .reduce((sum, r) => sum + r.amount, 0);

  const monthlyGiving = monthlyTithes + monthlyOfferings;
  const monthlyBalance = monthlyIncome - monthlyExpenses - monthlyPaidExpenses;
  const monthlyNetBalance =
    monthlyIncome - monthlyExpenses - monthlyPaidExpenses - monthlyGiving;

  // Tithe percentage calculation
  const tithePercentage =
    monthlyIncome > 0 ? (monthlyTithes / monthlyIncome) * 100 : 0;

  // Expense categories for pie chart
  const expenseCategoriesFromTransactions = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, transaction) => {
      const existingCategory = acc.find(
        (item) => item.name === transaction.category
      );
      if (existingCategory) {
        existingCategory.value += transaction.amount;
      } else {
        acc.push({ name: transaction.category, value: transaction.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  const expenseCategoriesFromExpenses = filteredExpenses.reduce(
    (acc, expense) => {
      const existingCategory = acc.find(
        (item) => item.name === expense.category
      );
      if (existingCategory) {
        existingCategory.value += expense.amount;
      } else {
        acc.push({ name: expense.category, value: expense.amount });
      }
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  // Combine categories from both sources
  const combinedExpenseCategories = [...expenseCategoriesFromTransactions];
  expenseCategoriesFromExpenses.forEach((expenseCategory) => {
    const existingCategory = combinedExpenseCategories.find(
      (item) => item.name === expenseCategory.name
    );
    if (existingCategory) {
      existingCategory.value += expenseCategory.value;
    } else {
      combinedExpenseCategories.push(expenseCategory);
    }
  });

  const expenseCategories = combinedExpenseCategories.sort(
    (a, b) => b.value - a.value
  );

  // Income vs Expense data for bar chart - ROUNDED VALUES
  const incomeVsExpenseData = [
    { name: "Receitas", value: Math.round(monthlyIncome * 100) / 100 },
    {
      name: "Despesas Transações",
      value: Math.round(monthlyExpenses * 100) / 100,
    },
    {
      name: "Despesas Pagas",
      value: Math.round(monthlyPaidExpenses * 100) / 100,
    },
    { name: "Dízimos", value: Math.round(monthlyTithes * 100) / 100 },
    { name: "Ofertas", value: Math.round(monthlyOfferings * 100) / 100 },
  ];

  // Format month name for display
  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  // Custom Tooltip Component for perfect formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: R$ ${parseFloat(entry.value).toLocaleString(
                "pt-BR",
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Generate PDF report
  const handleGenerateReport = async () => {
    try {
      setIsGeneratingPDF(true);

      const reportData = {
        selectedMonth,
        monthlyIncome,
        monthlyExpenses,
        monthlyPaidExpenses,
        monthlyTithes,
        monthlyOfferings,
        monthlyGiving,
        monthlyBalance,
        monthlyNetBalance,
        tithePercentage,
        expenseCategories,
        transactions: filteredTransactions,
        tithingRecords: filteredTithingRecords,
        goals,
      };

      generatePDFReport(reportData);

      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 4000);
    } catch (error) {
      console.error("Erro ao gerar relatório PDF:", error);
      // You could add a toast notification here instead of alert
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Options for month select - only months with data
  const monthOptions = availableMonths.map((month) => {
    const hasTransactions = transactions.some((t) => t.date.startsWith(month));
    const hasTithingRecords = tithingRecords.some((r) =>
      r.date.startsWith(month)
    );
    const isCurrentMonth =
      month ===
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
        2,
        "0"
      )}`;

    let label = formatMonthName(month);

    // Add indicators for data availability
    if (isCurrentMonth && !hasTransactions && !hasTithingRecords) {
      label += " (Mês Atual)";
    } else if (hasTransactions || hasTithingRecords) {
      const dataTypes = [];
      if (hasTransactions) dataTypes.push("transações");
      if (hasTithingRecords) dataTypes.push("dízimos");
      label += ` (${dataTypes.join(", ")})`;
    }

    return {
      value: month,
      label: label,
    };
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gold-50 via-olive-50 to-azure-50 rounded-2xl p-6 border border-gold-200 shadow-lg">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 via-olive-500 to-azure-500"></div>
        <div className="absolute top-4 right-4 opacity-20">
          <FileText className="h-16 w-16 text-gold-500" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Relatórios
            </h1>
            <p className="text-gray-700">
              Acompanhe e analise sua saúde financeira com relatórios detalhados
            </p>
          </div>
          <div className="relative">
            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingPDF}
              className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Download className="h-5 w-5 mr-2" />
              {isGeneratingPDF ? "Gerando PDF..." : "Baixar Relatório"}
            </button>
            {/* Success message */}
            {showSuccessMessage && (
              <div className="absolute top-full right-0 mt-2 bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg z-10 min-w-64">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      PDF gerado com sucesso!
                    </p>
                    <p className="text-xs text-green-600">
                      O download foi iniciado automaticamente.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Month Selection - Enhanced with data indicators */}
      <div className="card p-4 relative overflow-visible">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="section-title">Selecionar Período</h2>
        </div>

        <div className="max-w-md relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mês de Referência
          </label>
          <div className="relative z-10">
            <CustomSelect
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={monthOptions}
              placeholder="Selecione um mês"
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>
              📊 Mostrando dados de{" "}
              <span className="font-medium">
                {formatMonthName(selectedMonth)}
              </span>
            </p>
            <p>
              💡 Apenas meses com movimentação financeira ou o mês atual são
              exibidos
            </p>
            {availableMonths.length === 1 && (
              <p className="text-amber-600">
                ⚠️ Apenas o mês atual está disponível - adicione transações para
                ver mais opções
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="card p-4">
        <h2 className="section-title">
          Resumo Mensal: {formatMonthName(selectedMonth)}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="stats-card">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-full bg-olive-100 flex items-center justify-center shadow-sm">
                <TrendingUp className="h-4 w-4 text-olive-600" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">
                Receitas
              </span>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              R$ {monthlyIncome.toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="stats-card">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">
                Despesas Transações
              </span>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              R$ {monthlyExpenses.toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="stats-card">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shadow-sm">
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">
                Despesas Pagas
              </span>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              R$ {monthlyPaidExpenses.toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="stats-card">
            <div className="flex items-center mb-2">
              <div className="h-8 w-8 rounded-full bg-gold-100 flex items-center justify-center shadow-sm">
                <Heart className="h-4 w-4 text-gold-600" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">
                Dízimos/Ofertas
              </span>
            </div>
            <p className="text-xl font-semibold text-gray-800">
              R$ {monthlyGiving.toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="stats-card">
            <div className="flex items-center mb-2">
              <div
                className={`h-8 w-8 rounded-full ${
                  monthlyBalance >= 0 ? "bg-blue-100" : "bg-red-100"
                } flex items-center justify-center shadow-sm`}
              >
                <BarChart2
                  className={`h-4 w-4 ${
                    monthlyBalance >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">
                Saldo Bruto
              </span>
            </div>
            <p
              className={`text-xl font-semibold ${
                monthlyBalance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              R$ {monthlyBalance.toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="stats-card">
            <div className="flex items-center mb-2">
              <div
                className={`h-8 w-8 rounded-full ${
                  monthlyNetBalance >= 0 ? "bg-green-100" : "bg-red-100"
                } flex items-center justify-center shadow-sm`}
              >
                <BarChart2
                  className={`h-4 w-4 ${
                    monthlyNetBalance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">
                Saldo Líquido
              </span>
            </div>
            <p
              className={`text-xl font-semibold ${
                monthlyNetBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              R$ {monthlyNetBalance.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-gray-500 mt-1">(Após dízimos/ofertas)</p>
          </div>
        </div>

        {/* Balance explanation */}
        {monthlyGiving > 0 && (
          <div className="explanation-banner">
            <div className="flex items-start">
              <Heart className="h-4 w-4 text-gold-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gold-700">
                <span className="font-medium">Impacto da Fidelidade:</span> Seus
                dízimos e ofertas (R$ {monthlyGiving.toLocaleString("pt-BR")})
                foram descontados do saldo bruto, resultando no saldo líquido
                disponível.
              </p>
            </div>
          </div>
        )}

        {/* Tithe Fidelity */}
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">Fidelidade nos Dízimos</h3>
          <div className="progress-bar">
            <div
              className={`progress-fill ${
                tithePercentage >= 10 ? "bg-green-600" : "bg-olive-600"
              }`}
              style={{ width: `${Math.min(tithePercentage * 10, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span
              className={
                tithePercentage >= 10 ? "text-green-600 font-medium" : ""
              }
            >
              {tithePercentage.toFixed(1)}% de dízimo sobre a receita
            </span>
            <span>10%</span>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="chart-container">
            <h3 className="text-md font-medium mb-3">
              Receitas vs Despesas vs Dízimos/Ofertas
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" name="Valor (R$)" fill="#8fa84b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-container">
            <h3 className="text-md font-medium mb-3">Despesas por Categoria</h3>
            <div className="h-64">
              {expenseCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseCategories} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Valor (R$)" fill="#3889cc" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Nenhuma despesa registrada neste mês
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Spiritual Assessment */}
      <div className="card p-4">
        <h2 className="section-title">Avaliação Espiritual</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium mb-2">Fidelidade Financeira</h3>
            <div className="stats-card">
              <p className="text-gray-700 mb-2">
                {tithePercentage >= 10
                  ? "Parabéns por sua fidelidade nos dízimos! Você está honrando a Deus com suas finanças."
                  : "Lembre-se que o dízimo representa nossa gratidão e reconhecimento de que tudo vem de Deus."}
              </p>
              <div className="scripture">
                "Trazei todos os dízimos à casa do tesouro..." (Malaquias 3:10)
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium mb-2">Generosidade</h3>
            <div className="stats-card">
              <p className="text-gray-700 mb-2">
                {monthlyOfferings > 0
                  ? "Suas ofertas demonstram um coração generoso. Continue desenvolvendo esta virtude!"
                  : "Considere como você pode exercitar a generosidade além dos dízimos."}
              </p>
              <div className="scripture">
                "Deus ama ao que dá com alegria." (2 Coríntios 9:7)
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-md font-medium mb-2">Mordomia</h3>
            <div className="stats-card">
              <p className="text-gray-700 mb-2">
                {monthlyNetBalance >= 0
                  ? "Você está administrando bem seus recursos, mantendo suas finanças equilibradas mesmo após dízimos e ofertas."
                  : "Este mês apresenta um déficit após dízimos e ofertas. Considere ajustes em seu orçamento para melhor equilíbrio."}
              </p>
              <div className="scripture">
                "Porque a raiz de todos os males é o amor ao dinheiro..." (1
                Timóteo 6:10)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Action Items Section - Now with maximum prominence */}
      <div className="relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-azure-50 via-olive-50 to-gold-50 opacity-60 rounded-2xl"></div>

        {/* Main container with enhanced styling and fixed hover effect */}
        <div className="relative bg-white border-4 border-azure-300 rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-300">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-azure-500 via-olive-500 to-gold-500 rounded-t-2xl"></div>
          <div className="absolute top-4 right-4 text-azure-400 opacity-30">
            <Target className="h-12 w-12" />
          </div>

          {/* Header with enhanced styling */}
          <div className="flex items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-azure-500 to-olive-500 flex items-center justify-center shadow-xl mr-4">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Passos para o Próximo Mês
              </h2>
              <p className="text-azure-600 font-medium">
                Seu plano de ação personalizado baseado na análise financeira
              </p>
            </div>
          </div>

          {/* Priority indicator */}
          <div className="flex items-center mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
            <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
            <div>
              <p className="font-semibold text-orange-800">Ação Necessária</p>
              <p className="text-sm text-orange-700">
                Implementar estas recomendações pode melhorar significativamente
                sua saúde financeira
              </p>
            </div>
          </div>

          {/* Action items with enhanced styling */}
          <div className="space-y-4">
            {monthlyNetBalance < 0 && (
              <div className="group bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white text-lg font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-800 text-lg mb-2">
                      URGENTE: Equilibrar Orçamento
                    </h3>
                    <p className="text-red-700 mb-3">
                      Revise seus gastos e identifique áreas para redução de
                      despesas, mantendo a fidelidade nos dízimos.
                    </p>
                    <div className="flex items-center text-red-600 font-medium">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      <span>Prioridade Alta</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tithePercentage < 10 && (
              <div className="group bg-gradient-to-r from-gold-50 to-gold-100 border-2 border-gold-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start">
                  <div className="h-10 w-10 rounded-full bg-gold-500 flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-gray-800 text-lg font-bold">
                      {monthlyNetBalance < 0 ? "2" : "1"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gold-800 text-lg mb-2">
                      Ajustar Fidelidade nos Dízimos
                    </h3>
                    <p className="text-gold-700 mb-3">
                      Considere ajustar seus dízimos para alcançar os 10%
                      recomendados biblicamente.
                    </p>
                    <div className="flex items-center text-gold-600 font-medium">
                      <Heart className="h-4 w-4 mr-2" />
                      <span>Crescimento Espiritual</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="group bg-gradient-to-r from-olive-50 to-olive-100 border-2 border-olive-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-olive-500 flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-lg font-bold">
                    {monthlyNetBalance < 0 && tithePercentage < 10
                      ? "3"
                      : monthlyNetBalance < 0 || tithePercentage < 10
                      ? "2"
                      : "1"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-olive-800 text-lg mb-2">
                    Buscar Sabedoria Divina
                  </h3>
                  <p className="text-olive-700 mb-3">
                    Reserve um tempo para orar sobre suas finanças e buscar
                    sabedoria divina.
                  </p>
                  <div className="flex items-center text-olive-600 font-medium">
                    <Target className="h-4 w-4 mr-2" />
                    <span>Fundamento Espiritual</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="group bg-gradient-to-r from-azure-50 to-azure-100 border-2 border-azure-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-azure-500 flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-lg font-bold">
                    {monthlyNetBalance < 0 && tithePercentage < 10
                      ? "4"
                      : monthlyNetBalance < 0 || tithePercentage < 10
                      ? "3"
                      : "2"}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-azure-800 text-lg mb-2">
                    Revisar Progresso das Metas
                  </h3>
                  <p className="text-azure-700 mb-3">
                    Avalie o progresso de suas metas e faça ajustes conforme
                    necessário.
                  </p>
                  <div className="flex items-center text-azure-600 font-medium">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    <span>Planejamento Estratégico</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Scripture Inspiration Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-olive-50 via-gold-50 to-azure-50 rounded-2xl p-8 border-2 border-gold-300 shadow-xl mt-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-olive-500 via-gold-500 to-azure-500"></div>
        <div className="absolute top-4 right-4 opacity-10">
          <Lightbulb className="h-24 w-24 text-gold-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-gold-200 flex items-center justify-center mr-4 shadow-lg">
              <Target className="h-6 w-6 text-gold-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Reflexão Bíblica
              </h2>
              <p className="text-gray-700">Sobre Confiança e Planejamento</p>
            </div>
          </div>
          <div className="scripture text-lg text-gold-800 italic text-center">
            "Não vos inquieteis, pois, pelo dia de amanhã, porque o dia de
            amanhã cuidará de si mesmo. Basta a cada dia o seu mal."
          </div>
          <cite className="text-sm font-semibold text-gold-700 not-italic block text-center mt-2">
            — Mateus 6:34
          </cite>
        </div>
      </div>
    </div>
  );
};

export default Reports;
