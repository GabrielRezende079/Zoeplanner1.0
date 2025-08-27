import React, { useState } from 'react';
import { useFinance, Tithing } from '../stores/financeStore';
import { PlusCircle, Trash2, Heart, Calendar, ArrowUp, Target, TrendingUp, Gift, Church, DollarSign, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';
import ConfirmationModal from '../components/ConfirmationModal';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

const TithingPage: React.FC = () => {
  const { tithingRecords, addTithingRecord, removeTithingRecord, transactions } = useFinance();
  
  // Month filter state
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    church: '',
    date: new Date().toISOString().split('T')[0],
    type: 'tithe' as 'tithe' | 'offering' | 'vow',
    notes: '',
  });
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    recordId: '',
    recordName: ''
  });
  
  // Available months for selection
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    
    // Always add current month
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    months.add(currentMonth);
    
    // Add months from tithing records
    tithingRecords.forEach(record => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    
    // Generate additional months for better selection (last 24 months + next 12 months)
    for (let i = -24; i <= 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    }
    
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [tithingRecords]);
  
  // Filter data by selected month
  const filteredTithingRecords = tithingRecords.filter(record => {
    const date = new Date(record.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return monthKey === selectedMonth;
  });
  
  // Get income for the selected month
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && t.date.startsWith(selectedMonth))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addTithingRecord({
      amount: parseFloat(formData.amount),
      church: formData.church,
      date: formData.date,
      type: formData.type,
      notes: formData.notes,
    });
    
    // Reset form
    setFormData({
      amount: '',
      church: '',
      date: new Date().toISOString().split('T')[0],
      type: 'tithe',
      notes: '',
    });
    
    setShowForm(false);
  };
  
  const handleShowForm = () => {
    setShowForm(true);
    setTimeout(() => {
      const formElement = document.getElementById('new-tithing-form');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleDeleteClick = (record: Tithing) => {
    const typeLabel = record.type === 'tithe' ? 'Dízimo' : 
                     record.type === 'offering' ? 'Oferta' : 'Voto';
    
    setConfirmModal({
      isOpen: true,
      recordId: record.id,
      recordName: `${typeLabel} - ${record.church} - R$ ${record.amount.toLocaleString('pt-BR')}`
    });
  };
  
  const handleConfirmDelete = () => {
    if (confirmModal.recordId) {
      removeTithingRecord(confirmModal.recordId);
    }
  };
  
  const handleCloseModal = () => {
    setConfirmModal({
      isOpen: false,
      recordId: '',
      recordName: ''
    });
  };
  
  // Calculate tithing stats
  const recommendedTithe = monthlyIncome * 0.1;
  const actualTithe = filteredTithingRecords
    .filter(r => r.type === 'tithe')
    .reduce((sum, r) => sum + r.amount, 0);
  const tithingPercentage = monthlyIncome > 0 ? (actualTithe / monthlyIncome) * 100 : 0;
  
  // Calculate offerings and vows
  const totalOfferings = filteredTithingRecords
    .filter(r => r.type === 'offering')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalVows = filteredTithingRecords
    .filter(r => r.type === 'vow')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalGiving = actualTithe + totalOfferings + totalVows;
  
  // Chart data for pie chart
  const givingData = [
    { name: 'Dízimos', value: actualTithe, color: '#8fa84b' },
    { name: 'Ofertas', value: totalOfferings, color: '#f5c935' },
    { name: 'Votos', value: totalVows, color: '#3889cc' },
  ].filter(item => item.value > 0);
  
  // Chart data for comparison
  const comparisonData = [
    { 
      name: 'Recomendado vs Atual', 
      recomendado: recommendedTithe,
      atual: actualTithe,
      diferenca: actualTithe - recommendedTithe
    }
  ];
  
  // Colors for charts
  const COLORS = ['#8fa84b', '#f5c935', '#3889cc', '#e77c64', '#9f86c0'];
  
  // Sort filtered records by date (newest first)
  const sortedRecords = [...filteredTithingRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Options for type select
  const typeOptions = [
    { value: 'tithe', label: 'Dízimo' },
    { value: 'offering', label: 'Oferta' },
    { value: 'vow', label: 'Voto' }
  ];

  // Format month name for display
  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Options for month select
  const monthOptions = availableMonths.map(month => {
    const hasData = tithingRecords.some(r => r.date.startsWith(month));
    const isCurrentMonth = month === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    
    let label = formatMonthName(month);
    
    if (isCurrentMonth && !hasData) {
      label += ' (Atual)';
    } else if (hasData) {
      label += ' ✓';
    }
    
    return {
      value: month,
      label: label
    };
  });

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: R$ ${parseFloat(entry.value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gold-50 via-olive-50 to-azure-50 rounded-2xl p-6 border border-gold-200 shadow-lg">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 via-olive-500 to-azure-500"></div>
        <div className="absolute top-4 right-4 opacity-20">
          <Heart className="h-16 w-16 text-gold-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dízimos, Ofertas e Votos</h1>
              <p className="text-gray-700">Administre sua fidelidade financeira com propósito cristão</p>
            </div>
            <button 
              onClick={handleShowForm}
              className="btn btn-primary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Novo Registro
            </button>
          </div>
        </div>
      </div>
      
      {/* Scripture Banner - Enhanced Design */}
      <div className="scripture-banner">
        <div className="flex items-start">
          <div className="h-12 w-12 rounded-full bg-gold-200 flex items-center justify-center mr-4 shadow-lg">
            <Church className="h-6 w-6 text-gold-700" />
          </div>
          <div className="flex-1">
            <p className="text-lg leading-relaxed">
              "Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa; 
              e provai-me nisto, diz o Senhor dos Exércitos, se eu não vos abrir as janelas do céu 
              e não derramar sobre vós uma bênção tal, que dela vos advenha a maior abastança."
            </p>
            <cite className="text-sm font-semibold text-gold-800 not-italic mt-2 block">
              — Malaquias 3:10
            </cite>
          </div>
        </div>
      </div>
      
      {/* Month Selection - Enhanced Card */}
      <div className="card p-6 bg-gradient-to-br from-azure-50 via-white to-olive-50 border-2 border-azure-200 shadow-xl min-h-[400px] overflow-visible">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-azure-400 via-olive-400 to-gold-400"></div>
        
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-azure-500 to-olive-500 flex items-center justify-center mr-4 shadow-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Período de Referência</h2>
            <p className="text-sm text-gray-600">Selecione o mês para análise de fidelidade</p>
          </div>
        </div>
        
        {/* Quick Period Selection Buttons */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Seleção Rápida</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(() => {
              const today = new Date();
              const quickOptions = [
                {
                  label: 'Este Mês',
                  value: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
                  icon: Calendar,
                  color: 'from-green-500 to-green-600'
                },
                {
                  label: 'Mês Passado',
                  value: `${today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear()}-${String(today.getMonth() === 0 ? 12 : today.getMonth()).padStart(2, '0')}`,
                  icon: ArrowUp,
                  color: 'from-blue-500 to-blue-600'
                },
                {
                  label: '2 Meses Atrás',
                  value: (() => {
                    const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
                    return `${twoMonthsAgo.getFullYear()}-${String(twoMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
                  })(),
                  icon: TrendingUp,
                  color: 'from-purple-500 to-purple-600'
                },
                {
                  label: '3 Meses Atrás',
                  value: (() => {
                    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                    return `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
                  })(),
                  icon: Target,
                  color: 'from-orange-500 to-orange-600'
                }
              ];
              
              return quickOptions.map((option, index) => {
                const IconComponent = option.icon;
                const isSelected = selectedMonth === option.value;
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedMonth(option.value)}
                    className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      isSelected 
                        ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-gold-100 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-azure-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <p className={`text-xs font-medium ${isSelected ? 'text-gold-800' : 'text-gray-700'}`}>
                      {option.label}
                    </p>
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle className="h-4 w-4 text-gold-600" />
                      </div>
                    )}
                  </button>
                );
              });
            })()}
          </div>
        </div>
        
        {/* Advanced Month Selector */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Seleção Avançada</h3>
            <div className="flex items-center text-xs text-gray-500">
              <Target className="h-3 w-3 mr-1" />
              <span>Busque por qualquer mês/ano</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês Específico
              </label>
              <CustomSelect
                value={selectedMonth}
                onChange={setSelectedMonth}
                options={monthOptions}
                placeholder="Selecione um mês específico"
                searchable={true}
                searchPlaceholder="Ex: janeiro 2025, 01/2025, 2025..."
              />
            </div>
            
            <div className="flex items-end">
              <div className="flex-1 p-4 bg-gradient-to-r from-azure-50 to-olive-50 rounded-lg border border-azure-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-azure-500 to-olive-500 flex items-center justify-center mr-3 shadow-sm">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">📊 Analisando: {formatMonthName(selectedMonth)}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {(() => {
                        const hasData = tithingRecords.some(r => r.date.startsWith(selectedMonth));
                        const isCurrentMonth = selectedMonth === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
                        
                        if (hasData) {
                          return '✅ Período com registros de fidelidade';
                        } else if (isCurrentMonth) {
                          return '📅 Mês atual - comece seus registros';
                        } else {
                          return '📋 Período sem registros ainda';
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tithe Fidelity Card */}
        <div className="card p-6 bg-gradient-to-br from-olive-50 to-olive-100 border-olive-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-olive-200 flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-olive-700" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-olive-800">Dízimos</h3>
              <p className="text-sm text-olive-600">Fidelidade Bíblica</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-olive-700">Meta (10%)</span>
              <span className="font-bold text-olive-800">R$ {recommendedTithe.toLocaleString('pt-BR')}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-olive-700">Atual</span>
              <span className="font-bold text-olive-800">R$ {actualTithe.toLocaleString('pt-BR')}</span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-olive-200 rounded-full h-3 shadow-inner">
                <div 
                  className={`h-3 rounded-full shadow-sm transition-all duration-500 ${
                    tithingPercentage >= 10 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-olive-500 to-olive-600'
                  }`}
                  style={{ width: `${Math.min(tithingPercentage * 10, 100)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-olive-600 mt-1">
                <span>0%</span>
                <span className={`font-bold ${tithingPercentage >= 10 ? 'text-green-700' : 'text-olive-700'}`}>
                  {tithingPercentage.toFixed(1)}%
                </span>
                <span>10%</span>
              </div>
            </div>
            
            {tithingPercentage >= 10 && (
              <div className="flex items-center mt-2 p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-xs text-green-700 font-medium">Fidelidade Alcançada!</span>
              </div>
            )}
            
            {tithingPercentage < 10 && monthlyIncome > 0 && (
              <div className="flex items-center mt-2 p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-xs text-orange-700">
                  Faltam R$ {(recommendedTithe - actualTithe).toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Offerings Card */}
        <div className="card p-6 bg-gradient-to-br from-gold-50 to-gold-100 border-gold-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gold-200 flex items-center justify-center shadow-lg">
              <Gift className="h-6 w-6 text-gold-700" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-gold-800">Ofertas</h3>
              <p className="text-sm text-gold-600">Generosidade</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-gold-800 mb-2">
              R$ {totalOfferings.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-gold-600">
              Além dos dízimos, suas ofertas demonstram um coração generoso e amor ao próximo.
            </p>
            
            {totalOfferings > 0 && (
              <div className="mt-3 p-2 bg-gold-200 rounded-lg">
                <p className="text-xs text-gold-800 font-medium">
                  {((totalOfferings / monthlyIncome) * 100).toFixed(1)}% da receita mensal
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Vows Card */}
        <div className="card p-6 bg-gradient-to-br from-azure-50 to-azure-100 border-azure-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-azure-200 flex items-center justify-center shadow-lg">
              <Target className="h-6 w-6 text-azure-700" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-azure-800">Votos</h3>
              <p className="text-sm text-azure-600">Compromissos</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-azure-800 mb-2">
              R$ {totalVows.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-azure-600">
              Seus votos representam compromissos especiais feitos diante de Deus.
            </p>
            
            {totalVows > 0 && (
              <div className="mt-3 p-2 bg-azure-200 rounded-lg">
                <p className="text-xs text-azure-800 font-medium">
                  Compromissos cumpridos com fidelidade
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Total Giving Card */}
        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-purple-700" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-purple-800">Total</h3>
              <p className="text-sm text-purple-600">Contribuições</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-800 mb-2">
              R$ {totalGiving.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm text-purple-600">
              Soma de todos os dízimos, ofertas e votos do mês.
            </p>
            
            {monthlyIncome > 0 && (
              <div className="mt-3 p-2 bg-purple-200 rounded-lg">
                <p className="text-xs text-purple-800 font-medium">
                  {((totalGiving / monthlyIncome) * 100).toFixed(1)}% da receita total
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Form - Enhanced Design */}
      {showForm && (
        <div id="new-tithing-form" className="card p-6 bg-gradient-to-br from-white to-gray-50 border-2 border-gold-200 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-full bg-gold-100 flex items-center justify-center mr-3 shadow-sm">
              <PlusCircle className="h-5 w-5 text-gold-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Novo Registro de Fidelidade</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Contribuição
                </label>
                <CustomSelect
                  value={formData.type}
                  onChange={(value) => handleSelectChange('type', value)}
                  options={typeOptions}
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="church" className="block text-sm font-medium text-gray-700 mb-2">
                  Destino
                </label>
                <input
                  id="church"
                  name="church"
                  type="text"
                  value={formData.church}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Igreja Local, Missões, Projeto Social, etc."
                  required
                />
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Contribuição
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
              
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Observações Espirituais
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="input-field h-24"
                  placeholder="Motivação, propósito ou reflexão sobre esta contribuição (opcional)"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-outline w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto shadow-lg hover:shadow-xl"
              >
                <Heart className="h-4 w-4 mr-2" />
                Registrar Fidelidade
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Enhanced Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <div className="card p-6 bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-olive-100 flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4 text-olive-600" />
            </div>
            <h2 className="section-title">Distribuição - {formatMonthName(selectedMonth)}</h2>
          </div>
          
          <div className="h-64">
            {givingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={givingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {givingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Heart className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-center">Nenhuma contribuição registrada neste mês</p>
                <p className="text-sm text-center mt-1">Comece registrando sua primeira contribuição</p>
              </div>
            )}
          </div>
          
          {/* Legend */}
          {givingData.length > 0 && (
            <div className="mt-4 space-y-2">
              {givingData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                      R$ {item.value.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {totalGiving > 0 ? ((item.value / totalGiving) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Fidelity Comparison Chart */}
        <div className="card p-6 bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center mb-4">
            <div className="h-8 w-8 rounded-full bg-gold-100 flex items-center justify-center mr-3">
              <Target className="h-4 w-4 text-gold-600" />
            </div>
            <h2 className="section-title">Análise de Fidelidade</h2>
          </div>
          
          <div className="h-64">
            {monthlyIncome > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="recomendado" name="Recomendado (10%)" fill="#f5c935" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="atual" name="Atual" fill="#8fa84b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <DollarSign className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-center">Nenhuma receita registrada neste mês</p>
                <p className="text-sm text-center mt-1">Registre receitas para ver a análise de fidelidade</p>
              </div>
            )}
          </div>
          
          {/* Fidelity Insights */}
          {monthlyIncome > 0 && (
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-gradient-to-r from-gold-50 to-gold-100 rounded-lg border border-gold-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gold-800">Receita do Mês</span>
                  <span className="font-bold text-gold-800">R$ {monthlyIncome.toLocaleString('pt-BR')}</span>
                </div>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-olive-50 to-olive-100 rounded-lg border border-olive-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-olive-800">Diferença</span>
                  <span className={`font-bold ${actualTithe >= recommendedTithe ? 'text-green-700' : 'text-red-700'}`}>
                    {actualTithe >= recommendedTithe ? '+' : ''}R$ {(actualTithe - recommendedTithe).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Records History */}
      <div className="card p-6 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 shadow-sm">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="section-title">Histórico de Fidelidade</h2>
            <p className="text-sm text-gray-600">{formatMonthName(selectedMonth)}</p>
          </div>
        </div>
        
        {sortedRecords.length > 0 ? (
          <div className="space-y-3">
            {sortedRecords.map((record) => (
              <div key={record.id} className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-gold-300 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    {/* Type Icon */}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ${
                      record.type === 'tithe' ? 'bg-olive-100' :
                      record.type === 'offering' ? 'bg-gold-100' : 'bg-azure-100'
                    }`}>
                      {record.type === 'tithe' && <Heart className="h-5 w-5 text-olive-600" />}
                      {record.type === 'offering' && <Gift className="h-5 w-5 text-gold-600" />}
                      {record.type === 'vow' && <Target className="h-5 w-5 text-azure-600" />}
                    </div>
                    
                    {/* Record Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
                          record.type === 'tithe' ? 'bg-olive-100 text-olive-800 border border-olive-200' :
                          record.type === 'offering' ? 'bg-gold-100 text-gold-800 border border-gold-200' :
                          'bg-azure-100 text-azure-800 border border-azure-200'
                        }`}>
                          {record.type === 'tithe' && 'Dízimo'}
                          {record.type === 'offering' && 'Oferta'}
                          {record.type === 'vow' && 'Voto'}
                        </span>
                        
                        <span className="text-sm text-gray-500">
                          {record.date.split('-').reverse().join('/')}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-800 mb-1">{record.church}</h3>
                      
                      {record.notes && (
                        <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded-lg border border-gray-200">
                          "{record.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Amount and Actions */}
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800">
                        R$ {record.amount.toLocaleString('pt-BR')}
                      </p>
                      {monthlyIncome > 0 && (
                        <p className="text-xs text-gray-500">
                          {((record.amount / monthlyIncome) * 100).toFixed(1)}% da receita
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteClick(record)}
                      className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                      title="Excluir"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Nenhum registro em {formatMonthName(selectedMonth)}
            </h3>
            <p className="text-gray-600 mb-6">
              Comece registrando seus dízimos, ofertas e votos para acompanhar sua fidelidade financeira.
            </p>
            <button 
              onClick={handleShowForm}
              className="btn btn-primary shadow-lg hover:shadow-xl"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Primeiro Registro
            </button>
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Excluir Registro"
        message="Tem certeza que deseja excluir este registro de dízimo, oferta ou voto? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        type="danger"
        itemName={confirmModal.recordName}
      />
      
      {/* Enhanced Spiritual Reflection */}
      <div className="relative overflow-hidden bg-gradient-to-br from-olive-50 via-gold-50 to-azure-50 rounded-2xl p-8 border-2 border-gold-300 shadow-xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-olive-500 via-gold-500 to-azure-500"></div>
        <div className="absolute top-4 right-4 opacity-10">
          <Church className="h-24 w-24 text-gold-500" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 rounded-full bg-gold-200 flex items-center justify-center mr-4 shadow-lg">
              <Heart className="h-6 w-6 text-gold-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reflexão Bíblica</h2>
              <p className="text-gray-700">Sobre Fidelidade e Generosidade</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Princípios da Mordomia</h3>
              <p className="text-gray-700 leading-relaxed">
                Ser fiel nos dízimos e ofertas não é apenas sobre dinheiro, mas sobre confiar em Deus como nosso provedor
                e reconhecer que tudo o que temos vem dele. A Bíblia nos ensina que a fidelidade no pouco abre portas para
                fidelidade no muito.
              </p>
              
              <div className="bg-white p-4 rounded-lg border border-gold-200 shadow-sm">
                <p className="text-gold-800 italic text-center">
                  "Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; 
                  porque Deus ama ao que dá com alegria."
                </p>
                <cite className="text-sm font-semibold text-gold-700 not-italic block text-center mt-2">
                  — 2 Coríntios 9:7
                </cite>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Sua Jornada de Fidelidade</h3>
              
              {tithingPercentage >= 10 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Parabéns pela Fidelidade!</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    Você está honrando a Deus com suas finanças, mantendo a fidelidade bíblica nos dízimos.
                    Continue sendo um exemplo de mordomia cristã.
                  </p>
                </div>
              ) : monthlyIncome > 0 ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="font-semibold text-orange-800">Oportunidade de Crescimento</span>
                  </div>
                  <p className="text-orange-700 text-sm">
                    Lembre-se que o dízimo representa nossa gratidão e reconhecimento de que tudo vem de Deus.
                    Considere ajustar gradualmente para alcançar os 10% recomendados.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800">Comece Sua Jornada</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Registre suas receitas para acompanhar sua fidelidade nos dízimos e crescer na mordomia cristã.
                  </p>
                </div>
              )}
              
              {totalOfferings > 0 && (
                <div className="bg-gold-50 border border-gold-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Gift className="h-5 w-5 text-gold-600 mr-2" />
                    <span className="font-semibold text-gold-800">Coração Generoso</span>
                  </div>
                  <p className="text-gold-700 text-sm">
                    Suas ofertas demonstram um coração generoso. Continue desenvolvendo esta virtude cristã
                    que abençoa tanto quem dá quanto quem recebe.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TithingPage;