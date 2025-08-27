/*
  # Criar tabelas para módulo Bancos

  1. Novas Tabelas
    - `banks` (bancos)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text, nome do banco)
      - `agency` (text, agência)
      - `account_holder` (text, nome do titular)
      - `investments_info` (text, informações sobre investimentos)
      - `created_at` (timestamp)
    
    - `account_balances` (saldos da conta)
      - `id` (uuid, primary key)
      - `bank_id` (uuid, foreign key)
      - `balance` (numeric, saldo)
      - `date` (date, data do saldo)
      - `notes` (text, observações)
      - `created_at` (timestamp)
    
    - `investments` (investimentos)
      - `id` (uuid, primary key)
      - `bank_id` (uuid, foreign key)
      - `type` (text, tipo de investimento)
      - `initial_value` (numeric, valor inicial)
      - `final_value` (numeric, valor final esperado)
      - `period_type` (text, periódico ou permanente)
      - `start_date` (date, data de início)
      - `end_date` (date, data de fim - opcional)
      - `notes` (text, observações)
      - `created_at` (timestamp)
    
    - `cards` (cartões)
      - `id` (uuid, primary key)
      - `bank_id` (uuid, foreign key)
      - `type` (text, débito ou crédito)
      - `expiry_date` (date, data de validade)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para usuários autenticados acessarem apenas seus próprios dados
*/

-- Criar tabela de bancos
CREATE TABLE IF NOT EXISTS banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  agency text NOT NULL,
  account_holder text NOT NULL,
  investments_info text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de saldos da conta
CREATE TABLE IF NOT EXISTS account_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de investimentos
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  type text NOT NULL,
  initial_value numeric(12,2) NOT NULL DEFAULT 0,
  final_value numeric(12,2),
  period_type text NOT NULL CHECK (period_type IN ('periodico', 'permanente')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de cartões
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('debito', 'credito')),
  expiry_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Políticas para banks
CREATE POLICY "Users can view own banks"
  ON banks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own banks"
  ON banks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own banks"
  ON banks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own banks"
  ON banks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Políticas para account_balances
CREATE POLICY "Users can view own account balances"
  ON account_balances FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = account_balances.bank_id 
    AND banks.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own account balances"
  ON account_balances FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = account_balances.bank_id 
    AND banks.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own account balances"
  ON account_balances FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = account_balances.bank_id 
    AND banks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own account balances"
  ON account_balances FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = account_balances.bank_id 
    AND banks.user_id = auth.uid()
  ));

-- Políticas para investments
CREATE POLICY "Users can view own investments"
  ON investments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = investments.bank_id 
    AND banks.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own investments"
  ON investments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = investments.bank_id 
    AND banks.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own investments"
  ON investments FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = investments.bank_id 
    AND banks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own investments"
  ON investments FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = investments.bank_id 
    AND banks.user_id = auth.uid()
  ));

-- Políticas para cards
CREATE POLICY "Users can view own cards"
  ON cards FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = cards.bank_id 
    AND banks.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own cards"
  ON cards FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = cards.bank_id 
    AND banks.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = cards.bank_id 
    AND banks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own cards"
  ON cards FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM banks 
    WHERE banks.id = cards.bank_id 
    AND banks.user_id = auth.uid()
  ));

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_banks_user_id ON banks(user_id);
CREATE INDEX IF NOT EXISTS idx_account_balances_bank_id ON account_balances(bank_id);
CREATE INDEX IF NOT EXISTS idx_investments_bank_id ON investments(bank_id);
CREATE INDEX IF NOT EXISTS idx_cards_bank_id ON cards(bank_id);