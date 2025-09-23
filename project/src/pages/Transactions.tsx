import React, { useState } from "react";
import {
  useFinance,
  Transaction,
  TransactionType,
  PaymentType,
} from "../stores/financeStore";
import { useBanks } from "../stores/banksStore";
import { PlusCircle, Trash2, Filter, BookOpen } from "lucide-react";
import CategorySelector from "../components/CategorySelector";
import CustomSelect from "../components/CustomSelect";
import ConfirmationModal from "../components/ConfirmationModal";

const Transactions: React.FC = () => {
  const { transactions, addTransaction, removeTransaction, updateTransaction } =
    useFinance();
  const { banks, loadBanksData, isDataLoaded: isBanksDataLoaded } = useBanks();

  // Predefined categories
  const incomeCategories = [
    "Salário",
    "Venda",
    "Investimentos",
    "Bonificação",
    "Presente Recebido",
    "Outros",
  ];

  const expenseCategories = [
    "Alimentação",
    "Moradia",
    "Transporte",
    "Saúde",
    "Educação",
    "Lazer",
    "Vestuário",
    "Impostos",
    "Seguros",
    "Combustível",
    "Supermercado",
    "Presentes",
    "Doações",
    "Outros",
  ];

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense" as TransactionType,
    payment_type: "moeda" as PaymentType,
    destination_bank_id: "",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    dateFrom: "",
    dateTo: "",
    category: "",
  });

  // Custom category state
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    transactionId: "",
    transactionName: "",
  });

  // Edit transaction state
  const [editTransactionId, setEditTransactionId] = useState<string | null>(
    null
  );

  // Load banks data on mount
  React.useEffect(() => {
    if (!isBanksDataLoaded) {
      loadBanksData();
    }
  }, [isBanksDataLoaded, loadBanksData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "type") {
      // Reset category when changing transaction type
      setFormData((prev) => ({
        ...prev,
        type: value as TransactionType,
        category: "",
      }));
      setShowCustomCategory(false);
      setCustomCategory("");
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "type") {
      // Reset category when changing transaction type
      setFormData((prev) => ({
        ...prev,
        type: value as TransactionType,
        category: "",
      }));
      setShowCustomCategory(false);
      setCustomCategory("");
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
    setShowCustomCategory(false);
    setCustomCategory("");
  };

  const handleCustomCategoryClick = () => {
    setShowCustomCategory(true);
    setFormData((prev) => ({ ...prev, category: "" }));
  };

  const handleCustomCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editTransactionId) {
      // Edit mode: update transaction
      updateTransaction({
        id: editTransactionId,
        type: formData.type,
        payment_type: formData.payment_type,
        destination_bank_id: formData.destination_bank_id || undefined,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date,
      });
    } else {
      // Add mode: add new transaction
      addTransaction({
        type: formData.type,
        payment_type: formData.payment_type,
        destination_bank_id: formData.destination_bank_id || undefined,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date,
      });
    }

    // Reset form
    setFormData({
      type: "expense",
      payment_type: "moeda",
      destination_bank_id: "",
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowCustomCategory(false);
    setCustomCategory("");
    setShowForm(false);
    setEditTransactionId(null);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setConfirmModal({
      isOpen: true,
      transactionId: transaction.id,
      transactionName: `${
        transaction.description
      } - R$ ${transaction.amount.toLocaleString("pt-BR")}`,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.transactionId) {
      removeTransaction(confirmModal.transactionId);
    }
  };

  const handleCloseModal = () => {
    setConfirmModal({
      isOpen: false,
      transactionId: "",
      transactionName: "",
    });
  };

  // Edit transaction handler
  const handleEditClick = (transaction: Transaction) => {
    setEditTransactionId(transaction.id);
    setShowForm(true);
    setShowCustomCategory(false);
    setCustomCategory("");
    setFormData({
      type: transaction.type,
      payment_type: transaction.payment_type,
      destination_bank_id: transaction.destination_bank_id || "",
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
    });
  };

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type
    if (filters.type !== "all" && transaction.type !== filters.type) {
      return false;
    }

    // Filter by date range
    if (
      filters.dateFrom &&
      new Date(transaction.date) < new Date(filters.dateFrom)
    ) {
      return false;
    }

    if (
      filters.dateTo &&
      new Date(transaction.date) > new Date(filters.dateTo)
    ) {
      return false;
    }

    // Filter by category
    if (filters.category && transaction.category !== filters.category) {
      return false;
    }

    return true;
  });

  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get unique categories for filter dropdown
  const allCategories = Array.from(
    new Set(transactions.map((t) => t.category))
  );

  // Get current predefined categories based on transaction type
  const currentPredefinedCategories =
    formData.type === "income" ? incomeCategories : expenseCategories;

  // Bank options for selects
  const bankOptions = [
    { value: "", label: "Nenhum banco específico" },
    ...banks.map((bank) => ({ value: bank.id, label: bank.name })),
  ];

  // Options for selects
  const typeOptions = [
    { value: "income", label: "Receita" },
    { value: "expense", label: "Despesa" },
  ];

  const filterTypeOptions = [
    { value: "all", label: "Todos" },
    { value: "income", label: "Receitas" },
    { value: "expense", label: "Despesas" },
  ];

  const filterCategoryOptions = [
    { value: "", label: "Todas" },
    ...allCategories.map((category) => ({ value: category, label: category })),
  ];

  const paymentTypeOptions = [
    { value: "pix", label: "PIX" },
    { value: "credito", label: "Cartão de Crédito" },
    { value: "debito", label: "Cartão de Débito" },
    { value: "moeda", label: "Dinheiro" },
    { value: "boleto", label: "Boleto" },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gold-50 via-olive-50 to-azure-50 rounded-2xl p-6 border border-gold-200 shadow-lg">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 via-olive-500 to-azure-500"></div>
        <div className="absolute top-4 right-4 opacity-20">
          <BookOpen className="h-16 w-16 text-gold-500" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Transações
            </h1>
            <p className="text-gray-700">
              Gerencie suas receitas e despesas com clareza e segurança
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Nova Transação
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4">
          <h2 className="form-title">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <CustomSelect
                value={filters.type}
                onChange={(value) => handleFilterSelectChange("type", value)}
                options={filterTypeOptions}
              />
            </div>

            <div>
              <label
                htmlFor="dateFrom"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Data Inicial
              </label>
              <input
                id="dateFrom"
                name="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="input-field"
              />
            </div>

            <div>
              <label
                htmlFor="dateTo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Data Final
              </label>
              <input
                id="dateTo"
                name="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <CustomSelect
                value={filters.category}
                onChange={(value) =>
                  handleFilterSelectChange("category", value)
                }
                options={filterCategoryOptions}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Form */}
      {showForm && (
        <div className="card p-4 min-h-[500px]">
          <h2 className="form-title">
            {editTransactionId ? "Editar Transação" : "Nova Transação"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <CustomSelect
                  value={formData.type}
                  onChange={(value) => handleSelectChange("type", value)}
                  options={typeOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pagamento
                </label>
                <CustomSelect
                  value={formData.payment_type}
                  onChange={(value) =>
                    handleSelectChange("payment_type", value)
                  }
                  options={paymentTypeOptions}
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Valor (R$)
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0,00"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descrição
                </label>
                <input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Salário, Supermercado, etc."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Categoria
                </label>
                {!showCustomCategory ? (
                  <CategorySelector
                    value={formData.category}
                    onChange={handleCategoryChange}
                    categories={currentPredefinedCategories}
                    placeholder="Selecione uma categoria"
                    onCustomCategory={handleCustomCategoryClick}
                    showCustomOption={true}
                  />
                ) : (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    className="input-field"
                    placeholder="Digite o nome da nova categoria"
                    required
                  />
                )}
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              {/* Banco Destinado - apenas para receitas */}
              {formData.type === "income" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banco Destinado
                  </label>
                  <CustomSelect
                    value={formData.destination_bank_id}
                    onChange={(value) =>
                      handleSelectChange("destination_bank_id", value)
                    }
                    options={bankOptions}
                    placeholder="Selecione o banco de destino"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setShowCustomCategory(false);
                  setCustomCategory("");
                  setEditTransactionId(null);
                }}
                className="btn btn-outline w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto"
              >
                {editTransactionId ? "Salvar Alterações" : "Salvar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Banco Destinado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {transaction.date.split("-").reverse().join("/")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                    {transaction.description}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {transaction.category}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {transaction.destination_bank_id
                      ? (() => {
                          const bank = banks.find(
                            (b) => b.id === transaction.destination_bank_id
                          );
                          return bank ? `${bank.name}` : "Banco não encontrado";
                        })()
                      : transaction.type === "income"
                      ? "Não especificado"
                      : "-"}
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"} R${" "}
                    {transaction.amount.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right flex gap-2 justify-end">
                    <button
                      onClick={() => handleEditClick(transaction)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded hover:bg-blue-50"
                      title="Editar"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4 1a1 1 0 01-1.213-1.213l1-4a4 4 0 01.828-1.414z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(transaction)}
                      className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}

              {sortedTransactions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    Nenhuma transação encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Transação"
        message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        type="danger"
        itemName={confirmModal.transactionName}
      />

      {/* Enhanced Scripture Inspiration Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-olive-50 via-gold-50 to-azure-50 rounded-2xl p-8 border-2 border-gold-300 shadow-xl mt-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-olive-500 via-gold-500 to-azure-500"></div>
        <div className="absolute top-4 right-4 opacity-10">
          <BookOpen className="h-24 w-24 text-gold-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-gold-200 flex items-center justify-center mr-4 shadow-lg">
              <BookOpen className="h-6 w-6 text-gold-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Reflexão Bíblica
              </h2>
              <p className="text-gray-700">Sobre Sabedoria e Prudência</p>
            </div>
          </div>
          <div className="scripture text-lg text-gold-800 italic text-center">
            "O que guarda a sua boca, conserva a sua alma; mas o que muito abre
            os seus lábios se arruinará."
          </div>
          <cite className="text-sm font-semibold text-gold-700 not-italic block text-center mt-2">
            — Provérbios 13:3
          </cite>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
