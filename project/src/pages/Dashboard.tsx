import React, { useState } from "react";
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Heart,
  Target,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRightLeft,
} from "lucide-react";
import { useFinance } from "../stores/financeStore";
import { useBanks } from "../stores/banksStore";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import CustomSelect from "../components/CustomSelect";

const Dashboard: React.FC = () => {
  const {
    transactions,
    expenses,
    getTotalIncome,
    getTotalExpenses,
    getTotalGiving,
    getBalance,
    getNetBalance,
    getMonthlyExpenses,
    goals,
    tithingRecords,
    loadUserData,
  } = useFinance();
  const { banks, loadBanksData, isDataLoaded: isBanksDataLoaded } = useBanks();

  // Month filter state
  const [monthsToShow, setMonthsToShow] = useState(6);

  // Load banks and finance data on mount
  React.useEffect(() => {
    loadUserData();
    if (!isBanksDataLoaded) {
      loadBanksData();
    }
  }, [isBanksDataLoaded, loadBanksData, loadUserData]);

  // Get current month for filtering
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Calculate CURRENT MONTH metrics only
  const currentMonthIncome = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthTransactionExpenses = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthDedicatedExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  const currentMonthTotalExpenses =
    currentMonthTransactionExpenses + currentMonthDedicatedExpenses;

  const currentMonthTithingRecords = tithingRecords
    .filter((r) => r.date.startsWith(currentMonth))
    .reduce((sum, r) => sum + r.amount, 0);

  // Calculate tithe percentage based on current month income
  const currentMonthTithePercentage =
    currentMonthIncome > 0
      ? (currentMonthTithingRecords / currentMonthIncome) * 100
      : 0;

  // GENERAL accumulated balance (all time)
  const generalNetBalance = React.useMemo(() => {
    // Usar o método getNetBalance que agora calcula com base nos saldos dos bancos
    return getNetBalance();
  }, [
    expenses,
    transactions,
    tithingRecords,
    getTotalIncome,
    getTotalExpenses,
    getTotalGiving,
  ]);

  // Current month balance
  const currentMonthBalance =
    currentMonthIncome - currentMonthTotalExpenses - currentMonthTithingRecords;

  // Recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Recent expenses (last 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get current month paid expenses only
  const monthlyPaidExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth) && e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);

  // Get current month expenses from dedicated expenses tab
  const monthlyExpensesFromExpenseTab = getMonthlyExpenses(currentMonth);

  // Expense categories combining both sources (current month only)
  const expenseCategoriesFromTransactions = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
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

  const expenseCategoriesFromExpenses = expenses
    .filter((e) => e.date.startsWith(currentMonth))
    .reduce((acc, expense) => {
      const existingCategory = acc.find(
        (item) => item.name === expense.category
      );
      if (existingCategory) {
        existingCategory.value += expense.amount;
      } else {
        acc.push({ name: expense.category, value: expense.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  // Combine categories from both sources (current month only)
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

  // Sort by value (highest first) and round values
  const categoryData = combinedExpenseCategories
    .map((category) => ({
      ...category,
      value: Math.round(category.value * 100) / 100, // Round to 2 decimal places
    }))
    .sort((a, b) => b.value - a.value);

  // Enhanced financial summary with current month data - rounded values and shorter names
  const financialSummary = [
    {
      name: "Receitas",
      value: Math.round(currentMonthIncome * 100) / 100,
      fill: "#8fa84b",
    },
    {
      name: "Despesas",
      value: Math.round(currentMonthTransactionExpenses * 100) / 100,
      fill: "#e77c64",
    },
    {
      name: "Dedicadas",
      value: Math.round(currentMonthDedicatedExpenses * 100) / 100,
      fill: "#f97316",
    },
    {
      name: "Dízimos",
      value: Math.round(currentMonthTithingRecords * 100) / 100,
      fill: "#f5c935",
    },
  ];

  // Monthly trend data with configurable months - rounded values
  const getMonthlyTrend = (months: number) => {
    const monthsData = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString("pt-BR", { month: "short" });

      // Income for the month
      const monthlyIncome = transactions
        .filter((t) => t.type === "income" && t.date.startsWith(monthKey))
        .reduce((sum, t) => sum + t.amount, 0);

      // Transaction expenses for the month
      const monthlyTransactionExpenses = transactions
        .filter((t) => t.type === "expense" && t.date.startsWith(monthKey))
        .reduce((sum, t) => sum + t.amount, 0);

      // Dedicated expenses for the month
      const monthlyDedicatedExpenses = expenses
        .filter((e) => e.date.startsWith(monthKey))
        .reduce((sum, e) => sum + e.amount, 0);

      // Tithing for the month
      const monthlyTithing = tithingRecords
        .filter((r) => r.date.startsWith(monthKey))
        .reduce((sum, r) => sum + r.amount, 0);

      const totalMonthlyExpenses =
        monthlyTransactionExpenses + monthlyDedicatedExpenses;
      const monthlySaldo =
        monthlyIncome - totalMonthlyExpenses - monthlyTithing;

      monthsData.push({
        month: monthName,
        receitas: Math.round(monthlyIncome * 100) / 100,
        despesas: Math.round(totalMonthlyExpenses * 100) / 100,
        dizimos: Math.round(monthlyTithing * 100) / 100,
        saldo: Math.round(monthlySaldo * 100) / 100,
      });
    }

    return monthsData;
  };

  const monthlyTrendData = getMonthlyTrend(monthsToShow);

  // Colors for pie chart
  const COLORS = [
    "#8fa84b",
    "#3889cc",
    "#f5c935",
    "#e77c64",
    "#9f86c0",
    "#f97316",
  ];

  // Calculate total for percentage calculation
  const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0);

  // Create legend data with percentages
  const legendData = categoryData.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length],
    percentage:
      totalExpenses > 0
        ? ((item.value / totalExpenses) * 100).toFixed(1)
        : "0.0",
  }));

  // Create legend data for financial summary chart
  const financialSummaryLegendData = financialSummary.map((item) => ({
    ...item,
    color: item.fill, // Use the fill color as the legend color
    percentage:
      financialSummary.reduce((sum, i) => sum + i.value, 0) > 0
        ? (
            (item.value /
              financialSummary.reduce((sum, i) => sum + i.value, 0)) *
            100
          ).toFixed(1)
        : "0.0",
  }));

  // Expense status summary - rounded values (current month only)
  const paidExpenses =
    Math.round(
      expenses
        .filter((e) => e.date.startsWith(currentMonth) && e.status === "paid")
        .reduce((sum, e) => sum + e.amount, 0) * 100
    ) / 100;
  const pendingExpenses =
    Math.round(
      expenses
        .filter(
          (e) => e.date.startsWith(currentMonth) && e.status === "pending"
        )
        .reduce((sum, e) => sum + e.amount, 0) * 100
    ) / 100;

  // Month filter options
  const monthFilterOptions = [
    { value: "3", label: "Últimos 3 meses" },
    { value: "6", label: "Últimos 6 meses" },
    { value: "12", label: "Últimos 12 meses" },
    { value: "24", label: "Últimos 24 meses" },
  ];

  // Custom tooltip formatter for better value display - FIXED
  const formatTooltipValue = (value: any, name: string) => {
    const numValue = typeof value === "number" ? value : parseFloat(value) || 0;
    return [
      `R$ ${numValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      name,
    ];
  };

  // Y-axis formatter for better readability
  const formatYAxisValue = (value: any) => {
    const numValue = typeof value === "number" ? value : parseFloat(value) || 0;
    if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(0)}k`;
    }
    return numValue.toFixed(0);
  };

  // Custom Tooltip Component for better formatting
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

  return (
    <div className="space-y-8">
      {/* Header com gradiente, ícone e sombra */}
      <div className="relative overflow-hidden bg-gradient-to-r from-olive-50 via-azure-50 to-gold-50 rounded-2xl p-6 border border-olive-200 shadow-lg mb-2">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-olive-400 via-azure-500 to-gold-500"></div>
        <div className="absolute top-4 right-4 opacity-20">
          <BarChart3 className="h-16 w-16 text-olive-400" />
        </div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-700">
                Resumo financeiro e visão geral do seu planejamento
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                to="/expenses"
                className="px-4 py-2 bg-azure-600 hover:bg-azure-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center"
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                Nova Despesa
              </Link>
              <Link
                to="/transactions"
                className="px-4 py-2 bg-olive-600 hover:bg-olive-700 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center justify-center"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Transação
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Current Month Indicator */}
      <div className="bg-gradient-to-r from-olive-50 via-azure-50 to-gold-50 border-l-4 border-olive-400 p-4 rounded-r-lg shadow-md">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-olive-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-olive-800">
              Dados do Mês Atual
            </h3>
            <p className="text-sm text-olive-700">
              Mostrando informações de{" "}
              <span className="font-medium">
                {new Date().toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              . O saldo líquido representa seu saldo geral acumulado.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Stats cards - Improved layout for better text visibility */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <Link
          to="/transactions"
          className="card p-4 hover:bg-gray-50 rounded-lg transition"
        >
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-olive-100 flex items-center justify-center shadow-sm flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-olive-600" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-600">
                Receitas do Mês
              </h3>
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-800">
            R$ {currentMonthIncome.toLocaleString("pt-BR")}
          </p>
        </Link>

        <Link
          to="/transactions"
          className="card p-4 hover:bg-gray-50 rounded-lg transition"
        >
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shadow-sm flex-shrink-0">
              <ArrowRightLeft className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-600">
                Despesas Transações
              </h3>
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-800">
            R$ {currentMonthTransactionExpenses.toLocaleString("pt-BR")}
          </p>
        </Link>

        <Link
          to="/expenses"
          className="card p-4 hover:bg-gray-50 rounded-lg transition"
        >
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shadow-sm flex-shrink-0">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-600">
                Total Despesas
              </h3>
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-800">
            R$ {currentMonthTotalExpenses.toLocaleString("pt-BR")}
          </p>
        </Link>

        <Link
          to="/expenses"
          className="card p-4 hover:bg-gray-50 rounded-lg transition"
        >
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shadow-sm flex-shrink-0">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-600">
                Despesas do Mês
              </h3>
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-800">
            R$ {monthlyExpensesFromExpenseTab.toLocaleString("pt-BR")}
          </p>
          <div className="flex items-center mt-2">
            <CheckCircle className="h-3 w-3 text-green-600 mr-1 flex-shrink-0" />
            <span className="text-xs text-green-600">
              R$ {monthlyPaidExpenses.toLocaleString("pt-BR")} pagas
            </span>
          </div>
        </Link>

        <Link
          to="/tithing"
          className="card p-4 hover:bg-gray-50 rounded-lg transition"
        >
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-gold-100 flex items-center justify-center shadow-sm flex-shrink-0">
              <Heart className="h-5 w-5 text-gold-600" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-600">
                Dízimos do Mês
              </h3>
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-800">
            R$ {currentMonthTithingRecords.toLocaleString("pt-BR")}
          </p>
          <div className="flex items-center mt-2">
            <span className="text-xs text-gold-600">
              {currentMonthTithePercentage.toFixed(1)}% da receita
            </span>
          </div>
        </Link>

        <Link
          to="/reports"
          className="card p-4 hover:bg-gray-50 rounded-lg transition"
        >
          <div className="flex items-center mb-3">
            <div
              className={`h-10 w-10 rounded-full ${
                generalNetBalance >= 0 ? "bg-green-100" : "bg-red-100"
              } flex items-center justify-center shadow-sm flex-shrink-0`}
            >
              <BarChart3
                className={`h-5 w-5 ${
                  generalNetBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-600">Saldo Geral</h3>
            </div>
          </div>
          <p
            className={`text-xl font-semibold ${
              generalNetBalance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            R$ {generalNetBalance.toLocaleString("pt-BR")}
          </p>
        </Link>
      </div>

      {/* Balance explanation with enhanced info */}
      {currentMonthTithingRecords > 0 && (
        <div className="explanation-banner">
          <div className="flex items-start">
            <Heart className="h-5 w-5 text-gold-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-gold-800 mb-1">
                Visão Financeira do Mês Atual
              </h3>
              <p className="text-sm text-gold-700">
                <span className="font-medium">
                  Receitas do mês: R${" "}
                  {currentMonthIncome.toLocaleString("pt-BR")}
                </span>
                .
                <span className="font-medium">
                  {" "}
                  Despesas do mês: R${" "}
                  {currentMonthTotalExpenses.toLocaleString("pt-BR")}
                </span>
                .
                <span className="font-medium">
                  {" "}
                  Dízimos do mês: R${" "}
                  {currentMonthTithingRecords.toLocaleString("pt-BR")} (
                  {currentMonthTithePercentage.toFixed(1)}% da receita)
                </span>
                .
                <span className="font-medium">
                  {" "}
                  Saldo do mês: R$ {currentMonthBalance.toLocaleString("pt-BR")}
                </span>
                .
                <span className="font-medium">
                  {" "}
                  Saldo geral: R$ {generalNetBalance.toLocaleString("pt-BR")}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pending expenses alert */}
      {pendingExpenses > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-orange-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-orange-800">
                Despesas Pendentes do Mês
              </h3>
              <p className="text-sm text-orange-700">
                Você tem{" "}
                <span className="font-medium">
                  R$ {pendingExpenses.toLocaleString("pt-BR")}
                </span>{" "}
                em despesas pendentes de pagamento neste mês.
                <Link
                  to="/expenses"
                  className="ml-2 text-orange-800 underline hover:text-orange-900"
                >
                  Ver detalhes →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Charts section with better mobile layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <h2 className="section-title mb-4">
            Despesas por Categoria (Mês Atual)
          </h2>
          <div className="h-72">
            {categoryData.length > 0 ? (
              <div className="flex flex-col h-full">
                {/* Pie Chart */}
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Custom Horizontal Legend */}
                <div className="mt-4 max-h-32 overflow-y-auto">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                    {legendData.map((item, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <div
                          className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-gray-700 mr-1">{item.name}</span>
                        <span className="font-medium text-gray-900 mr-1">
                          {item.percentage}%
                        </span>
                        <span className="text-gray-600">
                          (R$ {item.value.toLocaleString("pt-BR")})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Nenhuma despesa registrada neste mês
              </div>
            )}
          </div>
        </div>

        <div className="chart-container">
          <h2 className="section-title mb-4">Resumo Financeiro do Mês</h2>
          <div className="h-72">
            <div className="flex flex-col h-full">
              {/* Bar Chart */}
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={financialSummary}
                    margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      tick={false}
                      axisLine={false}
                      tickLine={false}
                      height={0}
                    />
                    <YAxis
                      tickFormatter={formatYAxisValue}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {financialSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Horizontal Legend for Financial Summary */}
              <div className="mt-4 max-h-20 overflow-y-auto">
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
                  {financialSummaryLegendData.map((item, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <div
                        className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-700 mr-1">{item.name}</span>
                      <span className="font-medium text-gray-900 mr-1">
                        {item.percentage}%
                      </span>
                      <span className="text-gray-600">
                        (R$ {item.value.toLocaleString("pt-BR")})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart with Time Filter */}
      <div className="chart-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="section-title mb-2 sm:mb-0">Tendência Mensal</h2>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <CustomSelect
              value={monthsToShow.toString()}
              onChange={(value) => setMonthsToShow(parseInt(value))}
              options={monthFilterOptions}
              className="min-w-[160px]"
            />
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyTrendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tickFormatter={formatYAxisValue} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "10px",
                }}
              />
              <Line
                type="monotone"
                dataKey="receitas"
                stroke="#8fa84b"
                strokeWidth={3}
                name="Receitas"
                dot={{ fill: "#8fa84b", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="despesas"
                stroke="#e77c64"
                strokeWidth={3}
                name="Despesas Totais"
                dot={{ fill: "#e77c64", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="dizimos"
                stroke="#f5c935"
                strokeWidth={2}
                name="Dízimos/Ofertas"
                dot={{ fill: "#f5c935", strokeWidth: 2, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="saldo"
                stroke="#3889cc"
                strokeWidth={3}
                name="Saldo Líquido"
                dot={{ fill: "#3889cc", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Transações Recentes</h2>
            <Link
              to="/transactions"
              className="text-olive-600 hover:text-olive-700 text-sm font-medium"
            >
              Ver todas
            </Link>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 break-words">
                    {transaction.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <span className="text-sm text-gray-500">
                      {transaction.category}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        transaction.payment_type === "pix"
                          ? "bg-green-100 text-green-800"
                          : transaction.payment_type === "credito"
                          ? "bg-red-100 text-red-800"
                          : transaction.payment_type === "debito"
                          ? "bg-blue-100 text-blue-800"
                          : transaction.payment_type === "boleto"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {transaction.payment_type === "pix" && "PIX"}
                      {transaction.payment_type === "credito" && "Crédito"}
                      {transaction.payment_type === "debito" && "Débito"}
                      {transaction.payment_type === "moeda" && "Dinheiro"}
                      {transaction.payment_type === "boleto" && "Boleto"}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString("pt-BR")}
                    </span>
                    {transaction.destination_bank_id && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {(() => {
                            const bank = banks.find(
                              (b) => b.id === transaction.destination_bank_id
                            );
                            return bank ? bank.name : "Banco";
                          })()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={`font-semibold flex-shrink-0 text-right ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"} R${" "}
                  {transaction.amount.toLocaleString("pt-BR")}
                </span>
              </div>
            ))}

            {recentTransactions.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Nenhuma transação registrada
              </div>
            )}
          </div>
        </div>

        {/* Recent expenses */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Despesas Recentes</h2>
            <Link
              to="/expenses"
              className="text-olive-600 hover:text-olive-700 text-sm font-medium"
            >
              Ver todas
            </Link>
          </div>

          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800 break-words">
                    {expense.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <span className="text-sm text-gray-500">
                      {expense.category}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {expense.date.split("-").reverse().join("/")}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        expense.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {expense.status === "paid" ? "Pago" : "Pendente"}
                    </span>
                  </div>
                </div>
                <span className="font-semibold text-red-600 flex-shrink-0 text-right">
                  R$ {expense.amount.toLocaleString("pt-BR")}
                </span>
              </div>
            ))}

            {recentExpenses.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Nenhuma despesa registrada
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goals section */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Metas em Progresso</h2>
          <Link
            to="/goals"
            className="text-olive-600 hover:text-olive-700 text-sm font-medium"
          >
            Ver todas
          </Link>
        </div>

        <div className="space-y-4">
          {goals.slice(0, 2).map((goal) => (
            <div key={goal.id} className="goal-card">
              <div className="flex justify-between items-start mb-2 gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-800 break-words">
                    {goal.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Meta: R$ {goal.target_amount.toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="bg-olive-100 text-olive-800 text-xs px-2 py-1 rounded-full shadow-sm flex-shrink-0">
                  {goal.category === "mission" && "Missões"}
                  {goal.category === "personal" && "Pessoal"}
                  {goal.category === "study" && "Estudos"}
                  {goal.category === "debt" && "Dívidas"}
                  {goal.category === "giving" && "Generosidade"}
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill bg-olive-600"
                  style={{
                    width: `${
                      (goal.current_amount / goal.target_amount) * 100
                    }%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>R$ {goal.current_amount.toLocaleString("pt-BR")}</span>
                <span>
                  {Math.round((goal.current_amount / goal.target_amount) * 100)}
                  %
                </span>
              </div>
            </div>
          ))}

          {goals.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Você ainda não tem metas definidas.
            </div>
          )}
        </div>
      </div>

      {/* Scripture inspiration */}
      <div className="scripture">
        "Porque onde estiver o vosso tesouro, aí estará também o vosso coração."
        (Mateus 6:21)
      </div>
    </div>
  );
};

export default Dashboard;
