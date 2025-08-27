/*
  # Adicionar campos de cobrança à tabela expenses

  1. Novos Campos
    - `billing_type` (enum): Tipo de cobrança - 'unique', 'monthly', 'yearly'
    - `billing_day` (integer): Dia da cobrança (1-31 para mensal, 1-365 para anual)
    - `billing_month` (integer): Mês da cobrança (1-12, apenas para cobrança anual)

  2. Segurança
    - Manter RLS existente
    - Adicionar constraints para validação dos dados
*/

-- Criar enum para tipo de cobrança
DO $$ BEGIN
    CREATE TYPE billing_type AS ENUM ('unique', 'monthly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar colunas à tabela expenses
DO $$
BEGIN
  -- Adicionar billing_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'billing_type'
  ) THEN
    ALTER TABLE expenses ADD COLUMN billing_type billing_type DEFAULT 'unique';
  END IF;

  -- Adicionar billing_day
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'billing_day'
  ) THEN
    ALTER TABLE expenses ADD COLUMN billing_day integer;
  END IF;

  -- Adicionar billing_month (apenas para cobrança anual)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'billing_month'
  ) THEN
    ALTER TABLE expenses ADD COLUMN billing_month integer;
  END IF;
END $$;

-- Adicionar constraints de validação
DO $$
BEGIN
  -- Constraint para billing_day (1-31 para mensal, 1-365 para anual)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'expenses_billing_day_check'
  ) THEN
    ALTER TABLE expenses ADD CONSTRAINT expenses_billing_day_check 
    CHECK (
      (billing_type = 'unique' AND billing_day IS NULL) OR
      (billing_type = 'monthly' AND billing_day >= 1 AND billing_day <= 31) OR
      (billing_type = 'yearly' AND billing_day >= 1 AND billing_day <= 365)
    );
  END IF;

  -- Constraint para billing_month (1-12, apenas para cobrança anual)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'expenses_billing_month_check'
  ) THEN
    ALTER TABLE expenses ADD CONSTRAINT expenses_billing_month_check 
    CHECK (
      (billing_type IN ('unique', 'monthly') AND billing_month IS NULL) OR
      (billing_type = 'yearly' AND billing_month >= 1 AND billing_month <= 12)
    );
  END IF;
END $$;

-- Atualizar registros existentes para ter billing_type = 'unique'
UPDATE expenses SET billing_type = 'unique' WHERE billing_type IS NULL;