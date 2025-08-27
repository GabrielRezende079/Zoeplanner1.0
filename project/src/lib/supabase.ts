import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export type DbUser = {
  id: string;
  email: string;
  name: string;
  difficulty?: string;
  tithing_practice?: boolean;
  main_goal?: string;
  created_at: string;
};

export type DbTransaction = {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  payment_type: 'pix' | 'credito' | 'debito' | 'moeda' | 'boleto';
  destination_bank_id?: string;
  created_at: string;
};

export type DbTithing = {
  id: string;
  user_id: string;
  amount: number;
  church: string;
  date: string;
  type: 'tithe' | 'offering' | 'vow';
  notes?: string;
  created_at: string;
};

export type DbGoal = {
  id: string;
  user_id: string;
  title: string;
  category: 'mission' | 'personal' | 'study' | 'debt' | 'giving';
  target_amount: number;
  current_amount: number;
  deadline: string;
  notes?: string;
  created_at: string;
};

export type DbExpense = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  status: 'paid' | 'pending';
  notes?: string;
  billing_type: 'unique' | 'monthly' | 'yearly';
  billing_day?: number;
  billing_month?: number;
  created_at: string;
};

export type DbBank = {
  id: string;
  user_id: string;
  name: string;
  agency: string;
  account_holder: string;
  investments_info?: string;
  created_at: string;
};

export type DbAccountBalance = {
  id: string;
  bank_id: string;
  balance: number;
  date: string;
  notes?: string;
  created_at: string;
};

export type DbInvestment = {
  id: string;
  bank_id: string;
  type: string;
  initial_value: number;
  final_value?: number;
  period_type: 'periodico' | 'permanente';
  start_date: string;
  end_date?: string;
  notes?: string;
  created_at: string;
};

export type DbCard = {
  id: string;
  bank_id: string;
  type: 'debito' | 'credito';
  expiry_date: string;
  created_at: string;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);