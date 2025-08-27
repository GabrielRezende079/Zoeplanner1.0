/*
  # Create expenses table

  1. New Tables
    - `expenses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text, expense name)
      - `amount` (numeric, expense amount)
      - `category` (text, expense category)
      - `date` (date, expense date)
      - `status` (text, payment status: 'paid' or 'pending')
      - `notes` (text, optional notes)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `expenses` table
    - Add policies for authenticated users to manage their own expenses
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  category text NOT NULL,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('paid', 'pending')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS expenses_user_id_date_idx ON expenses(user_id, date DESC);