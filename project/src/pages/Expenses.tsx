import React, { useState } from 'react';
import { useFinance, Expense } from '../stores/financeStore';
import { 
  PlusCircle, 
  Trash2, 
  Filter, 
  Edit3, 
  Check, 
  X, 
  Clock,
  CheckCircle,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Gamepad2,
  Shirt,
  Heart,
  GraduationCap,
  Stethoscope,
  Fuel,
  Gift,
  MoreHorizontal,
  TrendingDown,
  Calendar,
  Save,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CalendarDays,
  Repeat
} from 'lucide-react';
import CategorySelector from '../components/CategorySelector';
import CustomSelect from '../components/CustomSelect';
import ConfirmationModal from '../components/ConfirmationModal';

const Expenses: React.FC = () => {
  const { expenses, addExpense, updateExpense, removeExpense, getMonthlyExpenses } = useFinance();
  
  // Predefined categories with icons
  const expenseCategories = [
    { name: 'Alimentação', icon: Utensils },
    { name: 'Moradia', icon: Home },
    { name: 'Transporte', icon: Car },
    { name: 'Saúde', icon: Stethoscope },
    { name: 'Educação', icon: GraduationCap },
    { name: 'Lazer', icon: Gamepad2 },
    { name: 'Vestuário', icon: Shirt },
    { name: 'Supermercado', icon: ShoppingCart },
    { name: 'Combustível', icon: Fuel },
    { name: 'Presentes', icon: Gift },
    { name: 'Doações', icon: Heart },
    { name: 'Outros', icon: MoreHorizontal }
  ];
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as 'paid' | 'pending',
    notes: '',
    billing_type: 'unique' as 'unique' | 'monthly' | 'yearly',
    billing_day: '',
    billing_month: '',
  });
  
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Edit state - now using expanded edit mode
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Expense>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    billing_type: 'all',
  });
  
  // Custom category state
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    expenseId: '',
    expenseName: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear any previous errors when user starts typing
    if (submitError) setSubmitError('');
  };
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    // Clear any previous errors when user starts typing
    if (updateError) setUpdateError('');
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Reset billing fields when changing billing type
    if (name === 'billing_type') {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        billing_day: '',
        billing_month: ''
      }));
    }
    
    if (submitError) setSubmitError('');
  };
  
  const handleEditSelectChange = (name: string, value: string) => {
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    
    // Reset billing fields when changing billing type
    if (name === 'billing_type') {
      setEditFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        billing_day: undefined,
        billing_month: undefined
      }));
    }
    
    if (updateError) setUpdateError('');
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
    setCustomCategory('');
    if (submitError) setSubmitError('');
  };
  
  const handleEditCategoryChange = (value: string) => {
    setEditFormData((prev) => ({ ...prev, category: value }));
    if (updateError) setUpdateError('');
  };
  
  const handleCustomCategoryClick = () => {
    setShowCustomCategory(true);
    setFormData((prev) => ({ ...prev, category: '' }));
  };
  
  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData((prev) => ({ ...prev, category: value }));
    if (submitError) setSubmitError('');
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setSubmitError('Nome da despesa é obrigatório');
      return false;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setSubmitError('Valor deve ser maior que zero');
      return false;
    }
    
    if (!formData.category.trim()) {
      setSubmitError('Categoria é obrigatória');
      return false;
    }
    
    if (!formData.date) {
      setSubmitError('Data é obrigatória');
      return false;
    }
    
    // Validate billing fields
    if (formData.billing_type === 'monthly') {
      if (!formData.billing_day || parseInt(formData.billing_day) < 1 || parseInt(formData.billing_day) > 31) {
        setSubmitError('Para cobrança mensal, o dia deve estar entre 1 e 31');
        return false;
      }
    }
    
    if (formData.billing_type === 'yearly') {
      if (!formData.billing_day || parseInt(formData.billing_day) < 1 || parseInt(formData.billing_day) > 31) {
        setSubmitError('Para cobrança anual, o dia deve estar entre 1 e 31');
        return false;
      }
      if (!formData.billing_month || parseInt(formData.billing_month) < 1 || parseInt(formData.billing_month) > 12) {
        setSubmitError('Para cobrança anual, o mês deve estar entre 1 e 12');
        return false;
      }
    }
    
    return true;
  };
  
  const validateEditForm = () => {
    if (!editFormData.name?.trim()) {
      setUpdateError('Nome da despesa é obrigatório');
      return false;
    }
    
    if (!editFormData.amount || editFormData.amount <= 0) {
      setUpdateError('Valor deve ser maior que zero');
      return false;
    }
    
    if (!editFormData.category?.trim()) {
      setUpdateError('Categoria é obrigatória');
      return false;
    }
    
    if (!editFormData.date) {
      setUpdateError('Data é obrigatória');
      return false;
    }
    
    // Validate billing fields
    if (editFormData.billing_type === 'monthly') {
      if (!editFormData.billing_day || editFormData.billing_day < 1 || editFormData.billing_day > 31) {
        setUpdateError('Para cobrança mensal, o dia deve estar entre 1 e 31');
        return false;
      }
    }
    
    if (editFormData.billing_type === 'yearly') {
      if (!editFormData.billing_day || editFormData.billing_day < 1 || editFormData.billing_day > 31) {
        setUpdateError('Para cobrança anual, o dia deve estar entre 1 e 31');
        return false;
      }
      if (!editFormData.billing_month || editFormData.billing_month < 1 || editFormData.billing_month > 12) {
        setUpdateError('Para cobrança anual, o mês deve estar entre 1 e 12');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setSubmitError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Debug: verificar a data antes de salvar
      console.log('Data do formulário (despesa):', formData.date);
      
      const expenseData: Omit<Expense, 'id'> = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category.trim(),
        date: formData.date,
        status: formData.status,
        notes: formData.notes.trim(),
        billing_type: formData.billing_type,
        billing_day: formData.billing_type === 'unique' ? undefined : parseInt(formData.billing_day),
        billing_month: formData.billing_type === 'yearly' ? parseInt(formData.billing_month) : undefined,
      };
      
      console.log('Data que será salva (despesa):', expenseData.date);
      await addExpense(expenseData);
      
      // Reset form on success
      setFormData({
        name: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        notes: '',
        billing_type: 'unique',
        billing_day: '',
        billing_month: '',
      });
      
      setShowCustomCategory(false);
      setCustomCategory('');
      setShowForm(false);
      
    } catch (error) {
      console.error('Error adding expense:', error);
      setSubmitError('Erro ao adicionar despesa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const startEditing = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setEditFormData({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      status: expense.status,
      notes: expense.notes || '',
      billing_type: expense.billing_type || 'unique',
      billing_day: expense.billing_day,
      billing_month: expense.billing_month,
    });
    setUpdateError('');
  };
  
  const cancelEditing = () => {
    setEditingExpenseId(null);
    setEditFormData({});
    setUpdateError('');
    setIsUpdating(false);
  };
  
  const saveEdit = async (id: string) => {
    // Clear previous errors
    setUpdateError('');
    
    // Validate edit form
    if (!validateEditForm()) {
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const updateData: Partial<Expense> = {
        name: editFormData.name!.trim(),
        amount: editFormData.amount!,
        category: editFormData.category!.trim(),
        date: editFormData.date!,
        status: editFormData.status!,
        notes: editFormData.notes?.trim() || '',
        billing_type: editFormData.billing_type!,
        billing_day: editFormData.billing_type === 'unique' ? undefined : editFormData.billing_day,
        billing_month: editFormData.billing_type === 'yearly' ? editFormData.billing_month : undefined,
      };
      
      await updateExpense(id, updateData);
      
      // Reset edit state on success
      setEditingExpenseId(null);
      setEditFormData({});
      setUpdateError('');
      
    } catch (error) {
      console.error('Error updating expense:', error);
      setUpdateError('Erro ao atualizar despesa. Tente novamente.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteClick = (expense: Expense) => {
    setConfirmModal({
      isOpen: true,
      expenseId: expense.id,
      expenseName: `${expense.name} - R$ ${expense.amount.toLocaleString('pt-BR')}`
    });
  };
  
  const handleConfirmDelete = async () => {
    if (confirmModal.expenseId) {
      try {
        await removeExpense(confirmModal.expenseId);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };
  
  const handleCloseModal = () => {
    setConfirmModal({
      isOpen: false,
      expenseId: '',
      expenseName: ''
    });
  };
  
  const toggleStatus = async (expense: Expense) => {
    try {
      const newStatus = expense.status === 'paid' ? 'pending' : 'paid';
      await updateExpense(expense.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating expense status:', error);
    }
  };
  
  // Filter expenses based on current filters
  const filteredExpenses = expenses.filter((expense) => {
    // Filter by category
    if (filters.category && expense.category !== filters.category) {
      return false;
    }
    
    // Filter by status
    if (filters.status !== 'all' && expense.status !== filters.status) {
      return false;
    }
    
    // Filter by billing type
    if (filters.billing_type !== 'all' && expense.billing_type !== filters.billing_type) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateFrom && new Date(expense.date) < new Date(filters.dateFrom)) {
      return false;
    }
    
    if (filters.dateTo && new Date(expense.date) > new Date(filters.dateTo)) {
      return false;
    }
    
    return true;
  });
  
  // Sort expenses by date (newest first)
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Get unique categories for filter dropdown
  const allCategories = Array.from(new Set(expenses.map(e => e.category)));
  
  // Get current month expenses
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyTotal = getMonthlyExpenses(currentMonth);
  
  // Get category icon
  const getCategoryIcon = (categoryName: string) => {
    const category = expenseCategories.find(cat => cat.name === categoryName);
    return category ? category.icon : MoreHorizontal;
  };
  
  // Get billing type icon and label
  const getBillingInfo = (expense: Expense) => {
    switch (expense.billing_type) {
      case 'monthly':
        return {
          icon: RefreshCw,
          label: `Mensal - Dia ${expense.billing_day}`,
          color: 'text-blue-600 bg-blue-100'
        };
      case 'yearly':
        return {
          icon: CalendarDays,
          label: `Anual - ${expense.billing_day}/${expense.billing_month}`,
          color: 'text-purple-600 bg-purple-100'
        };
      default:
        return {
          icon: Calendar,
          label: 'Única',
          color: 'text-gray-600 bg-gray-100'
        };
    }
  };
  
  // Calculate totals
  const totalPaid = filteredExpenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalPending = filteredExpenses
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  // Options for selects
  const statusOptions = [
    { value: 'pending', label: 'Pendente' },
    { value: 'paid', label: 'Pago' }
  ];

  const billingTypeOptions = [
    { value: 'unique', label: 'Cobrança Única' },
    { value: 'monthly', label: 'Cobrança Mensal' },
    { value: 'yearly', label: 'Cobrança Anual' }
  ];

  const filterStatusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'paid', label: 'Pagos' },
    { value: 'pending', label: 'Pendentes' }
  ];

  const filterBillingTypeOptions = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'unique', label: 'Únicas' },
    { value: 'monthly', label: 'Mensais' },
    { value: 'yearly', label: 'Anuais' }
  ];

  const filterCategoryOptions = [
    { value: '', label: 'Todas' },
    ...allCategories.map(category => ({ value: category, label: category }))
  ];

  // Generate month options (1-12)
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' })
  }));

  // Generate day options (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString()
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="page-title">Despesas</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline w-full sm:w-auto"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary w-full sm:w-auto"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Nova Despesa
          </button>
        </div>
      </div>
      
      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold">Total do Mês</h3>
          </div>
          <p className="text-2xl font-bold text-red-600">R$ {monthlyTotal.toLocaleString('pt-BR')}</p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold">Pagas</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">R$ {totalPaid.toLocaleString('pt-BR')}</p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredExpenses.filter(e => e.status === 'paid').length} despesas
          </p>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold">Pendentes</h3>
          </div>
          <p className="text-2xl font-bold text-orange-600">R$ {totalPending.toLocaleString('pt-BR')}</p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredExpenses.filter(e => e.status === 'pending').length} despesas
          </p>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="card p-4">
          <h2 className="form-title">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <CustomSelect
                value={filters.category}
                onChange={(value) => handleFilterSelectChange('category', value)}
                options={filterCategoryOptions}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <CustomSelect
                value={filters.status}
                onChange={(value) => handleFilterSelectChange('status', value)}
                options={filterStatusOptions}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cobrança
              </label>
              <CustomSelect
                value={filters.billing_type}
                onChange={(value) => handleFilterSelectChange('billing_type', value)}
                options={filterBillingTypeOptions}
              />
            </div>
            
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
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
          </div>
        </div>
      )}
      
      {/* Add Form */}
      {showForm && (
        <div className="card p-4">
          <h2 className="form-title">Nova Despesa</h2>
          
          {/* Error message */}
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Despesa *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Conta de luz, Supermercado, etc."
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$) *
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0,00"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                {!showCustomCategory ? (
                  <CategorySelector
                    value={formData.category}
                    onChange={handleCategoryChange}
                    categories={expenseCategories.map(cat => cat.name)}
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
                    disabled={isSubmitting}
                  />
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <CustomSelect
                  value={formData.status}
                  onChange={(value) => handleSelectChange('status', value)}
                  options={statusOptions}
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Data *
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input-field"
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Cobrança *
                </label>
                <CustomSelect
                  value={formData.billing_type}
                  onChange={(value) => handleSelectChange('billing_type', value)}
                  options={billingTypeOptions}
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Billing Day - for monthly and yearly */}
              {(formData.billing_type === 'monthly' || formData.billing_type === 'yearly') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dia da Cobrança *
                  </label>
                  <CustomSelect
                    value={formData.billing_day}
                    onChange={(value) => handleSelectChange('billing_day', value)}
                    options={dayOptions}
                    placeholder="Selecione o dia"
                    disabled={isSubmitting}
                  />
                </div>
              )}
              
              {/* Billing Month - only for yearly */}
              {formData.billing_type === 'yearly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mês da Cobrança *
                  </label>
                  <CustomSelect
                    value={formData.billing_month}
                    onChange={(value) => handleSelectChange('billing_month', value)}
                    options={monthOptions}
                    placeholder="Selecione o mês"
                    disabled={isSubmitting}
                  />
                </div>
              )}
              
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input-field h-24"
                  placeholder="Anotações adicionais (opcional)"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setShowCustomCategory(false);
                  setCustomCategory('');
                  setSubmitError('');
                }}
                className="btn btn-outline w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Expenses List */}
      <div className="space-y-4">
        {sortedExpenses.length > 0 ? (
          sortedExpenses.map((expense) => {
            const isEditing = editingExpenseId === expense.id;
            const CategoryIcon = getCategoryIcon(expense.category);
            const billingInfo = getBillingInfo(expense);
            const BillingIcon = billingInfo.icon;
            
            return (
              <div key={expense.id} className="card overflow-hidden">
                {/* Main expense row - Fixed layout to prevent icon overlap */}
                <div className="p-4">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between">
                    {/* Left section with icon and info */}
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <CategoryIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{expense.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">{expense.category}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">
                            {expense.date.split('-').reverse().join('/')}
                          </span>
                          {/* Billing type badge */}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${billingInfo.color}`}>
                            <BillingIcon className="h-3 w-3 mr-1" />
                            {billingInfo.label}
                          </span>
                        </div>
                        
                        {expense.notes && !isEditing && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{expense.notes}"</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Right section with amount, status and actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 sm:ml-4">
                      {/* Amount and status */}
                      <div className="text-center sm:text-right">
                        <p className="text-xl font-bold text-red-600">
                          R$ {expense.amount.toLocaleString('pt-BR')}
                        </p>
                        <button
                          onClick={() => toggleStatus(expense)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            expense.status === 'paid'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          }`}
                        >
                          {expense.status === 'paid' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Pago
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pendente
                            </>
                          )}
                        </button>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => startEditing(expense)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          title="Editar"
                        >
                          <Edit3 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(expense)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          title="Excluir"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded edit form */}
                {isEditing && (
                  <div className="bg-gray-50 border-t p-4">
                    <div className="flex items-center mb-4">
                      <Edit3 className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-800">Editando Despesa</h4>
                    </div>
                    
                    {/* Error message for edit form */}
                    {updateError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{updateError}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome da Despesa *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name || ''}
                          onChange={handleEditChange}
                          className="input-field"
                          placeholder="Nome da despesa"
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor (R$) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          name="amount"
                          value={editFormData.amount || ''}
                          onChange={handleEditChange}
                          className="input-field"
                          placeholder="0,00"
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoria *
                        </label>
                        <CategorySelector
                          value={editFormData.category || ''}
                          onChange={handleEditCategoryChange}
                          categories={expenseCategories.map(cat => cat.name)}
                          placeholder="Selecione uma categoria"
                          showCustomOption={false}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <CustomSelect
                          value={editFormData.status || expense.status}
                          onChange={(value) => handleEditSelectChange('status', value)}
                          options={statusOptions}
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={editFormData.date || ''}
                          onChange={handleEditChange}
                          className="input-field"
                          disabled={isUpdating}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Cobrança *
                        </label>
                        <CustomSelect
                          value={editFormData.billing_type || expense.billing_type}
                          onChange={(value) => handleEditSelectChange('billing_type', value)}
                          options={billingTypeOptions}
                          disabled={isUpdating}
                        />
                      </div>
                      
                      {/* Billing Day - for monthly and yearly */}
                      {(editFormData.billing_type === 'monthly' || editFormData.billing_type === 'yearly') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dia da Cobrança *
                          </label>
                          <CustomSelect
                            value={editFormData.billing_day?.toString() || ''}
                            onChange={(value) => handleEditSelectChange('billing_day', value)}
                            options={dayOptions}
                            placeholder="Selecione o dia"
                            disabled={isUpdating}
                          />
                        </div>
                      )}
                      
                      {/* Billing Month - only for yearly */}
                      {editFormData.billing_type === 'yearly' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mês da Cobrança *
                          </label>
                          <CustomSelect
                            value={editFormData.billing_month?.toString() || ''}
                            onChange={(value) => handleEditSelectChange('billing_month', value)}
                            options={monthOptions}
                            placeholder="Selecione o mês"
                            disabled={isUpdating}
                          />
                        </div>
                      )}
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observações
                        </label>
                        <textarea
                          name="notes"
                          value={editFormData.notes || ''}
                          onChange={handleEditChange}
                          className="input-field h-20"
                          placeholder="Observações sobre esta despesa..."
                          disabled={isUpdating}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={cancelEditing}
                        className="btn btn-outline"
                        disabled={isUpdating}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </button>
                      <button
                        onClick={() => saveEdit(expense.id)}
                        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Salvando...
                          </div>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Alterações
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card p-8 text-center">
            <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma despesa encontrada</h3>
            <p className="text-gray-600 mb-4">
              Comece adicionando suas primeiras despesas para ter controle total dos seus gastos.
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Adicionar Primeira Despesa
            </button>
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Despesa"
        message="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        type="danger"
        itemName={confirmModal.expenseName}
      />
      
      {/* Scripture inspiration */}
      <div className="card p-4">
        <h2 className="section-title">Reflexão Bíblica</h2>
        <p className="text-gray-700 mb-4">
          Controlar nossas despesas é um ato de mordomia responsável. Quando sabemos exatamente onde nosso dinheiro está sendo gasto,
          podemos tomar decisões mais sábias e alinhar nossos gastos com nossos valores cristãos. O sistema de cobrança nos ajuda
          a planejar e antecipar nossos compromissos financeiros.
        </p>
        <div className="scripture">
          "Porque onde estiver o vosso tesouro, aí estará também o vosso coração." (Mateus 6:21)
        </div>
      </div>
    </div>
  );
};

export default Expenses;