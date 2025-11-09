/*
  # Create client profiles table

  1. New Tables
    - `client_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `company_name` (text, nullable)
      - `budget` (numeric)
      - `total_spent` (numeric)
      - `posted_jobs` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `client_profiles` table
    - Add policies for clients to manage their own profiles
*/

-- REMOVED: migration replaced during JS conversion
CREATE TABLE IF NOT EXISTS client_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own profile"
  ON client_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can update own profile"
  ON client_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_client_profiles_user_id ON client_profiles(user_id);
