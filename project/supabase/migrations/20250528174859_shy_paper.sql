/*
  # Fix Users Table RLS Policies

  1. Changes
    - Drop existing RLS policies for users table
    - Create new policies that properly handle:
      - User registration (INSERT)
      - Profile viewing (SELECT)
      - Profile updates (UPDATE)
      - Profile deletion (DELETE)

  2. Security
    - Enable RLS on users table
    - Add policies for all CRUD operations
    - Ensure users can only access their own data
    - Allow new user registration
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create new policies
CREATE POLICY "Enable user registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);