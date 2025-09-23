import React, { useState, useMemo } from "react";
import { useFinance, Goal } from "../stores/financeStore";
import {
  PlusCircle,
  Trash2,
  Target,
  ChevronUp,
  ChevronDown,
  DollarSign,
  Calculator,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Edit3,
  Minus,
  Plus,
  X,
} from "lucide-react";
import CustomSelect from "../components/CustomSelect";
import ConfirmationModal from "../components/ConfirmationModal";

const Goals: React.FC = () => {
  const {
    goals,
    addGoal,
    updateGoalProgress,
    removeGoal,
    updateGoal,
    loadUserData,
  } = useFinance();
  // Load finance data on mount
  React.useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "personal" as Goal["category"],
    target_amount: "",
    current_amount: "0",
    deadline: "",
    notes: "",
  });

  // Update progress state
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [progressAmount, setProgressAmount] = useState("");
  const [removeAmount, setRemoveAmount] = useState("");

  // Edit state
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Goal>>({});

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    goalId: "",
    goalName: "",
    type: "delete" as "delete" | "remove-progress",
  });

  // Memoized calculations to prevent recursive calls
  const goalPredictions = useMemo(() => {
    const calculateGoalPredictions = (goal: Goal) => {
      const today = new Date();
      const deadline = new Date(goal.deadline);
      const daysRemaining = Math.ceil(
        (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
      const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));

      const remainingAmount = Math.max(
        0,
        goal.target_amount - goal.current_amount
      );
      const progress =
        goal.target_amount > 0
          ? (goal.current_amount / goal.target_amount) * 100
          : 0;

      // Calculate required amounts
      const monthlyRequired = remainingAmount / monthsRemaining;
      const weeklyRequired = remainingAmount / weeksRemaining;
      const dailyRequired = remainingAmount / Math.max(1, daysRemaining);

      // Determine urgency level
      let urgencyLevel: "low" | "medium" | "high" | "critical" = "low";
      let urgencyMessage = "";

      if (daysRemaining < 0) {
        urgencyLevel = "critical";
        urgencyMessage = "Meta vencida!";
      } else if (daysRemaining <= 30) {
        urgencyLevel = "high";
        urgencyMessage = "Prazo próximo - ação urgente necessária";
      } else if (daysRemaining <= 90) {
        urgencyLevel = "medium";
        urgencyMessage = "Prazo moderado - mantenha o foco";
      } else {
        urgencyLevel = "low";
        urgencyMessage = "Prazo confortável - planeje com calma";
      }

      // Calculate if goal is achievable with current pace
      const currentPace = goal.current_amount; // Simplified - in real app, calculate based on historical data
      const projectedCompletion =
        currentPace > 0 ? (goal.target_amount / currentPace) * 30 : Infinity; // days

      return {
        daysRemaining,
        monthsRemaining,
        weeksRemaining,
        remainingAmount,
        progress,
        monthlyRequired,
        weeklyRequired,
        dailyRequired,
        urgencyLevel,
        urgencyMessage,
        projectedCompletion,
        isAchievable: projectedCompletion <= daysRemaining,
      };
    };

    return goals.reduce((acc, goal) => {
      acc[goal.id] = calculateGoalPredictions(goal);
      return acc;
    }, {} as Record<string, ReturnType<typeof calculateGoalPredictions>>);
  }, [goals]);

  // Memoized sorted goals
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      const aPredictions = goalPredictions[a.id];
      const bPredictions = goalPredictions[b.id];

      // First by urgency (critical first)
      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (
        urgencyOrder[aPredictions.urgencyLevel] !==
        urgencyOrder[bPredictions.urgencyLevel]
      ) {
        return (
          urgencyOrder[aPredictions.urgencyLevel] -
          urgencyOrder[bPredictions.urgencyLevel]
        );
      }

      // Then by completion percentage (less complete first)
      return aPredictions.progress - bPredictions.progress;
    });
  }, [goals, goalPredictions]);

  // Memoized total progress
  const { totalTarget, totalCurrent, overallProgress } = useMemo(() => {
    const totalTarget = goals.reduce(
      (sum, goal) => sum + goal.target_amount,
      0
    );
    const totalCurrent = goals.reduce(
      (sum, goal) => sum + goal.current_amount,
      0
    );
    const overallProgress =
      totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    return { totalTarget, totalCurrent, overallProgress };
  }, [goals]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSelectChange = (name: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Debug: verificar a data antes de salvar
    console.log("Data do formulário (meta):", formData.deadline);

    addGoal({
      title: formData.title,
      category: formData.category,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount),
      deadline: formData.deadline,
      notes: formData.notes,
    });

    // Reset form
    setFormData({
      title: "",
      category: "personal",
      target_amount: "",
      current_amount: "0",
      deadline: "",
      notes: "",
    });

    setShowForm(false);
  };

  const handleShowForm = () => {
    setShowForm(true);
    // Scroll to form after a short delay to ensure it's rendered
    setTimeout(() => {
      const formElement = document.getElementById("new-goal-form");
      if (formElement) {
        formElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }, 100);
  };

  const handleDeleteClick = (goal: Goal) => {
    setConfirmModal({
      isOpen: true,
      goalId: goal.id,
      goalName: `${goal.title} - R$ ${goal.target_amount.toLocaleString(
        "pt-BR"
      )}`,
      type: "delete",
    });
  };

  const handleRemoveProgressClick = (goal: Goal) => {
    if (goal.current_amount <= 0) return;

    setConfirmModal({
      isOpen: true,
      goalId: goal.id,
      goalName: `${goal.title} - Remover R$ ${removeAmount}`,
      type: "remove-progress",
    });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === "delete" && confirmModal.goalId) {
      removeGoal(confirmModal.goalId);
    } else if (
      confirmModal.type === "remove-progress" &&
      confirmModal.goalId &&
      removeAmount
    ) {
      const goal = goals.find((g) => g.id === confirmModal.goalId);
      if (goal) {
        const newAmount = Math.max(
          0,
          goal.current_amount - parseFloat(removeAmount)
        );
        updateGoal(confirmModal.goalId, { current_amount: newAmount });
        setRemoveAmount("");
      }
    }
  };

  const handleCloseModal = () => {
    setConfirmModal({
      isOpen: false,
      goalId: "",
      goalName: "",
      type: "delete",
    });
  };

  const handleUpdateProgress = (id: string) => {
    if (!progressAmount || parseFloat(progressAmount) <= 0) return;

    updateGoalProgress(id, parseFloat(progressAmount));
    setProgressAmount("");
    setExpandedGoalId(null);
  };

  const handleRemoveProgress = (id: string) => {
    if (!removeAmount || parseFloat(removeAmount) <= 0) return;

    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    if (parseFloat(removeAmount) >= goal.current_amount) {
      // If removing all or more than current, confirm with modal
      handleRemoveProgressClick(goal);
    } else {
      // Direct removal for partial amounts
      const newAmount = Math.max(
        0,
        goal.current_amount - parseFloat(removeAmount)
      );
      updateGoal(id, { current_amount: newAmount });
      setRemoveAmount("");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedGoalId(expandedGoalId === id ? null : id);
    setProgressAmount("");
    setRemoveAmount("");
  };

  const startEditing = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditFormData({
      title: goal.title,
      category: goal.category,
      target_amount: goal.target_amount,
      deadline: goal.deadline,
      notes: goal.notes || "",
    });
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
    setEditFormData({});
  };

  const saveEdit = (id: string) => {
    if (
      editFormData.title &&
      editFormData.target_amount &&
      editFormData.deadline
    ) {
      updateGoal(id, {
        title: editFormData.title,
        category: editFormData.category,
        target_amount: editFormData.target_amount,
        deadline: editFormData.deadline,
        notes: editFormData.notes,
      });
      setEditingGoalId(null);
      setEditFormData({});
    }
  };

  // Format category label
  const getCategoryLabel = (category: Goal["category"]) => {
    switch (category) {
      case "mission":
        return "Missões";
      case "personal":
        return "Pessoal";
      case "study":
        return "Estudos";
      case "debt":
        return "Dívidas";
      case "giving":
        return "Generosidade";
      default:
        return category;
    }
  };

  // Options for category selects
  const categoryOptions = [
    { value: "mission", label: "Viagens Missionárias" },
    { value: "personal", label: "Projetos Pessoais" },
    { value: "study", label: "Estudos Bíblicos/Teológicos" },
    { value: "debt", label: "Quitar Dívidas" },
    { value: "giving", label: "Generosidade/Doações" },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gold-50 via-olive-50 to-azure-50 rounded-2xl p-6 border border-gold-200 shadow-lg">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 via-olive-500 to-azure-500"></div>
        <div className="absolute top-4 right-4 opacity-20">
          <Target className="h-16 w-16 text-gold-500" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Metas com Propósito
            </h1>
            <p className="text-gray-700">
              Planeje e acompanhe suas metas financeiras com propósito cristão
            </p>
          </div>
          <button
            onClick={handleShowForm}
            className="btn btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Nova Meta
          </button>
        </div>
      </div>

      {/* Scripture Banner - Enhanced Design */}
      <div className="scripture-banner">
        <div className="flex items-start">
          <div className="h-12 w-12 rounded-full bg-gold-200 flex items-center justify-center mr-4 shadow-lg">
            <Target className="h-6 w-6 text-gold-700" />
          </div>
          <div className="flex-1">
            <p className="text-lg leading-relaxed">
              "Assim, pois, irmãos, rogo-vos pelas misericórdias de Deus que
              apresenteis o vosso corpo por sacrifício vivo, santo e agradável a
              Deus, que é o vosso culto racional."
            </p>
            <cite className="text-sm font-semibold text-gold-800 not-italic mt-2 block">
              — Romanos 12:1
            </cite>
          </div>
        </div>
      </div>

      {/* Dashboard de Previsões */}
      {goals.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center mb-4">
            <Calculator className="h-6 w-6 text-olive-600 mr-2" />
            <h2 className="section-title">Dashboard de Previsões</h2>
          </div>

          {/* Overall Progress */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">
              Progresso Geral das Metas
            </h3>
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-600">Meta Total</span>
              <span className="font-medium">
                R$ {totalTarget.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progresso Atual</span>
              <span className="font-medium">
                R$ {totalCurrent.toLocaleString("pt-BR")}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div
                className="bg-azure-600 h-2.5 rounded-full"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>{overallProgress.toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center mb-1">
                <Target className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">
                  Metas Ativas
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {goals.length}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">
                  Metas Concluídas
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {
                  goals.filter((g) => g.current_amount >= g.target_amount)
                    .length
                }
              </p>
            </div>

            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div className="flex items-center mb-1">
                <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-800">
                  Prazos Próximos
                </span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {
                  goals.filter((g) => {
                    const predictions = goalPredictions[g.id];
                    return (
                      predictions &&
                      (predictions.urgencyLevel === "high" ||
                        predictions.urgencyLevel === "critical")
                    );
                  }).length
                }
              </p>
            </div>
          </div>

          {/* Detailed Predictions Table */}
          <div className="overflow-x-auto">
            <h3 className="text-md font-medium mb-3">Previsões Detalhadas</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faltam
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Por Mês
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Por Semana
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedGoals.map((goal) => {
                  const predictions = goalPredictions[goal.id];

                  if (!predictions) return null;

                  return (
                    <tr key={goal.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {goal.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getCategoryLabel(goal.category)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                predictions.progress >= 100
                                  ? "bg-green-600"
                                  : predictions.progress >= 75
                                  ? "bg-blue-600"
                                  : predictions.progress >= 50
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                              }`}
                              style={{
                                width: `${Math.min(
                                  predictions.progress,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">
                            {predictions.progress.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          R${" "}
                          {predictions.remainingAmount.toLocaleString("pt-BR")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {predictions.daysRemaining > 0
                            ? `${predictions.daysRemaining} dias`
                            : "Vencido"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          R${" "}
                          {predictions.monthlyRequired.toLocaleString("pt-BR")}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          R${" "}
                          {predictions.weeklyRequired.toLocaleString("pt-BR")}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            predictions.urgencyLevel === "critical"
                              ? "bg-red-100 text-red-800"
                              : predictions.urgencyLevel === "high"
                              ? "bg-orange-100 text-orange-800"
                              : predictions.urgencyLevel === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {predictions.urgencyMessage}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div id="new-goal-form" className="card p-4">
          <h2 className="form-title">Nova Meta</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Título da Meta
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Viagem missionária, Quitar cartão de crédito, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <CustomSelect
                  value={formData.category}
                  onChange={(value) => handleSelectChange("category", value)}
                  options={categoryOptions}
                />
              </div>

              <div>
                <label
                  htmlFor="deadline"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data Limite
                </label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="target_amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Valor Total (R$)
                </label>
                <input
                  id="target_amount"
                  name="target_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.target_amount}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="current_amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Valor Atual (R$)
                </label>
                <input
                  id="current_amount"
                  name="current_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.current_amount}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0,00"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Observações
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input-field h-24"
                  placeholder="Anotações adicionais sobre seu propósito com esta meta (opcional)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-outline"
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {sortedGoals.length > 0 ? (
          sortedGoals.map((goal) => {
            const predictions = goalPredictions[goal.id];
            const isExpanded = expandedGoalId === goal.id;
            const isEditing = editingGoalId === goal.id;

            if (!predictions) return null;

            return (
              <div key={goal.id} className="card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          goal.category === "mission"
                            ? "bg-olive-100 text-olive-600"
                            : goal.category === "personal"
                            ? "bg-azure-100 text-azure-600"
                            : goal.category === "study"
                            ? "bg-gold-100 text-gold-600"
                            : goal.category === "debt"
                            ? "bg-red-100 text-red-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        <Target className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.title || ""}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                title: e.target.value,
                              }))
                            }
                            className="input-field text-lg font-semibold"
                            placeholder="Título da meta"
                          />
                        ) : (
                          <h3 className="font-semibold text-gray-800">
                            {goal.title}
                          </h3>
                        )}
                        <div className="flex items-center mt-1">
                          {isEditing ? (
                            <CustomSelect
                              value={editFormData.category || goal.category}
                              onChange={(value) =>
                                handleEditSelectChange("category", value)
                              }
                              options={categoryOptions}
                              className="text-xs"
                            />
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                goal.category === "mission"
                                  ? "bg-olive-100 text-olive-800"
                                  : goal.category === "personal"
                                  ? "bg-azure-100 text-azure-800"
                                  : goal.category === "study"
                                  ? "bg-gold-100 text-gold-800"
                                  : goal.category === "debt"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {getCategoryLabel(goal.category)}
                            </span>
                          )}
                          <span
                            className={`text-xs ml-2 font-medium ${
                              predictions.urgencyLevel === "critical"
                                ? "text-red-600"
                                : predictions.urgencyLevel === "high"
                                ? "text-orange-600"
                                : predictions.urgencyLevel === "medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {isEditing ? (
                              <input
                                type="date"
                                value={editFormData.deadline || goal.deadline}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    deadline: e.target.value,
                                  }))
                                }
                                className="input-field text-xs"
                              />
                            ) : predictions.daysRemaining > 0 ? (
                              `${predictions.daysRemaining} dias restantes`
                            ) : (
                              "Prazo vencido"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(goal.id)}
                            className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors duration-200"
                            title="Salvar"
                          >
                            <DollarSign className="h-5 w-5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors duration-200"
                            title="Cancelar"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(goal)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                            title="Editar"
                          >
                            <Edit3 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(goal)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                            title="Excluir"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => toggleExpand(goal.id)}
                            className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors duration-200"
                            title={isExpanded ? "Recolher" : "Expandir"}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Prediction Summary */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Necessário/mês:</span>
                        <div className="font-semibold text-gray-900">
                          R${" "}
                          {predictions.monthlyRequired.toLocaleString("pt-BR")}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          Necessário/semana:
                        </span>
                        <div className="font-semibold text-gray-900">
                          R${" "}
                          {predictions.weeklyRequired.toLocaleString("pt-BR")}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Necessário/dia:</span>
                        <div className="font-semibold text-gray-900">
                          R$ {predictions.dailyRequired.toLocaleString("pt-BR")}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Falta:</span>
                        <div className="font-semibold text-gray-900">
                          R${" "}
                          {predictions.remainingAmount.toLocaleString("pt-BR")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="text-gray-600">
                        Meta:{" "}
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={
                              editFormData.target_amount || goal.target_amount
                            }
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                target_amount: parseFloat(e.target.value),
                              }))
                            }
                            className="input-field inline-block w-32 ml-1"
                          />
                        ) : (
                          `R$ ${goal.target_amount.toLocaleString("pt-BR")}`
                        )}
                      </span>
                      <span className="font-medium">
                        R$ {goal.current_amount.toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div
                        className={`h-2.5 rounded-full ${
                          predictions.progress >= 100
                            ? "bg-green-600"
                            : predictions.progress >= 75
                            ? "bg-olive-600"
                            : predictions.progress >= 50
                            ? "bg-azure-600"
                            : predictions.progress >= 25
                            ? "bg-gold-600"
                            : "bg-red-600"
                        }`}
                        style={{
                          width: `${Math.min(predictions.progress, 100)}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{predictions.progress.toFixed(1)}% concluído</span>
                      <span>
                        {goal.deadline.split("-").reverse().join("/")}
                      </span>
                    </div>
                  </div>

                  {goal.notes && !isEditing && (
                    <div className="mt-3 text-sm text-gray-600 italic">
                      "{goal.notes}"
                    </div>
                  )}

                  {isEditing && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações
                      </label>
                      <textarea
                        value={editFormData.notes || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="input-field h-20"
                        placeholder="Observações sobre esta meta..."
                      />
                    </div>
                  )}
                </div>

                {isExpanded && !isEditing && (
                  <div className="bg-gray-50 p-4 border-t">
                    <h4 className="font-medium text-gray-800 mb-3">
                      Gerenciar Progresso
                    </h4>

                    {/* Add Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Plus className="h-4 w-4 inline mr-1" />
                          Adicionar Valor (R$)
                        </label>
                        <div className="flex items-end space-x-2">
                          <div className="flex-grow">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={progressAmount}
                                onChange={(e) =>
                                  setProgressAmount(e.target.value)
                                }
                                className="input-field pl-9"
                                placeholder="0,00"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleUpdateProgress(goal.id)}
                            disabled={
                              !progressAmount || parseFloat(progressAmount) <= 0
                            }
                            className="btn btn-primary h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Remove Progress */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Minus className="h-4 w-4 inline mr-1" />
                          Remover Valor (R$)
                        </label>
                        <div className="flex items-end space-x-2">
                          <div className="flex-grow">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={goal.current_amount}
                                value={removeAmount}
                                onChange={(e) =>
                                  setRemoveAmount(e.target.value)
                                }
                                className="input-field pl-9"
                                placeholder="0,00"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveProgress(goal.id)}
                            disabled={
                              !removeAmount ||
                              parseFloat(removeAmount) <= 0 ||
                              goal.current_amount <= 0
                            }
                            className="btn bg-red-600 hover:bg-red-700 text-white h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Máximo: R${" "}
                          {goal.current_amount.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {predictions.progress >= 100 && (
                      <div className="mt-3 text-green-600 text-sm font-medium">
                        Parabéns! Esta meta foi alcançada! 🎉
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Nenhuma meta definida
            </h3>
            <p className="text-gray-600 mb-4">
              Defina metas financeiras com propósito cristão para acompanhar seu
              progresso.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Criar Primeira Meta
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        title={
          confirmModal.type === "delete" ? "Excluir Meta" : "Remover Progresso"
        }
        message={
          confirmModal.type === "delete"
            ? "Tem certeza que deseja excluir esta meta? Todo o progresso será perdido e esta ação não pode ser desfeita."
            : "Tem certeza que deseja remover este valor do progresso da meta? Esta ação não pode ser desfeita."
        }
        confirmText={
          confirmModal.type === "delete" ? "Sim, Excluir" : "Sim, Remover"
        }
        cancelText="Cancelar"
        type="danger"
        itemName={confirmModal.goalName}
      />

      {/* Inspiration */}
      <div className="card p-4">
        <h2 className="section-title">Reflexão Bíblica</h2>
        <p className="text-gray-700 mb-4">
          Ter metas financeiras alinhadas com os princípios bíblicos nos ajuda a
          sermos melhores mordomos dos recursos que Deus nos confiou. O
          dashboard de previsões te ajuda a planejar com sabedoria, mostrando
          exatamente quanto você precisa economizar por período para alcançar
          seus objetivos.
        </p>
        <div className="scripture">
          "Porém, buscai primeiro o reino de Deus, e a sua justiça, e todas
          estas coisas vos serão acrescentadas." (Mateus 6:33)
        </div>
      </div>
    </div>
  );
};

export default Goals;
