/*
  # Adicionar tipo de pagamento e banco destinado às transações

  1. Modificações na tabela transactions
    - Adicionar coluna `payment_type` (enum: pix, credito, debito, moeda, boleto)
    - Adicionar coluna `destination_bank_id` (uuid, opcional, para receitas)
    - Adicionar foreign key para bancos

  2. Segurança
    - Manter RLS existente
    - Adicionar constraint para banco destinado apenas em receitas
*/

-- Criar enum para tipos de pagamento
CREATE TYPE IF NOT EXISTS payment_type AS ENUM ('pix', 'credito', 'debito', 'moeda', 'boleto');

-- Adicionar colunas à tabela transactions
DO $$
BEGIN
  -- Adicionar payment_type se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payment_type'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payment_type payment_type DEFAULT 'moeda';
  END IF;

  -- Adicionar destination_bank_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'destination_bank_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN destination_bank_id uuid;
  END IF;
END $$;

-- Adicionar foreign key para destination_bank_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transactions_destination_bank_id_fkey'
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_destination_bank_id_fkey 
    FOREIGN KEY (destination_bank_id) REFERENCES banks(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Adicionar constraint para garantir que destination_bank_id só seja usado em receitas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transactions_destination_bank_check'
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_destination_bank_check 
    CHECK (
      (type = 'expense' AND destination_bank_id IS NULL) OR 
      (type = 'income')
    );
  END IF;
END $$;