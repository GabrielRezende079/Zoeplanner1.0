/*
  # Adicionar campos de banco e tipo de pagamento às transações

  1. Modificações na tabela transactions
    - Adicionar coluna `destination_bank_id` (uuid, opcional) - referência ao banco de destino
    - Adicionar coluna `payment_type` (text, obrigatório) - tipo de pagamento (pix, credito, debito, moeda, boleto)
    - Adicionar constraint para validar payment_type
    - Adicionar foreign key para destination_bank_id

  2. Segurança
    - Manter RLS existente
    - Políticas existentes continuam válidas
*/

-- Adicionar coluna destination_bank_id (opcional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'destination_bank_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN destination_bank_id uuid;
  END IF;
END $$;

-- Adicionar coluna payment_type (obrigatório com valor padrão)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payment_type'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payment_type text NOT NULL DEFAULT 'moeda';
  END IF;
END $$;

-- Adicionar constraint para validar payment_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transactions_payment_type_check'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_payment_type_check 
    CHECK (payment_type IN ('pix', 'credito', 'debito', 'moeda', 'boleto'));
  END IF;
END $$;

-- Adicionar foreign key para destination_bank_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transactions_destination_bank_id_fkey'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_destination_bank_id_fkey 
    FOREIGN KEY (destination_bank_id) REFERENCES banks(id) ON DELETE SET NULL;
  END IF;
END $$;