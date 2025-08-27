import React, { useState, useEffect } from 'react';
import { useBanks, Bank, AccountBalance, Investment, Card } from '../stores/banksStore';
import { useFinance } from '../stores/financeStore';
import { 
  Building2, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  Calendar,
  Target,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Banknote,
  Wallet,
  PiggyBank,
  TrendingDown,
  Plus,
  Minus
} from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import ConfirmationModal from '../components/ConfirmationModal';

const Banks: React.FC = () => {
  const { 
    banks, 
    accountBalances, 
    investments, 
    cards,
    addBank, 
    updateBank, 
    removeBank,
    addAccountBalance,
    updateAccountBalance,
    removeAccountBalance,
    addInvestment,
    updateInvestment,
    removeInvestment,
    addCard,
    updateCard,
    removeCard,
    getBankBalances,
    getBankInvestments,
    getBankCards,
    loadBanksData,
    isDataLoaded
  } = useBanks();
  
  // Load data on mount
  useEffect(() => {
    if (!isDataLoaded) {
      loadBanksData();
    }
  }, [isDataLoaded, loadBanksData]);
  
  // Form states
  const [showBankForm, setShowBankForm] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [expandedBankId, setExpandedBankId] = useState<string | null>(null);
  
  // Bank form data
  const [bankFormData, setBankFormData] = useState({
    name: '',
    agency: '',
    account_holder: '',
    investments_info: ''
  });
  
  // Balance form data
  const [balanceFormData, setBalanceFormData] = useState({
    balance: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  // Investment form data
  const [investmentFormData, setInvestmentFormData] = useState({
    type: '',
    initial_value: '',
    final_value: '',
    period_type: 'periodico' as 'periodico' | 'permanente',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });
  
  // Card form data
  const [cardFormData, setCardFormData] = useState({
    type: 'debito' as 'debito' | 'credito',
    expiry_date: ''
  });
  
  // Active forms for each bank
  const [activeForms, setActiveForms] = useState<{[bankId: string]: 'balance' | 'investment' | 'card' | null}>({});
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'bank' as 'bank' | 'balance' | 'investment' | 'card',
    itemId: '',
    itemName: '',
    bankId: ''
  });
  
  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBankFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBalanceFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvestmentFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBankId) {
        await updateBank(editingBankId, bankFormData);
        setEditingBankId(null);
      } else {
        await addBank(bankFormData);
        setShowBankForm(false);
      }
      
      setBankFormData({
        name: '',
        agency: '',
        account_holder: '',
        investments_info: ''
      });
    } catch (error) {
      console.error('Error saving bank:', error);
    }
  };
  
  const handleBalanceSubmit = async (e: React.FormEvent, bankId: string) => {
    e.preventDefault();
    
    try {
      await addAccountBalance({
        bank_id: bankId,
        balance: parseFloat(balanceFormData.balance),
        date: balanceFormData.date,
        notes: balanceFormData.notes
      });
      
      setBalanceFormData({
        balance: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      setActiveForms(prev => ({ ...prev, [bankId]: null }));
    } catch (error) {
      console.error('Error adding balance:', error);
    }
  };
  
  const handleInvestmentSubmit = async (e: React.FormEvent, bankId: string) => {
    e.preventDefault();
    
    try {
      await addInvestment({
        bank_id: bankId,
        type: investmentFormData.type,
        initial_value: parseFloat(investmentFormData.initial_value),
        final_value: investmentFormData.final_value ? parseFloat(investmentFormData.final_value) : undefined,
        period_type: investmentFormData.period_type,
        start_date: investmentFormData.start_date,
        end_date: investmentFormData.end_date || undefined,
        notes: investmentFormData.notes
      });
      
      setInvestmentFormData({
        type: '',
        initial_value: '',
        final_value: '',
        period_type: 'periodico',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      });
      
      setActiveForms(prev => ({ ...prev, [bankId]: null }));
    } catch (error) {
      console.error('Error adding investment:', error);
    }
  };
  
  const handleCardSubmit = async (e: React.FormEvent, bankId: string) => {
    e.preventDefault();
    
    try {
      await addCard({
        bank_id: bankId,
        type: cardFormData.type,
        expiry_date: cardFormData.expiry_date
      });
      
      setCardFormData({
        type: 'debito',
        expiry_date: ''
      });
      
      setActiveForms(prev => ({ ...prev, [bankId]: null }));
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };
  
  const startEditingBank = (bank: Bank) => {
    setEditingBankId(bank.id);
    setBankFormData({
      name: bank.name,
      agency: bank.agency,
      account_holder: bank.account_holder,
      investments_info: bank.investments_info || ''
    });
  };
  
  const cancelEditingBank = () => {
    setEditingBankId(null);
    setBankFormData({
      name: '',
      agency: '',
      account_holder: '',
      investments_info: ''
    });
  };
  
  const handleDeleteClick = (type: 'bank' | 'balance' | 'investment' | 'card', item: any, bankId?: string) => {
    let itemName = '';
    
    switch (type) {
      case 'bank':
        itemName = `${item.name} - ${item.agency}`;
        break;
      case 'balance':
        itemName = `Saldo de R$ ${item.balance.toLocaleString('pt-BR')} em ${item.date.split('-').reverse().join('/')}`;
        break;
      case 'investment':
        itemName = `${item.type} - R$ ${item.initial_value.toLocaleString('pt-BR')}`;
        break;
      case 'card':
        itemName = `Cartão ${item.type === 'debito' ? 'de Débito' : 'de Crédito'} - ${item.expiry_date.split('-').reverse().join('/')}`;
        break;
    }
    
    setConfirmModal({
      isOpen: true,
      type,
      itemId: item.id,
      itemName,
      bankId: bankId || ''
    });
  };
  
  const handleConfirmDelete = async () => {
    try {
      switch (confirmModal.type) {
        case 'bank':
          await removeBank(confirmModal.itemId);
          break;
        case 'balance':
          await removeAccountBalance(confirmModal.itemId);
          break;
        case 'investment':
          await removeInvestment(confirmModal.itemId);
          break;
        case 'card':
          await removeCard(confirmModal.itemId);
          break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
  
  const handleCloseModal = () => {
    setConfirmModal({
      isOpen: false,
      type: 'bank',
      itemId: '',
      itemName: '',
      bankId: ''
    });
  };
  
  const toggleBankExpansion = (bankId: string) => {
    setExpandedBankId(expandedBankId === bankId ? null : bankId);
    // Reset active forms when collapsing
    if (expandedBankId === bankId) {
      setActiveForms(prev => ({ ...prev, [bankId]: null }));
    }
  };
  
  const setActiveForm = (bankId: string, formType: 'balance' | 'investment' | 'card' | null) => {
    setActiveForms(prev => ({ ...prev, [bankId]: formType }));
    
    // Reset form data when switching forms
    if (formType === 'balance') {
      setBalanceFormData({
        balance: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } else if (formType === 'investment') {
      setInvestmentFormData({
        type: '',
        initial_value: '',
        final_value: '',
        period_type: 'periodico',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      });
    } else if (formType === 'card') {
      setCardFormData({
        type: 'debito',
        expiry_date: ''
      });
    }
  };
  
  // Get latest balance for a bank
  const getLatestBalance = (bankId: string) => {
    const balances = getBankBalances(bankId);
    if (balances.length === 0) return 0;
    
    const sortedBalances = balances.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return sortedBalances[0].balance;
  };
  
  // Get total investments value for a bank
  const getTotalInvestments = (bankId: string) => {
    const bankInvestments = getBankInvestments(bankId);
    return bankInvestments.reduce((sum, inv) => sum + inv.initial_value, 0);
  };
  
  // Calculate total balance across all banks
  const totalBalance = banks.reduce((sum, bank) => sum + getLatestBalance(bank.id), 0);
  
  // Calculate total investments across all banks
  const totalInvestments = banks.reduce((sum, bank) => sum + getTotalInvestments(bank.id), 0);

  // Options for selects
  const periodTypeOptions = [
    { value: 'periodico', label: 'Periódico' },
    { value: 'permanente', label: 'Permanente' }
  ];

  const cardTypeOptions = [
    { value: 'debito', label: 'Débito' },
    { value: 'credito', label: 'Crédito' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile optimized */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h1 className="page-title">Gestão Bancária</h1>
        <button 
          onClick={() => setShowBankForm(true)}
          className="btn btn-primary w-full sm:w-auto"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Cadastrar Banco
        </button>
      </div>
      
      {/* Summary Cards - Mobile optimized grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="card p-4">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3 min-w-0">
              <h3 className="text-sm font-medium text-gray-600">Bancos</h3>
              <p className="text-xl font-semibold text-gray-800">{banks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3 min-w-0">
              <h3 className="text-sm font-medium text-gray-600">Saldo Total</h3>
              <p className="text-lg sm:text-xl font-semibold text-gray-800">
                R$ {totalBalance.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center mb-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3 min-w-0">
              <h3 className="text-sm font-medium text-gray-600">Investimentos</h3>
              <p className="text-lg sm:text-xl font-semibold text-gray-800">
                R$ {totalInvestments.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Bank Form - Mobile optimized */}
      {showBankForm && (
        <div className="card p-4">
          <h2 className="form-title">Cadastrar Novo Banco</h2>
          <form onSubmit={handleBankSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Banco
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={bankFormData.name}
                  onChange={handleBankChange}
                  className="input-field"
                  placeholder="Ex: Banco do Brasil, Itaú, etc."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="agency" className="block text-sm font-medium text-gray-700 mb-1">
                  Agência
                </label>
                <input
                  id="agency"
                  name="agency"
                  type="text"
                  value={bankFormData.agency}
                  onChange={handleBankChange}
                  className="input-field"
                  placeholder="Ex: 1234-5"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="account_holder" className="block text-sm font-medium text-gray-700 mb-1">
                  Titular da Conta
                </label>
                <input
                  id="account_holder"
                  name="account_holder"
                  type="text"
                  value={bankFormData.account_holder}
                  onChange={handleBankChange}
                  className="input-field"
                  placeholder="Nome do titular"
                  required
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="investments_info" className="block text-sm font-medium text-gray-700 mb-1">
                  Informações de Investimentos
                </label>
                <textarea
                  id="investments_info"
                  name="investments_info"
                  value={bankFormData.investments_info}
                  onChange={handleBankChange}
                  className="input-field h-20"
                  placeholder="Informações sobre investimentos neste banco (opcional)"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowBankForm(false);
                  setBankFormData({
                    name: '',
                    agency: '',
                    account_holder: '',
                    investments_info: ''
                  });
                }}
                className="btn btn-outline w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Banks List - Mobile optimized */}
      <div className="space-y-3 sm:space-y-4">
        {banks.length > 0 ? (
          banks.map((bank) => {
            const isEditing = editingBankId === bank.id;
            const isExpanded = expandedBankId === bank.id;
            const activeForm = activeForms[bank.id];
            const latestBalance = getLatestBalance(bank.id);
            const totalInvestmentsValue = getTotalInvestments(bank.id);
            const bankBalances = getBankBalances(bank.id);
            const bankInvestments = getBankInvestments(bank.id);
            const bankCards = getBankCards(bank.id);
            
            return (
              <div key={bank.id} className="card overflow-hidden">
                {/* Bank Header - Mobile optimized */}
                <div className="p-4">
                  <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    {/* Bank Info */}
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={bankFormData.name}
                            onChange={handleBankChange}
                            className="input-field text-lg font-semibold mb-1"
                            placeholder="Nome do banco"
                          />
                        ) : (
                          <h3 className="text-lg font-semibold text-gray-800 truncate">{bank.name}</h3>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                name="agency"
                                value={bankFormData.agency}
                                onChange={handleBankChange}
                                className="input-field text-sm w-20"
                                placeholder="Agência"
                              />
                              <span>•</span>
                              <input
                                type="text"
                                name="account_holder"
                                value={bankFormData.account_holder}
                                onChange={handleBankChange}
                                className="input-field text-sm flex-1 min-w-0"
                                placeholder="Titular"
                              />
                            </>
                          ) : (
                            <>
                              <span>Ag. {bank.agency}</span>
                              <span>•</span>
                              <span className="truncate">{bank.account_holder}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Balance and Actions */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          R$ {latestBalance.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500">Saldo atual</p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleBankSubmit}
                              className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors duration-200"
                              title="Salvar"
                            >
                              <Save className="h-5 w-5" />
                            </button>
                            <button
                              onClick={cancelEditingBank}
                              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              title="Cancelar"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditingBank(bank)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit3 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick('bank', bank)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                              title="Excluir"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => toggleBankExpansion(bank.id)}
                              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              title={isExpanded ? "Recolher" : "Expandir"}
                            >
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit form for investments info */}
                  {isEditing && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Informações de Investimentos
                      </label>
                      <textarea
                        name="investments_info"
                        value={bankFormData.investments_info}
                        onChange={handleBankChange}
                        className="input-field h-20"
                        placeholder="Informações sobre investimentos neste banco..."
                      />
                    </div>
                  )}
                </div>
                
                {/* Expanded Content - Mobile optimized */}
                {isExpanded && !isEditing && (
                  <div className="border-t bg-gray-50">
                    {/* Quick Stats - Mobile optimized */}
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <Banknote className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Saldos</p>
                        <p className="text-sm font-semibold">{bankBalances.length}</p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <TrendingUp className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Investimentos</p>
                        <p className="text-sm font-semibold">{bankInvestments.length}</p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <CreditCard className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Cartões</p>
                        <p className="text-sm font-semibold">{bankCards.length}</p>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                        <PiggyBank className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Investido</p>
                        <p className="text-xs font-semibold">R$ {totalInvestmentsValue.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    
                    {/* Action Buttons - Mobile optimized */}
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => setActiveForm(bank.id, activeForm === 'balance' ? null : 'balance')}
                          className={`btn w-full text-sm ${
                            activeForm === 'balance' ? 'btn-primary' : 'btn-outline'
                          }`}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          {activeForm === 'balance' ? 'Fechar' : 'Saldo'}
                        </button>
                        
                        <button
                          onClick={() => setActiveForm(bank.id, activeForm === 'investment' ? null : 'investment')}
                          className={`btn w-full text-sm ${
                            activeForm === 'investment' ? 'btn-primary' : 'btn-outline'
                          }`}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          {activeForm === 'investment' ? 'Fechar' : 'Investimento'}
                        </button>
                        
                        <button
                          onClick={() => setActiveForm(bank.id, activeForm === 'card' ? null : 'card')}
                          className={`btn w-full text-sm ${
                            activeForm === 'card' ? 'btn-primary' : 'btn-outline'
                          }`}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          {activeForm === 'card' ? 'Fechar' : 'Cartão'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Forms - Mobile optimized */}
                    {activeForm === 'balance' && (
                      <div className="border-t bg-white p-4">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                          Adicionar Saldo
                        </h4>
                        <form onSubmit={(e) => handleBalanceSubmit(e, bank.id)}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Saldo (R$)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                name="balance"
                                value={balanceFormData.balance}
                                onChange={handleBalanceChange}
                                className="input-field"
                                placeholder="0,00"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data
                              </label>
                              <input
                                type="date"
                                name="date"
                                value={balanceFormData.date}
                                onChange={handleBalanceChange}
                                className="input-field"
                                required
                              />
                            </div>
                            
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Observações
                              </label>
                              <textarea
                                name="notes"
                                value={balanceFormData.notes}
                                onChange={handleBalanceChange}
                                className="input-field h-16"
                                placeholder="Observações sobre este saldo (opcional)"
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveForm(bank.id, null)}
                              className="btn btn-outline w-full sm:w-auto"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary w-full sm:w-auto"
                            >
                              Adicionar Saldo
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    
                    {activeForm === 'investment' && (
                      <div className="border-t bg-white p-4">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                          Adicionar Investimento
                        </h4>
                        <form onSubmit={(e) => handleInvestmentSubmit(e, bank.id)}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Investimento
                              </label>
                              <input
                                type="text"
                                name="type"
                                value={investmentFormData.type}
                                onChange={handleInvestmentChange}
                                className="input-field"
                                placeholder="Ex: CDB, Poupança, etc."
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Inicial (R$)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="initial_value"
                                value={investmentFormData.initial_value}
                                onChange={handleInvestmentChange}
                                className="input-field"
                                placeholder="0,00"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Final (R$)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                name="final_value"
                                value={investmentFormData.final_value}
                                onChange={handleInvestmentChange}
                                className="input-field"
                                placeholder="0,00 (opcional)"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Período
                              </label>
                              <CustomSelect
                                value={investmentFormData.period_type}
                                onChange={(value) => setInvestmentFormData(prev => ({ ...prev, period_type: value as 'periodico' | 'permanente' }))}
                                options={periodTypeOptions}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Início
                              </label>
                              <input
                                type="date"
                                name="start_date"
                                value={investmentFormData.start_date}
                                onChange={handleInvestmentChange}
                                className="input-field"
                                required
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Fim
                              </label>
                              <input
                                type="date"
                                name="end_date"
                                value={investmentFormData.end_date}
                                onChange={handleInvestmentChange}
                                className="input-field"
                                placeholder="Opcional"
                              />
                            </div>
                            
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Observações
                              </label>
                              <textarea
                                name="notes"
                                value={investmentFormData.notes}
                                onChange={handleInvestmentChange}
                                className="input-field h-16"
                                placeholder="Observações sobre este investimento (opcional)"
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveForm(bank.id, null)}
                              className="btn btn-outline w-full sm:w-auto"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary w-full sm:w-auto"
                            >
                              Adicionar Investimento
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    
                    {activeForm === 'card' && (
                      <div className="border-t bg-white p-4">
                        <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                          <CreditCard className="h-5 w-5 text-orange-600 mr-2" />
                          Adicionar Cartão
                        </h4>
                        <form onSubmit={(e) => handleCardSubmit(e, bank.id)}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Cartão
                              </label>
                              <CustomSelect
                                value={cardFormData.type}
                                onChange={(value) => setCardFormData(prev => ({ ...prev, type: value as 'debito' | 'credito' }))}
                                options={cardTypeOptions}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Data de Vencimento
                              </label>
                              <input
                                type="date"
                                name="expiry_date"
                                value={cardFormData.expiry_date}
                                onChange={handleCardChange}
                                className="input-field"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveForm(bank.id, null)}
                              className="btn btn-outline w-full sm:w-auto"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary w-full sm:w-auto"
                            >
                              Adicionar Cartão
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    
                    {/* Data Lists - Mobile optimized */}
                    {!activeForm && (
                      <div className="border-t bg-white p-4 space-y-4">
                        {/* Account Balances */}
                        {bankBalances.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                              <Wallet className="h-4 w-4 text-green-600 mr-2" />
                              Histórico de Saldos
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {bankBalances
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 3)
                                .map((balance) => (
                                <div key={balance.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-800">
                                      R$ {balance.balance.toLocaleString('pt-BR')}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {balance.date.split('-').reverse().join('/')}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteClick('balance', balance, bank.id)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors duration-200"
                                    title="Excluir"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Investments */}
                        {bankInvestments.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                              <TrendingUp className="h-4 w-4 text-purple-600 mr-2" />
                              Investimentos
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {bankInvestments.map((investment) => (
                                <div key={investment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                      {investment.type}
                                    </p>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      <span>R$ {investment.initial_value.toLocaleString('pt-BR')}</span>
                                      <span>•</span>
                                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                        investment.period_type === 'periodico' 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : 'bg-green-100 text-green-800'
                                      }`}>
                                        {investment.period_type === 'periodico' ? 'Periódico' : 'Permanente'}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteClick('investment', investment, bank.id)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors duration-200"
                                    title="Excluir"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Cards */}
                        {bankCards.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                              <CreditCard className="h-4 w-4 text-orange-600 mr-2" />
                              Cartões
                            </h4>
                            <div className="space-y-2">
                              {bankCards.map((card) => (
                                <div key={card.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-2">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        card.type === 'debito' 
                                          ? 'bg-blue-100 text-blue-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {card.type === 'debito' ? 'Débito' : 'Crédito'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        Vence: {card.expiry_date.split('-').reverse().join('/')}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteClick('card', card, bank.id)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors duration-200"
                                    title="Excluir"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card p-6 sm:p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum banco cadastrado</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Cadastre seus bancos para ter controle completo de suas contas, saldos e investimentos.
            </p>
            <button 
              onClick={() => setShowBankForm(true)}
              className="btn btn-primary w-full sm:w-auto"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Cadastrar Primeiro Banco
            </button>
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title={
          confirmModal.type === 'bank' ? 'Excluir Banco' :
          confirmModal.type === 'balance' ? 'Excluir Saldo' :
          confirmModal.type === 'investment' ? 'Excluir Investimento' :
          'Excluir Cartão'
        }
        message={
          confirmModal.type === 'bank' 
            ? 'Tem certeza que deseja excluir este banco? Todos os saldos, investimentos e cartões associados também serão removidos. Esta ação não pode ser desfeita.'
            : 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.'
        }
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        type="danger"
        itemName={confirmModal.itemName}
      />
      
      {/* Scripture inspiration */}
      <div className="scripture">
        "Porque onde estiver o vosso tesouro, aí estará também o vosso coração." (Mateus 6:21)
      </div>
    </div>
  );
};

export default Banks;