/*
  # Fix users table RLS policies

  1. Changes
    - Add INSERT policy for users table to allow new users to create their profile
    - Ensure users can only insert their own data (id must match auth.uid())
  
  2. Security
    - Maintains existing RLS policies for SELECT and UPDATE
    - New INSERT policy follows same security principles
    - Only allows users to insert their own profile data
*/

CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);