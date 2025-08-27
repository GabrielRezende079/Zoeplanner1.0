import { create } from 'zustand';
import { supabase, type DbBank, type DbAccountBalance, type DbInvestment, type DbCard } from '../lib/supabase';
import { useAuth } from './authStore';

export type Bank = Omit<DbBank, 'user_id' | 'created_at'>;
export type AccountBalance = Omit<DbAccountBalance, 'created_at'>;
export type Investment = Omit<DbInvestment, 'created_at'>;
export type Card = Omit<DbCard, 'created_at'>;

interface BanksState {
  banks: Bank[];
  accountBalances: AccountBalance[];
  investments: Investment[];
  cards: Card[];
  isDataLoaded: boolean;
  
  // Bank methods
  addBank: (bank: Omit<Bank, 'id'>) => Promise<void>;
  updateBank: (id: string, updates: Partial<Bank>) => Promise<void>;
  removeBank: (id: string) => Promise<void>;
  
  // Account Balance methods
  addAccountBalance: (balance: Omit<AccountBalance, 'id'>) => Promise<void>;
  updateAccountBalance: (id: string, updates: Partial<AccountBalance>) => Promise<void>;
  removeAccountBalance: (id: string) => Promise<void>;
  
  // Investment methods
  addInvestment: (investment: Omit<Investment, 'id'>) => Promise<void>;
  updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>;
  removeInvestment: (id: string) => Promise<void>;
  
  // Card methods
  addCard: (card: Omit<Card, 'id'>) => Promise<void>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  
  // Data loading
  loadBanksData: () => Promise<void>;
  
  // Utility methods
  getBankBalances: (bankId: string) => AccountBalance[];
  getBankInvestments: (bankId: string) => Investment[];
  getBankCards: (bankId: string) => Card[];
  getCreditCardBill: (bankId: string) => Promise<number>;
}

export const useBanks = create<BanksState>((set, get) => ({
  banks: [],
  accountBalances: [],
  investments: [],
  cards: [],
  isDataLoaded: false,
  
  loadBanksData: async () => {
    const user = useAuth.getState().user;
    if (!user) {
      console.log('❌ Usuário não autenticado - não é possível carregar dados dos bancos');
      return;
    }
    
    if (get().isDataLoaded) {
      console.log('ℹ️ Dados dos bancos já carregados');
      return;
    }
    
    try {
      console.log('🏦 Carregando dados dos bancos:', user.id);
      
      const [
        { data: banks, error: banksError },
        { data: balances, error: balancesError },
        { data: investments, error: investmentsError },
        { data: cards, error: cardsError }
      ] = await Promise.all([
        supabase
          .from('banks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('account_balances')
          .select('*')
          .order('date', { ascending: false }),
        supabase
          .from('investments')
          .select('*')
          .order('start_date', { ascending: false }),
        supabase
          .from('cards')
          .select('*')
          .order('created_at', { ascending: false })
      ]);
      
      // Log any errors
      if (banksError) console.error('❌ Erro ao carregar bancos:', banksError);
      if (balancesError) console.error('❌ Erro ao carregar saldos:', balancesError);
      if (investmentsError) console.error('❌ Erro ao carregar investimentos:', investmentsError);
      if (cardsError) console.error('❌ Erro ao carregar cartões:', cardsError);
      
      console.log('🏦 Dados carregados:', {
        banks: banks?.length || 0,
        balances: balances?.length || 0,
        investments: investments?.length || 0,
        cards: cards?.length || 0
      });
      
      set({
        banks: banks || [],
        accountBalances: balances || [],
        investments: investments || [],
        cards: cards || [],
        isDataLoaded: true
      });
    } catch (error) {
      console.error('❌ Error loading banks data:', error);
    }
  },
  
  addBank: async (bank) => {
    const user = useAuth.getState().user;
    if (!user) throw new Error('User not authenticated');
    
    console.log('➕ Adicionando banco:', bank);
    
    const { data, error } = await supabase
      .from('banks')
      .insert([{ ...bank, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao adicionar banco:', error);
      throw error;
    }
    
    console.log('✅ Banco adicionado com sucesso');
    
    set((state) => ({
      banks: [data, ...state.banks]
    }));
  },
  
  updateBank: async (id, updates) => {
    console.log('📝 Atualizando banco:', { id, updates });
    
    const { error } = await supabase
      .from('banks')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao atualizar banco:', error);
      throw error;
    }
    
    console.log('✅ Banco atualizado com sucesso');
    
    set((state) => ({
      banks: state.banks.map(b => 
        b.id === id ? { ...b, ...updates } : b
      )
    }));
  },
  
  removeBank: async (id) => {
    console.log('🗑️ Removendo banco:', id);
    
    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao remover banco:', error);
      throw error;
    }
    
    console.log('✅ Banco removido com sucesso');
    
    set((state) => ({
      banks: state.banks.filter(b => b.id !== id),
      accountBalances: state.accountBalances.filter(ab => ab.bank_id !== id),
      investments: state.investments.filter(i => i.bank_id !== id),
      cards: state.cards.filter(c => c.bank_id !== id)
    }));
  },
  
  addAccountBalance: async (balance) => {
    console.log('➕ Adicionando saldo:', balance);
    
    const { data, error } = await supabase
      .from('account_balances')
      .insert([balance])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao adicionar saldo:', error);
      throw error;
    }
    
    console.log('✅ Saldo adicionado com sucesso');
    
    set((state) => ({
      accountBalances: [data, ...state.accountBalances]
    }));
  },
  
  updateAccountBalance: async (id, updates) => {
    console.log('📝 Atualizando saldo:', { id, updates });
    
    const { error } = await supabase
      .from('account_balances')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao atualizar saldo:', error);
      throw error;
    }
    
    console.log('✅ Saldo atualizado com sucesso');
    
    set((state) => ({
      accountBalances: state.accountBalances.map(ab => 
        ab.id === id ? { ...ab, ...updates } : ab
      )
    }));
  },
  
  removeAccountBalance: async (id) => {
    console.log('🗑️ Removendo saldo:', id);
    
    const { error } = await supabase
      .from('account_balances')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao remover saldo:', error);
      throw error;
    }
    
    console.log('✅ Saldo removido com sucesso');
    
    set((state) => ({
      accountBalances: state.accountBalances.filter(ab => ab.id !== id)
    }));
  },
  
  addInvestment: async (investment) => {
    console.log('➕ Adicionando investimento:', investment);
    
    const { data, error } = await supabase
      .from('investments')
      .insert([investment])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao adicionar investimento:', error);
      throw error;
    }
    
    console.log('✅ Investimento adicionado com sucesso');
    
    set((state) => ({
      investments: [data, ...state.investments]
    }));
  },
  
  updateInvestment: async (id, updates) => {
    console.log('📝 Atualizando investimento:', { id, updates });
    
    const { error } = await supabase
      .from('investments')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao atualizar investimento:', error);
      throw error;
    }
    
    console.log('✅ Investimento atualizado com sucesso');
    
    set((state) => ({
      investments: state.investments.map(i => 
        i.id === id ? { ...i, ...updates } : i
      )
    }));
  },
  
  removeInvestment: async (id) => {
    console.log('🗑️ Removendo investimento:', id);
    
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao remover investimento:', error);
      throw error;
    }
    
    console.log('✅ Investimento removido com sucesso');
    
    set((state) => ({
      investments: state.investments.filter(i => i.id !== id)
    }));
  },
  
  addCard: async (card) => {
    console.log('➕ Adicionando cartão:', card);
    
    const { data, error } = await supabase
      .from('cards')
      .insert([card])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao adicionar cartão:', error);
      throw error;
    }
    
    console.log('✅ Cartão adicionado com sucesso');
    
    set((state) => ({
      cards: [data, ...state.cards]
    }));
  },
  
  updateCard: async (id, updates) => {
    console.log('📝 Atualizando cartão:', { id, updates });
    
    const { error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao atualizar cartão:', error);
      throw error;
    }
    
    console.log('✅ Cartão atualizado com sucesso');
    
    set((state) => ({
      cards: state.cards.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    }));
  },
  
  removeCard: async (id) => {
    console.log('🗑️ Removendo cartão:', id);
    
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao remover cartão:', error);
      throw error;
    }
    
    console.log('✅ Cartão removido com sucesso');
    
    set((state) => ({
      cards: state.cards.filter(c => c.id !== id)
    }));
  },
  
  getBankBalances: (bankId: string) => {
    return get().accountBalances.filter(ab => ab.bank_id === bankId);
  },
  
  getBankInvestments: (bankId: string) => {
    return get().investments.filter(i => i.bank_id === bankId);
  },
  
  getBankCards: (bankId: string) => {
    return get().cards.filter(c => c.bank_id === bankId);
  },
  
  getCreditCardBill: async (bankId: string) => {
    try {
      // Get credit cards for this bank
      const creditCards = get().cards.filter(c => c.bank_id === bankId && c.type === 'credito');
      
      if (creditCards.length === 0) return 0;
      
      // Get current month expenses from credit category
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('amount')
        .eq('category', 'Crédito')
        .gte('date', `${currentMonth}-01`)
        .lt('date', `${currentMonth}-32`);
      
      if (error) {
        console.error('❌ Erro ao calcular fatura:', error);
        return 0;
      }
      
      return expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    } catch (error) {
      console.error('❌ Error calculating credit card bill:', error);
      return 0;
    }
  }
}));