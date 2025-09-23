import { create } from "zustand";
import {
  supabase,
  type DbTransaction,
  type DbTithing,
  type DbGoal,
  type DbExpense,
} from "../lib/supabase";
import { useAuth } from "./authStore";
import { useBanks } from "./banksStore";

export type TransactionType = DbTransaction["type"];
export type PaymentType = DbTransaction["payment_type"];
export type Transaction = Omit<DbTransaction, "user_id" | "created_at">;
export type Tithing = Omit<DbTithing, "user_id" | "created_at">;
export type Goal = Omit<DbGoal, "user_id" | "created_at">;
export type Expense = Omit<DbExpense, "user_id" | "created_at">;

interface FinanceState {
  transactions: Transaction[];
  tithingRecords: Tithing[];
  goals: Goal[];
  expenses: Expense[];
  isDataLoaded: boolean;

  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;

  // Tithing methods
  addTithingRecord: (record: Omit<Tithing, "id">) => Promise<void>;
  removeTithingRecord: (id: string) => Promise<void>;

  // Goal methods
  addGoal: (goal: Omit<Goal, "id">) => Promise<void>;
  updateGoalProgress: (id: string, amount: number) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;

  // Expense methods
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;

  // Statistics
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getTotalTithes: () => number;
  getTotalOfferings: () => number;
  getTotalVows: () => number;
  getTotalGiving: () => number;
  getBalance: () => number;
  getNetBalance: () => number;
  getMonthlyExpenses: (month?: string) => number;

  // Data loading
  loadUserData: () => Promise<void>;
}

export const useFinance = create<FinanceState>((set, get) => ({
  updateTransaction: async (transaction: Transaction) => {
    const user = useAuth.getState().user;
    if (!user) throw new Error("User not authenticated");

    // Atualizar no banco
    const { error } = await supabase
      .from("transactions")
      .update({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        payment_type: transaction.payment_type,
        destination_bank_id: transaction.destination_bank_id,
      })
      .eq("id", transaction.id);

    if (error) {
      console.error("❌ Erro ao atualizar transação:", error);
      throw error;
    }

    // Atualizar no estado local
    set((state: FinanceState) => ({
      transactions: state.transactions.map((t: Transaction) =>
        t.id === transaction.id ? { ...t, ...transaction } : t
      ),
    }));
  },
  transactions: [],
  tithingRecords: [],
  goals: [],
  expenses: [],
  isDataLoaded: false,

  loadUserData: async () => {
    const user = useAuth.getState().user;
    if (!user) {
      console.log("❌ Usuário não autenticado - não é possível carregar dados");
      return;
    }

    if (get().isDataLoaded) {
      console.log("ℹ️ Dados já carregados");
      return;
    }

    try {
      console.log("📊 Carregando dados do usuário:", user.id);

      const [
        { data: transactions, error: transactionsError },
        { data: tithings, error: tithingsError },
        { data: goals, error: goalsError },
        { data: expenses, error: expensesError },
      ] = await Promise.all([
        supabase
          .from("transactions")
          .select(
            "id, user_id, type, amount, description, category, date, payment_type, destination_bank_id, created_at"
          )
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
        supabase
          .from("tithings")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
        supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("expenses")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false }),
      ]);

      // Log any errors
      if (transactionsError)
        console.error("❌ Erro ao carregar transações:", transactionsError);
      if (tithingsError)
        console.error("❌ Erro ao carregar dízimos:", tithingsError);
      if (goalsError) console.error("❌ Erro ao carregar metas:", goalsError);
      if (expensesError)
        console.error("❌ Erro ao carregar despesas:", expensesError);

      console.log("📈 Dados carregados:", {
        transactions: transactions?.length || 0,
        tithings: tithings?.length || 0,
        goals: goals?.length || 0,
        expenses: expenses?.length || 0,
      });

      set({
        transactions: transactions || [],
        tithingRecords: tithings || [],
        goals: goals || [],
        expenses: expenses || [],
        isDataLoaded: true,
      });
    } catch (error) {
      console.error("❌ Error loading user data:", error);
    }
  },

  addTransaction: async (transaction) => {
    const user = useAuth.getState().user;
    if (!user) throw new Error("User not authenticated");

    console.log("➕ Adicionando transação:", transaction);
    console.log("Data sendo enviada para o banco:", transaction.date);

    // Especificar apenas as colunas que existem na tabela
    const transactionData = {
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      payment_type: transaction.payment_type,
      destination_bank_id: transaction.destination_bank_id,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert([transactionData])
      .select(
        "id, user_id, type, amount, description, category, date, payment_type, destination_bank_id, created_at"
      )
      .single();

    if (error) {
      console.error("❌ Erro ao adicionar transação:", error);
      throw error;
    }

    console.log("✅ Transação adicionada com sucesso");
    console.log("Data salva no banco:", data.date);

    // Atualizar saldo do banco apenas se um banco foi especificado
    // Transações sem banco são contabilizadas diretamente no saldo geral
    if (transaction.destination_bank_id) {
      try {
        const banksStore = useBanks.getState();
        const bankBalances = banksStore.getBankBalances(
          transaction.destination_bank_id
        );

        // Pegar o saldo mais recente do banco
        let currentBalance = 0;
        if (bankBalances.length > 0) {
          const latestBalance = bankBalances.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          currentBalance = latestBalance.balance;
        }

        // Calcular novo saldo baseado no tipo de transação
        const balanceChange =
          transaction.type === "income"
            ? transaction.amount
            : -transaction.amount;
        const newBalance = currentBalance + balanceChange;

        console.log("💰 Atualizando saldo do banco:", {
          bankId: transaction.destination_bank_id,
          currentBalance,
          balanceChange,
          newBalance,
        });

        // Adicionar novo registro de saldo
        await banksStore.addAccountBalance({
          bank_id: transaction.destination_bank_id,
          balance: newBalance,
          date: transaction.date,
          notes: `Atualização automática - ${
            transaction.type === "income" ? "Receita" : "Despesa"
          }: ${transaction.description}`,
        });

        console.log("✅ Saldo do banco atualizado automaticamente");
      } catch (balanceError) {
        console.error(
          "⚠️ Erro ao atualizar saldo do banco (transação foi salva):",
          balanceError
        );
        // Não falha a transação se houver erro no saldo
      }
    } else {
      console.log(
        "ℹ️ Transação sem banco específico - contabilizada no saldo geral"
      );
    }

    set((state) => ({
      transactions: [data, ...state.transactions],
    }));
  },

  removeTransaction: async (id) => {
    // Buscar a transação antes de deletar para reverter o saldo
    const transactionToDelete = get().transactions.find((t) => t.id === id);

    console.log("🗑️ Removendo transação:", id);

    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      console.error("❌ Erro ao remover transação:", error);
      throw error;
    }

    console.log("✅ Transação removida com sucesso");

    // Reverter saldo do banco apenas se um banco foi especificado
    // Transações sem banco são automaticamente removidas do saldo geral
    if (transactionToDelete?.destination_bank_id) {
      try {
        const banksStore = useBanks.getState();
        const bankBalances = banksStore.getBankBalances(
          transactionToDelete.destination_bank_id
        );

        // Pegar o saldo mais recente do banco
        let currentBalance = 0;
        if (bankBalances.length > 0) {
          const latestBalance = bankBalances.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          currentBalance = latestBalance.balance;
        }

        // Calcular reversão do saldo (oposto da operação original)
        const balanceChange =
          transactionToDelete.type === "income"
            ? -transactionToDelete.amount
            : transactionToDelete.amount;
        const newBalance = currentBalance + balanceChange;

        console.log("💰 Revertendo saldo do banco:", {
          bankId: transactionToDelete.destination_bank_id,
          currentBalance,
          balanceChange,
          newBalance,
          transactionType: transactionToDelete.type,
          transactionAmount: transactionToDelete.amount,
        });

        // Adicionar novo registro de saldo com a reversão
        await banksStore.addAccountBalance({
          bank_id: transactionToDelete.destination_bank_id,
          balance: newBalance,
          date: new Date().toISOString().split("T")[0], // Data atual para a reversão
          notes: `Reversão automática - ${
            transactionToDelete.type === "income" ? "Receita" : "Despesa"
          } removida: ${transactionToDelete.description}`,
        });

        console.log("✅ Saldo do banco revertido automaticamente");
      } catch (balanceError) {
        console.error(
          "⚠️ Erro ao reverter saldo do banco (transação foi removida):",
          balanceError
        );
        // Não falha a remoção se houver erro na reversão do saldo
      }
    } else {
      console.log(
        "ℹ️ Transação sem banco específico removida - saldo geral atualizado automaticamente"
      );
    }

    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
  },

  addTithingRecord: async (record) => {
    const user = useAuth.getState().user;
    if (!user) throw new Error("User not authenticated");

    console.log("➕ Adicionando dízimo/oferta:", record);
    console.log("Data sendo enviada para o banco (dízimo):", record.date);

    const { data, error } = await supabase
      .from("tithings")
      .insert([{ ...record, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao adicionar dízimo/oferta:", error);
      throw error;
    }

    console.log("✅ Dízimo/oferta adicionado com sucesso");
    console.log("Data salva no banco (dízimo):", data.date);

    set((state) => ({
      tithingRecords: [data, ...state.tithingRecords],
    }));
  },

  removeTithingRecord: async (id) => {
    console.log("🗑️ Removendo dízimo/oferta:", id);

    const { error } = await supabase.from("tithings").delete().eq("id", id);

    if (error) {
      console.error("❌ Erro ao remover dízimo/oferta:", error);
      throw error;
    }

    console.log("✅ Dízimo/oferta removido com sucesso");

    set((state) => ({
      tithingRecords: state.tithingRecords.filter((r) => r.id !== id),
    }));
  },

  addGoal: async (goal) => {
    const user = useAuth.getState().user;
    if (!user) throw new Error("User not authenticated");

    console.log("➕ Adicionando meta:", goal);
    console.log("Data sendo enviada para o banco (meta):", goal.deadline);

    const { data, error } = await supabase
      .from("goals")
      .insert([{ ...goal, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao adicionar meta:", error);
      throw error;
    }

    console.log("✅ Meta adicionada com sucesso");
    console.log("Data salva no banco (meta):", data.deadline);

    set((state) => ({
      goals: [data, ...state.goals],
    }));
  },

  updateGoalProgress: async (id, amount) => {
    const goal = get().goals.find((g) => g.id === id);
    if (!goal) throw new Error("Goal not found");

    const newAmount = Math.min(
      goal.current_amount + amount,
      goal.target_amount
    );

    console.log("📈 Atualizando progresso da meta:", { id, amount, newAmount });

    const { error } = await supabase
      .from("goals")
      .update({ current_amount: newAmount })
      .eq("id", id);

    if (error) {
      console.error("❌ Erro ao atualizar meta:", error);
      throw error;
    }

    console.log("✅ Meta atualizada com sucesso");

    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, current_amount: newAmount } : g
      ),
    }));
  },

  updateGoal: async (id, updates) => {
    console.log("📝 Atualizando meta:", { id, updates });

    const { error } = await supabase.from("goals").update(updates).eq("id", id);

    if (error) {
      console.error("❌ Erro ao atualizar meta:", error);
      throw error;
    }

    console.log("✅ Meta atualizada com sucesso");

    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  },

  removeGoal: async (id) => {
    console.log("🗑️ Removendo meta:", id);

    const { error } = await supabase.from("goals").delete().eq("id", id);

    if (error) {
      console.error("❌ Erro ao remover meta:", error);
      throw error;
    }

    console.log("✅ Meta removida com sucesso");

    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
    }));
  },

  addExpense: async (expense) => {
    const user = useAuth.getState().user;
    if (!user) throw new Error("User not authenticated");

    console.log("➕ Adicionando despesa:", expense);
    console.log("Data sendo enviada para o banco (despesa):", expense.date);

    const { data, error } = await supabase
      .from("expenses")
      .insert([{ ...expense, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao adicionar despesa:", error);
      throw error;
    }

    console.log("✅ Despesa adicionada com sucesso");
    console.log("Data salva no banco (despesa):", data.date);

    set((state) => ({
      expenses: [data, ...state.expenses],
    }));
  },

  updateExpense: async (id, updates) => {
    console.log("📝 Atualizando despesa:", { id, updates });

    const { error } = await supabase
      .from("expenses")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("❌ Erro ao atualizar despesa:", error);
      throw error;
    }

    console.log("✅ Despesa atualizada com sucesso");

    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  },

  removeExpense: async (id) => {
    console.log("🗑️ Removendo despesa:", id);

    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      console.error("❌ Erro ao remover despesa:", error);
      throw error;
    }

    console.log("✅ Despesa removida com sucesso");

    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
  },

  getTotalIncome: () => {
    return get()
      .transactions.filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalExpenses: () => {
    return get()
      .transactions.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  },

  getTotalTithes: () => {
    return get()
      .tithingRecords.filter((r) => r.type === "tithe")
      .reduce((sum, r) => sum + r.amount, 0);
  },

  getTotalOfferings: () => {
    return get()
      .tithingRecords.filter((r) => r.type === "offering")
      .reduce((sum, r) => sum + r.amount, 0);
  },

  getTotalVows: () => {
    return get()
      .tithingRecords.filter((r) => r.type === "vow")
      .reduce((sum, r) => sum + r.amount, 0);
  },

  getTotalGiving: () => {
    return get().tithingRecords.reduce((sum, r) => sum + r.amount, 0);
  },

  // Saldo básico (receitas - despesas)
  getBalance: () => {
    return get().getTotalIncome() - get().getTotalExpenses();
  },

  // Saldo líquido (receitas - despesas - dízimos - ofertas - votos)
  getNetBalance: () => {
    const banksStore = useBanks.getState();
    const state = get();

    // Calcular saldo total dos bancos (saldo mais recente de cada banco)
    const totalBankBalance = banksStore.banks.reduce((total, bank) => {
      const bankBalances = banksStore.getBankBalances(bank.id);
      if (bankBalances.length > 0) {
        // Pegar o saldo mais recente do banco
        const latestBalance = bankBalances.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        return total + latestBalance.balance;
      }
      return total;
    }, 0);

    // Adicionar transações sem banco específico ao saldo geral
    const transactionsWithoutBank = state.transactions.filter(
      (t) => !t.destination_bank_id
    );
    const generalBalance = transactionsWithoutBank.reduce(
      (sum, transaction) => {
        return transaction.type === "income"
          ? sum + transaction.amount
          : sum - transaction.amount;
      },
      0
    );

    return totalBankBalance + generalBalance;
  },

  getMonthlyExpenses: (month?: string) => {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    return get()
      .expenses.filter((e) => e.date.startsWith(targetMonth))
      .reduce((sum, e) => sum + e.amount, 0);
  },
}));
