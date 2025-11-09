/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Maps to auth.users.id
      - `email` (text, unique)
      - `name` (text)
      - `avatar` (text, nullable)
      - `role` ('freelancer' | 'client')
      - `phone` (text, nullable)
      - `bio` (text, nullable)
      - `location` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for users to update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar text,
  role text NOT NULL CHECK (role IN ('freelancer', 'client')),
  phone text,
  bio text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

  -- REMOVED: migration replaced during JS conversion
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

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
